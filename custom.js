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
{id:'robot',name:'Byte',detail:'A pocket study robot',asset:'robot.svg'},
{id:'ember',name:'Ember',detail:'A warm-hearted winter explorer',asset:'ember.png'},
{id:'aurora',name:'Aurora',detail:'A curious scholar of the snow',asset:'aurora.png'},
{id:'summit',name:'Summit',detail:'A steady climber, one step at a time',asset:'summit.png'},
{id:'jinwoo',name:'Sung Jinwoo',detail:'Hunter to Shadow Monarch · Solo Leveling fan art',asset:'jinwoo-1.png',color:'#b987ff',forms:['E-rank Hunter','Awakened Hunter','Shadow Monarch'],assets:['jinwoo-1.png','jinwoo-2.png','jinwoo-3.png']},
{id:'naruto',name:'Naruto',detail:'Ninja to Kurama Chakra Mode · Naruto fan art',asset:'naruto-1.png',color:'#ffb95c',forms:['Young Ninja','Sage Mode','Kurama Chakra Mode'],assets:['naruto-1.png','naruto-2.png','naruto-3.png']},
{id:'gojo',name:'Gojo',detail:'Six Eyes · Jujutsu Kaisen fan art',asset:'gojo-1.png',color:'#b5a3ff',forms:['Student','Limitless','Hollow Purple'],assets:['gojo-1.png','gojo-2.png','gojo-3.png']},
{id:'ichigo',name:'Ichigo',detail:'Soul Reaper · Bleach fan art',asset:'ichigo-1.png',color:'#ff815f',forms:['Soul Reaper','Bankai','Hollow Bankai'],assets:['ichigo-1.png','ichigo-2.png','ichigo-3.png']},
{id:'asta',name:'Asta',detail:'Never give up · Black Clover fan art',asset:'asta-1.png',color:'#ed7878',forms:['Magic Knight','Black Asta','Devil Union'],assets:['asta-1.png','asta-2.png','asta-3.png']}];
const evolutionLevels=[1,5,10,17,25];
const newForms={jinwoo:['Dungeon Hunter','Shadow Commander'],naruto:['Shippuden Ninja','Nine-Tails Cloak'],gojo:['Awakened Six Eyes','Unlimited Void'],ichigo:['Shikai Zangetsu','Hollow Mask Bankai'],asta:['Demon-Dweller','Berserk Black Asta']};
for(const p of companions){
 if(!p.assets)continue;
 p.forms=[p.forms[0],newForms[p.id][0],p.forms[1],newForms[p.id][1],p.forms[2]];
 p.assets=[p.assets[0],p.id+'-early.png',p.assets[1],p.id+'-late.png',p.assets[2]];
}
function companionForm(id,level){
 const p=companions.find(p=>p.id===id)||companions[0];
 const levels=p.assets?evolutionLevels:[1,10,25],tier=Math.max(0,levels.findLastIndex(at=>level>=at));
 const colors={frost:'#8ddaff',penguin:'#8ddaff',fox:'#efc2f6',robot:'#98e8dc',ember:'#e6899c',aurora:'#c69aee',summit:'#97cc8a'};
 return {...p,tier,levels,asset:p.assets?.[tier]||p.asset,form:(p.forms||['Trail companion','Awakened aura','Ascended aura'])[tier],color:p.color||colors[p.id],next:levels[tier+1]||null};
}
// Original planner mottos, not attributed quotations. Date-seeded shuffle needs no storage.
const quotes=[
'Small steps still climb mountains.',
'Give the next hour your honest best.',
'The question you face today becomes easier tomorrow.',
'You do not need perfect days to make real progress.',
'Practice quietly. Let progress speak.',
'Begin before you feel ready.',
'One solved problem is a little less doubt.',
'Slow progress is still a way forward.',
'Your next level lives in the work you repeat.',
'Build a routine your tired self can follow.',
'Return to the work. That is how you grow.',
'Let yesterday teach you, not define you.',
'A mistake reviewed is a lesson earned.',
'Choose one thing. Give it your full attention.',
'Rest well. Return stronger.',
'Today is another chance to keep a promise to yourself.',
'Confidence grows where practice happens.',
'Make the next step smaller. Then take it.',
'Your pace can change. Your direction can stay.',
'The climb is made of ordinary days.'
];
function dailyQuote(date){
 const anchor=Date.UTC(2026,8,30),[y,m,d]=date.split('-').map(Number),day=Math.floor((Date.UTC(y,m-1,d)-anchor)/86400000);
 if(day<=0)return 'Quiet days. Stronger tomorrow.';
 const order=[...quotes];let seed=20260930;
 for(let i=order.length-1;i>0;i--){seed=(Math.imul(seed,1664525)+1013904223)>>>0;const j=seed%(i+1);[order[i],order[j]]=[order[j],order[i]];}
 return order[(day-1)%order.length];
}
root.WA_CUSTOM={validName,subjects,exams,companions,companionForm,evolutionLevels,dailyQuote};
if(typeof module!=='undefined')module.exports=root.WA_CUSTOM;
})(typeof window==='undefined'?globalThis:window);
