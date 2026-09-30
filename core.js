(function(root){'use strict';
const day=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const dateObject=s=>new Date(s+'T12:00:00');
const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&!isNaN(dateObject(s))&&day(dateObject(s))===s;
const addDays=(s,n)=>{const d=dateObject(s);d.setDate(d.getDate()+n);return day(d);};
const daysUntil=(s,now=day())=>Math.round((Date.UTC(...s.split('-').map((x,i)=>Number(x)-(i===1?1:0)))-Date.UTC(...now.split('-').map((x,i)=>Number(x)-(i===1?1:0))))/86400000);
const level=xp=>Math.floor(Math.sqrt(Math.max(0,xp)/100))+1;
const threshold=l=>100*(l-1)**2;
const totalXP=s=>s.ledger.reduce((n,x)=>n+x.xp,0);
const crystals=s=>Math.max(0,Math.floor(totalXP(s)/10)-s.redemptions.reduce((n,r)=>n+r.cost,0));
const canMaster=c=>c.checks.length>=2&&c.checks.slice(-2).every(x=>x.total>=10&&x.correct/x.total>=.75);
const focusMinutes=(s,date)=>s.sessions.filter(x=>x.date===date).reduce((n,x)=>n+x.minutes,0);
const streak=(s,today=day())=>{let d=focusMinutes(s,today)>=25?today:addDays(today,-1),n=0;while(focusMinutes(s,d)>=25&&n<10000){n++;d=addDays(d,-1);}return n;};
function award(s,id,xp,kind,date=day()){if(s.ledger.some(x=>x.id===id))return 0;const caps={focus:360,quest:30,mock:20,analysis:80,review:20,workout:25,weekly:200};const used=s.ledger.filter(x=>x.kind===kind&&(kind==='weekly'?weekStart(x.date)===weekStart(date):x.date===date)).reduce((n,x)=>n+x.xp,0);const value=Math.max(0,Math.min(Math.floor(xp),(caps[kind]??Infinity)-used));s.ledger.push({id,xp:value,kind,date});return value;}
const weekStart=(date=day())=>addDays(date,-((dateObject(date).getDay()+6)%7));
const average=xs=>xs.length?xs.reduce((a,b)=>a+b,0)/xs.length:null;
const ranks=['Snowbound beginner','Trail finder','Frost walker','Icebound scholar','Aurora seeker','Winter sentinel','Summit keeper'];
const rank=l=>ranks[Math.min(l-1,ranks.length-1)];
const badges=[
{id:'first',name:'First footprints',detail:'Complete a 25-minute focus session.',icon:'✧',test:s=>s.sessions.some(x=>x.minutes>=25)},
{id:'streak3',name:'Three days of winter',detail:'Reach a 3-day study streak.',icon:'ϟ',test:s=>streak(s)>=3},
{id:'hours10',name:'Quiet dedication',detail:'Log 10 hours of focused study.',icon:'◷',test:s=>s.sessions.reduce((n,x)=>n+x.minutes,0)>=600},
{id:'master1',name:'Proof, not promises',detail:'Master a chapter with two strong checks.',icon:'◈',test:s=>s.chapters.some(x=>x.status==='mastered')},
{id:'master5',name:'Solid ground',detail:'Master five topics.',icon:'❖',test:s=>s.chapters.filter(x=>x.status==='mastered').length>=5},
{id:'analyst',name:'The honest review',detail:'Analyse three mocks with repair actions.',icon:'▥',test:s=>s.mocks.filter(x=>x.analysed).length>=3},
{id:'both',name:'Two paths, one purpose',detail:'Log focus in every subject in your profile.',icon:'⚑',test:s=>(s.settings.subjects||['Physics','Chemistry','Maths','Law']).every(a=>s.sessions.some(x=>x.subject===a))},
{id:'repair',name:'Mistakes into mastery',detail:'Revisit five error entries at least twice each.',icon:'↻',test:s=>s.errors.filter(x=>x.reviews.length>=2).length>=5},
{id:'active3',name:'Warm through winter',detail:'Log workouts on three different days.',icon:'ϟ',test:s=>new Set((s.workouts||[]).filter(w=>w.category!=='rest').map(w=>w.date)).size>=3},
{id:'weekgoal',name:'A promise kept',detail:'Complete and claim a weekly goal.',icon:'⚑',test:s=>(s.weeklyGoals||[]).some(g=>g.claimed)},
{id:'hours50',name:'Deep winter',detail:'Log 50 hours of focused work.',icon:'❄',test:s=>s.sessions.reduce((n,x)=>n+x.minutes,0)>=3000}];
function unlock(s){const found=badges.filter(b=>!s.badges.includes(b.id)&&b.test(s));s.badges.push(...found.map(b=>b.id));return found;}
function validate(s){const fail=()=>{throw Error('This backup is incomplete or invalid. Your current progress has not been changed.');};const str=(v,n=10000)=>typeof v==='string'&&v.length<=n;const num=(v,min,max)=>Number.isFinite(v)&&v>=min&&v<=max;const array=(v,max=20000)=>Array.isArray(v)&&v.length<=max;const ids=a=>new Set(a.map(x=>x.id)).size===a.length&&a.every(x=>str(x.id,100)&&/^[\w-]+$/.test(x.id));
if(!s||s.version!==1||!s.settings)fail();const t=s.settings;if(!str(t.name,60)||!num(t.hours,2,12)||!num(t.dailyGoal,25,720)||typeof t.motion!=='boolean'||typeof t.sound!=='boolean'||(t.timerSound!==undefined&&typeof t.timerSound!=='boolean')||typeof t.jeeConfirmed!=='boolean'||!['dark','light'].includes(t.theme)||!validDate(t.jeeDate)||!validDate(t.clatDate)||!validDate(t.ailetDate)||!str(t.notes,20000))fail();
for(const key of ['chapters','weeks','quests','sessions','mocks','errors','ledger','rewards','redemptions'])if(!array(s[key])||!ids(s[key]))fail();if(!array(s.badges,50)||!s.badges.every(x=>badges.some(b=>b.id===x)))fail();const subjects=t.subjects||['Physics','Chemistry','Maths','Law'];const safeName=v=>str(v,60)&&v.trim()===v&&v.length>0&&/^[\p{L}\p{N} .&()+/_-]+$/u.test(v);if(!array(subjects,30)||!subjects.length||subjects.some(x=>!safeName(x))||new Set(subjects).size!==subjects.length)fail();
const examItems=t.exams||[{name:'JEE',maxScore:300,date:t.jeeDate},{name:'CLAT',maxScore:120,date:t.clatDate},{name:'AILET',maxScore:150,date:t.ailetDate}];if(!array(examItems,20)||examItems.some(e=>!e||!safeName(e.name)||!validDate(e.date)||!Number.isInteger(e.maxScore)||!num(e.maxScore,1,10000))||new Set(examItems.map(e=>e.name)).size!==examItems.length)fail();const scales=Object.fromEntries(examItems.map(e=>[e.name,e.maxScore]));
if(t.storageMode!==undefined&&!['file','browser'].includes(t.storageMode))fail();
if(t.companion!==undefined&&!['frost','penguin','fox','robot','ember','aurora','summit','jinwoo','naruto','gojo','ichigo','asta'].includes(t.companion))fail();for(const key of ['setupDone','tutorialDone','customGuide'])if(t[key]!==undefined&&typeof t[key]!=='boolean')fail();
for(const key of ['workouts','weeklyGoals'])if(s[key]!==undefined&&(!array(s[key])||!ids(s[key])))fail();
for(const w of s.workouts||[])if(!validDate(w.date)||!['calisthenics','heavy-weights','cardio','rest'].includes(w.category)||!Number.isInteger(w.minutes)||!num(w.minutes,w.category==='rest'?0:10,240)||!str(w.note,2000))fail();
const goals=s.weeklyGoals||[];if(new Set(goals.map(g=>g.start)).size!==goals.length)fail();for(const g of goals){if(!validDate(g.start)||g.start!==weekStart(g.start)||g.end!==addDays(g.start,6)||!str(g.title,200)||!str(g.unit,60)||!str(g.plan,3000)||!str(g.reward,200)||!Number.isInteger(g.target)||!num(g.target,1,1000)||typeof g.claimed!=='boolean'||typeof g.rewardUsed!=='boolean'||!array(g.logs,1000)||!ids(g.logs))fail();for(const l of g.logs)if(!validDate(l.date)||l.date<g.start||l.date>g.end||!Number.isInteger(l.amount)||!num(l.amount,1,1000)||!str(l.note,2000))fail();if(g.claimed&&g.logs.reduce((n,l)=>n+l.amount,0)<g.target)fail();if(g.rewardUsed&&!g.claimed)fail();}

for(const c of s.chapters){if(!subjects.includes(c.subject)||!str(c.name,200)||!str(c.priority,50)||!str(c.prerequisite)||!str(c.notes)||!['not-started','learning','practice','revision','mastered'].includes(c.status)||!array(c.checks,1000)||!(c.nextReview===''||validDate(c.nextReview)))fail();for(const q of c.checks)if(!num(q.total,1,300)||!num(q.correct,0,q.total)||!validDate(q.date))fail();if(c.status==='mastered'&&!canMaster(c))fail();}
for(const w of s.weeks)if(!validDate(w.start)||!validDate(w.end)||w.end<w.start||!['title','physics','chemistry','maths','note'].every(k=>str(w[k])))fail();
for(const w of s.weeks)if(w.blocks!==undefined&&(!w.blocks||Array.isArray(w.blocks)||typeof w.blocks!=='object'||Object.entries(w.blocks).some(([k,v])=>!safeName(k)||!str(v))))fail();
for(const q of s.quests)if(!str(q.title,200)||!subjects.includes(q.subject)||!validDate(q.date)||!num(q.minutes,5,240)||typeof q.done!=='boolean')fail();
for(const x of s.sessions)if(!subjects.includes(x.subject)||!validDate(x.date)||!num(x.minutes,1,1440)||!str(x.note,2000)||!str(x.chapterId,100))fail();
for(const m of s.mocks){if(!Object.hasOwn(scales,m.exam)||!validDate(m.date)||!str(m.name,150)||!num(m.score,-scales[m.exam]/4,scales[m.exam])||!num(m.minutes,1,300)||!str(m.analysis)||typeof m.analysed!=='boolean'||!array(m.scores,3))fail();if(m.analysed&&m.analysis.trim().length<20)fail();if(m.scores.some(v=>v!==null&&!num(v,-25,100)))fail();}
for(const e of s.errors)if(!subjects.includes(e.subject)||!str(e.topic,200)||!str(e.cause,100)||!str(e.repair,3000)||!validDate(e.nextReview)||!array(e.reviews,1000)||!e.reviews.every(validDate))fail();
for(const x of s.ledger)if(!num(x.xp,0,1000)||!validDate(x.date)||!['focus','quest','mock','analysis','mastery','review','workout','weekly'].includes(x.kind))fail();
for(const r of s.rewards)if(!str(r.name,150)||!str(r.description,1000)||!str(r.icon,10)||!num(r.cost,10,10000))fail();
for(const r of s.redemptions)if(!str(r.name,150)||!num(r.cost,10,10000)||!validDate(r.date)||typeof r.used!=='boolean')fail();if(s.redemptions.reduce((n,r)=>n+r.cost,0)>Math.floor(totalXP(s)/10))fail();if(s.guideEdits!==undefined&&(!s.guideEdits||Array.isArray(s.guideEdits)||typeof s.guideEdits!=='object'||Object.entries(s.guideEdits).some(([k,v])=>!/^\d{1,2}$/.test(k)||!str(v,20000))))fail();return s;}
root.WA_CORE={day,validDate,addDays,daysUntil,weekStart,level,threshold,totalXP,crystals,canMaster,focusMinutes,streak,award,average,rank,badges,unlock,validate};if(typeof module!=='undefined')module.exports=root.WA_CORE;
})(typeof window==='undefined'?globalThis:window);
