import test from "node:test";
import assert from "node:assert/strict";
import { authClientRateKey, enforceLoginRequestRate } from "../backend/alerts-worker.js";

function fakeDb({clientCounts=[0,0],emailCounts=[0,0]}={}){
  const calls=[];
  let clientIndex=0,emailIndex=0;
  return {
    calls,
    prepare(sql){
      return {
        bind(...args){
          calls.push({sql,args});
          return {
            async run(){return {meta:{changes:1}};},
            async first(){
              if(sql.includes("auth_rate_events")&&sql.includes("COUNT(*)")){
                return {n:clientCounts[Math.min(clientIndex++,clientCounts.length-1)]??0};
              }
              if(sql.includes("auth_tokens")&&sql.includes("COUNT(*)")){
                return {n:emailCounts[Math.min(emailIndex++,emailCounts.length-1)]??0};
              }
              return {n:0};
            }
          };
        }
      };
    }
  };
}

test("auth client bucket is deterministic within a day and rotates daily",async()=>{
  const req=new Request("https://grailraven.com/api/auth/request-link",{
    headers:{"cf-connecting-ip":"203.0.113.42"}
  });
  const a=await authClientRateKey(req,new Date("2026-10-09T12:00:00Z"));
  const b=await authClientRateKey(req,new Date("2026-10-09T23:59:00Z"));
  const c=await authClientRateKey(req,new Date("2026-10-10T00:01:00Z"));
  assert.match(a,/^[a-f0-9]{64}$/);
  assert.equal(a,b);
  assert.notEqual(a,c);
  assert.equal(a.includes("203.0.113.42"),false);
});

test("auth client bucket is skipped when Cloudflare client address is unavailable",async()=>{
  const req=new Request("https://grailraven.com/api/auth/request-link");
  assert.equal(await authClientRateKey(req,new Date("2026-10-09T12:00:00Z")),"");
});

test("cross-address sign-in spray is blocked before email delivery",async()=>{
  const DB=fakeDb({clientCounts:[7,7],emailCounts:[0,0]});
  const req=new Request("https://grailraven.com/api/auth/request-link",{
    headers:{"cf-connecting-ip":"203.0.113.42"}
  });
  await assert.rejects(
    enforceLoginRequestRate({DB},"one@example.com",req),
    e=>e?.code==="rate_limited"&&e?.status===429
  );
  assert.ok(DB.calls.some(x=>x.sql.includes("INSERT INTO auth_rate_events")));
  assert.equal(DB.calls.some(x=>x.sql.includes("COUNT(*) AS n FROM auth_tokens")),false);
});

test("legitimate client stays subject to the existing per-email limiter",async()=>{
  const DB=fakeDb({clientCounts:[2,5],emailCounts:[1,1]});
  const req=new Request("https://grailraven.com/api/auth/request-link",{
    headers:{"cf-connecting-ip":"203.0.113.42"}
  });
  await assert.rejects(
    enforceLoginRequestRate({DB},"one@example.com",req),
    e=>e?.code==="rate_limited"&&e?.status===429
  );
  assert.ok(DB.calls.some(x=>x.sql.includes("COUNT(*) AS n FROM auth_tokens")));
});

test("normal sign-in request passes both abuse layers",async()=>{
  const DB=fakeDb({clientCounts:[2,5],emailCounts:[0,0]});
  const req=new Request("https://grailraven.com/api/auth/request-link",{
    headers:{"cf-connecting-ip":"203.0.113.42"}
  });
  await enforceLoginRequestRate({DB},"one@example.com",req);
  assert.ok(DB.calls.some(x=>x.sql.includes("DELETE FROM auth_rate_events")));
  assert.ok(DB.calls.some(x=>x.sql.includes("INSERT INTO auth_rate_events")));
});
