/* Exercise scheduler behavior without a browser or study records. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const frames=new Map(),timers=new Map(),events={},docEvents={};let next=0,paints=0;
const element=()=>({style:{setProperty(){}},dataset:{},classList:{toggle(){},contains(){return false;},remove(){}},setAttribute(){},append(){},prepend(){},replaceChildren(){},animate(){}});
const ctx=new Proxy({setTransform(){},clearRect(){},fill(){paints++;},stroke(){paints++;}},{get:(o,k)=>o[k]||(()=>{})});
const canvas={...element(),getContext:()=>ctx},root=element();root.scrollHeight=2400;
const document={hidden:false,documentElement:root,body:element(),querySelector:s=>s==='dialog[open]'?null:element(),querySelectorAll:()=>[],createElement:s=>s==='canvas'?canvas:element(),getAnimations:()=>[],addEventListener:(k,f)=>docEvents[k]=f};
const state={settings:{motion:true}},reduce={matches:false,addEventListener(){}};
const context={document,state,matchMedia:()=>reduce,window:{innerWidth:1200,innerHeight:800,scrollY:0,scrollTo(){},addEventListener:(k,f)=>events[k]=f},innerHeight:800,devicePixelRatio:2,location:{hash:'#basecamp'},IntersectionObserver:class{observe(){}disconnect(){}},requestAnimationFrame:f=>{const id=++next;frames.set(id,f);return id;},cancelAnimationFrame:id=>frames.delete(id),setTimeout:f=>{const id=++next;timers.set(id,f);return id;},clearTimeout:id=>timers.delete(id)};
vm.runInNewContext(fs.readFileSync(__dirname+'/motion.js','utf8'),context);
function step(time){const pending=[...frames.values()];frames.clear();pending.forEach(f=>f(time));}
function idle(){const pending=[...timers.values()];timers.clear();pending.forEach(f=>f());}
assert.equal(canvas.width,1200,'snow canvas must not scale up on high-DPI screens');
step(1000);step(1050);assert.ok(paints>0&&paints<=60,'snow paints a bounded particle count');
events.scroll();step(1100);assert.equal(frames.size,0,'scrolling pauses snow after the UI scroll update');
idle();assert.equal(frames.size,1,'snow resumes when scrolling stops');
document.hidden=true;docEvents.visibilitychange();assert.equal(frames.size,0,'hidden tabs stop snow');
document.hidden=false;docEvents.visibilitychange();assert.equal(frames.size,1);
state.settings.motion=false;docEvents['wa:theme']();events.scroll();step(1200);idle();assert.equal(frames.size,0,'scrolling cannot restart disabled motion');
state.settings.motion=true;reduce.matches=true;docEvents['wa:theme']();assert.equal(frames.size,0,'system reduced motion is respected');
console.log('PASS: snow pauses during scrolling/hidden tabs, honors disabled/reduced motion, and bounds canvas work.');
