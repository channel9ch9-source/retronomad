import test from "node:test";
import assert from "node:assert/strict";
import {readFile} from "node:fs/promises";
import vm from "node:vm";

test("US Marketplace frontend uses Tomba! for the PAL-catalogue Tombi! record",async()=>{
 const source=await readFile(new URL("../marketplace-us-public.js",import.meta.url),"utf8");
 const context={window:{},document:{getElementById(){return null;}},URL,AbortController,console};
 vm.runInNewContext(source,context,{timeout:1500});
 const resolver=context.window.GrailRavenUSMarketplace.displayTitle;
 assert.equal(resolver("Tombi!","PS1"),"Tomba!");
 assert.equal(resolver("Tombi","PS1"),"Tomba!");
 assert.equal(resolver("Tombi!","PS2"),"Tombi!");
 assert.equal(resolver("Tomba!","PS1"),"Tomba!");
});

test("public Search forwards regional title to provider, without losing canonical catalogue ID",async()=>{
 const source=await readFile(new URL("../search.html",import.meta.url),"utf8");
 assert.match(source,/catalogueId:canonical\?\.id\|\|null/);
 assert.match(source,/window\.GrailRavenUSMarketplace\.displayTitle\(canonical\?\.title\|\|typedGame/);
 assert.match(source,/const displayName=usMarket\?window\.GrailRavenUSMarketplace\.displayTitle\(game\.title,game\.platform\)/);
 assert.match(source,/setHeroArtwork\(usMarket\?null:game,displayName\)/);
 assert.match(source,/window\.GrailRavenUSMarketplace\.run\(t,status\)/);
 assert.match(source,/US Marketplace · REVIEW only/);
});
