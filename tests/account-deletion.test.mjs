import test from "node:test";
import assert from "node:assert/strict";
import { deleteAccountData } from "../backend/alerts-worker.js";

function fakeDb(){
  const prepared=[];
  let batchStatements=null;
  return {
    prepared,
    get batchStatements(){return batchStatements;},
    prepare(sql){
      return {
        bind(...args){
          const statement={sql,args};
          prepared.push(statement);
          return statement;
        }
      };
    },
    async batch(statements){
      batchStatements=statements;
      return statements.map(()=>({success:true}));
    }
  };
}

test("account deletion removes only the authenticated user's account graph in one D1 batch",async()=>{
  const DB=fakeDb();
  const result=await deleteAccountData(
    {DB},
    {userId:"usr_owner",emailNorm:"owner@example.com"}
  );
  assert.deepEqual(result,{ok:true,deleted:true});
  assert.equal(DB.batchStatements.length,7);

  const sql=DB.batchStatements.map(x=>x.sql);
  assert.ok(sql.some(x=>x.includes("DELETE FROM notification_queue")));
  assert.ok(sql.some(x=>x.includes("DELETE FROM hunt_matches")));
  assert.ok(sql.some(x=>x.includes("DELETE FROM monitor_runs")));
  assert.ok(sql.some(x=>x==="DELETE FROM saved_hunts WHERE owner_id = ?"));
  assert.ok(sql.some(x=>x==="DELETE FROM auth_tokens WHERE email_norm = ?"));
  assert.ok(sql.some(x=>x==="DELETE FROM sessions WHERE user_id = ?"));
  assert.ok(sql.some(x=>x==="DELETE FROM users WHERE id = ?"));

  for(const statement of DB.batchStatements.filter(x=>x.sql.includes("saved_hunts")||x.sql.includes("sessions")||x.sql.includes("users"))){
    assert.ok(statement.args.includes("usr_owner"));
    assert.equal(statement.args.includes("usr_other"),false);
  }
  assert.ok(DB.batchStatements.find(x=>x.sql.includes("auth_tokens")).args.includes("owner@example.com"));
});

test("account deletion refuses incomplete unauthenticated session identity",async()=>{
  const DB=fakeDb();
  await assert.rejects(
    deleteAccountData({DB},{userId:"",emailNorm:"owner@example.com"}),
    e=>e?.code==="not_authenticated"&&e?.status===401
  );
  assert.equal(DB.batchStatements,null);
});
