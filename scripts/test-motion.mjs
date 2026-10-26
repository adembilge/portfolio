import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";

const source = readFileSync(new URL("../js/motion-preference.js", import.meta.url), "utf8");
function run({hostname="adembilge.dev", protocol="https:", search="", reduced=true, saved=null, blocked=false} = {}) {
  const data = new Map(saved ? [["portfolio-motion-mode", saved]] : []);
  let changed;
  const device = {matches: reduced, addEventListener: (_name, callback) => { changed = callback; }};
  const context = {location:{hostname,protocol,search}, document:{documentElement:{dataset:{}}}, window:{},
    matchMedia:()=>device, EventTarget, Event, URLSearchParams,
    localStorage:{getItem:key=>{if(blocked)throw Error("Storage blocked");return data.get(key)},setItem:(key,value)=>{if(blocked)throw Error("Storage blocked");data.set(key,value)}}};
  runInNewContext(source, context);
  return {context,data,device,changed};
}
assert.equal(run().context.window.portfolioMotion.matches,true,"Hosted default must honor reduced motion");
assert.equal(run({reduced:false}).context.window.portfolioMotion.matches,false);
for (const hostname of ["localhost","127.0.0.1","[::1]"])
  assert.equal(run({hostname}).context.window.portfolioMotion.matches,false,"Local HTTP preview must animate");
assert.equal(run({protocol:"file:"}).context.window.portfolioMotion.matches,false);
const full = run({search:"?motion=full"});
assert.equal(full.context.window.portfolioMotion.matches,false,"Explicit full motion overrides device setting");
assert.equal(full.data.get("portfolio-motion-mode"),"full");
assert.equal(run({saved:"full"}).context.window.portfolioMotion.matches,false,"Full motion survives a later visit");
assert.equal(run({saved:"full",search:"?motion=reduce"}).context.window.portfolioMotion.matches,true);
assert.equal(run({saved:"full",search:"?motion=system"}).context.window.portfolioMotion.matches,true);
assert.equal(run({search:"?motion=full",blocked:true}).context.window.portfolioMotion.matches,false);
assert.equal(run({saved:"unexpected"}).context.window.portfolioMotion.matches,true);
const system = run({saved:"system",reduced:false});
system.device.matches=true;system.changed();
assert.equal(system.context.document.documentElement.dataset.motion,"reduce","System mode follows live device changes");
const explicit = run({saved:"full",reduced:false});
explicit.device.matches=true;explicit.changed();
assert.equal(explicit.context.document.documentElement.dataset.motion,"full","Explicit choice survives device changes");
console.log("PASS motion preferences: local/file defaults, hosted device default, remembered explicit choices, blocked storage, live device changes.");
