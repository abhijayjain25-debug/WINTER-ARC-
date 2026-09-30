/* Check actual keyboard handling for both overlay and resizing phone keyboards. */
const assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const app=fs.readFileSync(__dirname+'/app.js','utf8'),start=app.indexOf('let restingViewportHeight='),end=app.indexOf('window.visualViewport?.addEventListener',start);
let editing=false,hidden=false;const context={innerHeight:800,window:{visualViewport:{height:800}},document:{documentElement:{style:{setProperty(){}}},activeElement:{matches:()=>editing},body:{classList:{toggle:(name,value)=>hidden=value}}}};
vm.runInNewContext(app.slice(start,end),context);
editing=true;context.window.visualViewport.height=500;context.innerHeight=500;context.fitKeyboard();assert.equal(hidden,true,'resizing keyboards must hide competing fixed controls');
context.innerHeight=800;context.fitKeyboard();assert.equal(hidden,true,'overlay keyboards must hide competing fixed controls');
editing=false;context.fitKeyboard();assert.equal(hidden,false,'blur restores navigation');
context.window.visualViewport.height=800;context.fitKeyboard();editing=true;context.window.visualViewport.height=740;context.fitKeyboard();assert.equal(hidden,false,'small browser toolbar changes do not count as a keyboard');
console.log('PASS: mobile keyboard handling for resized/overlay viewports, blur recovery, and browser-toolbar changes.');
