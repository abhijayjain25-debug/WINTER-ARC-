/* Editable study profiles; no network calls. */
(function(root){
'use strict';
const validName=s=>typeof s==='string'&&s.trim()===s&&s.length>0&&s.length<=60&&/^[\p{L}\p{N} .&()+/_-]+$/u.test(s);
function subjects(text){const items=text.split('\n').map(s=>s.trim()).filter(Boolean);if(!items.length||items.length>30||items.some(s=>!validName(s))||new Set(items).size!==items.length)throw Error('Enter 1–30 unique subject names, one per line (letters, numbers and simple punctuation).');return items;}
function exams(text){const items=text.split('\n').filter(s=>s.trim()).map(line=>{const [name,date,score,...extra]=line.split('|').map(s=>s.trim());const maxScore=Number(score);if(extra.length||!validName(name)||!/^\d{4}-\d{2}-\d{2}$/.test(date)||!Number.isInteger(maxScore)||maxScore<1||maxScore>10000)throw Error('Use Exam name | YYYY-MM-DD | maximum score on each line.');return {name,date,maxScore};});if(items.length>20||new Set(items.map(e=>e.name)).size!==items.length)throw Error('Use at most 20 uniquely named exams.');return items;}
const companions=[
{id:'frost',name:'Frost',detail:'The original winter adventurer',asset:'winter-companion.png'},
{id:'penguin',name:'Pip',detail:'A tiny penguin with a warm scarf',asset:'penguin.svg'},
{id:'fox',name:'Flurry',detail:'An arctic fox, alert and curious',asset:'fox.svg'},
{id:'robot',name:'Byte',detail:'A pocket study robot',asset:'robot.svg'}];
root.WA_CUSTOM={validName,subjects,exams,companions};
if(typeof module!=='undefined')module.exports=root.WA_CUSTOM;
})(typeof window==='undefined'?globalThis:window);
