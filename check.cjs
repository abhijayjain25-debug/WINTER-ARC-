/* Run: node check.cjs. Checks progression/data rules without touching browser data. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const C=require('./core.js');
const box={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),box);
const D=JSON.parse(JSON.stringify(box.window.WA_DATA));
const s={version:1,settings:{name:'Test',hours:8,dailyGoal:300,theme:'light',motion:true,sound:false,jeeDate:'2027-01-20',clatDate:'2026-12-06',ailetDate:'2026-12-13',jeeConfirmed:false,notes:''},chapters:D.chapters,weeks:D.weeks,quests:[],sessions:[],mocks:[],errors:[],ledger:[],rewards:D.rewards,redemptions:[],badges:[]};
assert.equal(s.chapters.filter(c=>c.subject==='Physics').length,19);
assert.equal(s.chapters.filter(c=>c.subject==='Chemistry').length,12);
assert.equal(s.chapters.filter(c=>c.subject==='Maths').length,11);
assert.equal(s.chapters.filter(c=>c.subject==='Law').length,6);
assert.doesNotThrow(()=>C.validate(s));
assert.equal(C.daysUntil('2026-12-06','2026-09-29'),68);
assert.equal(C.addDays('2026-12-31',1),'2027-01-01');
assert.equal(C.validDate('2026-02-30'),false);
assert.equal(C.level(99),1);assert.equal(C.level(100),2);assert.equal(C.level(399),2);assert.equal(C.level(400),3);
const today=C.day();
for(let i=0;i<4;i++)C.award(s,'focus-'+i,120,'focus',today);
assert.equal(C.totalXP(s),360,'daily focus XP cap');
assert.equal(C.award(s,'focus-0',120,'focus',today),0,'same session cannot earn twice');
for(let i=0;i<5;i++)C.award(s,'quest-'+i,10,'quest',today);
assert.equal(C.totalXP(s),390,'three-quest daily cap');
assert.equal(C.crystals(s),39);
s.redemptions.push({id:'redeem-1',name:'Extra break',date:today,cost:20,used:false});
assert.equal(C.crystals(s),19);assert.equal(C.level(C.totalXP(s)),2);
let c=s.chapters[0];c.checks=[{total:10,correct:8,date:today}];assert.equal(C.canMaster(c),false);
c.checks.push({total:12,correct:9,date:today});assert.equal(C.canMaster(c),true);
c.status='mastered';C.award(s,'master-'+c.id,40,'mastery');assert.equal(C.award(s,'master-'+c.id,40,'mastery'),0);
for(let i=0;i<3;i++)s.sessions.push({id:'session-'+i,subject:'Physics',minutes:25,date:C.addDays(today,-i),note:'Practice',chapterId:c.id});
assert.equal(C.streak(s,today),3);assert.equal(C.streak(s,C.addDays(today,1)),3);assert.equal(C.streak(s,C.addDays(today,2)),0);
const badges=C.unlock(s);assert.ok(badges.some(b=>b.id==='streak3'));assert.equal(C.unlock(s).length,0);
assert.doesNotThrow(()=>C.validate(JSON.parse(JSON.stringify(s))));
const broken=JSON.parse(JSON.stringify(s));broken.chapters[0].checks=[];assert.throws(()=>C.validate(broken));
const duplicate=JSON.parse(JSON.stringify(s));duplicate.sessions.push(duplicate.sessions[0]);assert.throws(()=>C.validate(duplicate));
const badMoney=JSON.parse(JSON.stringify(s));badMoney.redemptions[0].cost=10000;assert.throws(()=>C.validate(badMoney));
const injection=JSON.parse(JSON.stringify(s));injection.chapters[0].id='"><script>';assert.throws(()=>C.validate(injection));
console.log('PASS: chapter counts, dates, progression, XP caps, repeat prevention, crystals, mastery, streaks, achievements and backup validation.');

const longSession=JSON.parse(JSON.stringify(s));longSession.sessions[0].minutes=1440;
assert.doesNotThrow(()=>C.validate(longSession));
longSession.sessions[0].minutes=1441;assert.throws(()=>C.validate(longSession));
const timerPreference=JSON.parse(JSON.stringify(s));timerPreference.settings.timerSound=false;
assert.doesNotThrow(()=>C.validate(timerPreference));
timerPreference.settings.timerSound='yes';assert.throws(()=>C.validate(timerPreference));
console.log('PASS: custom session backup bounds and optional completion sound preference.');

const X=require('./custom.js');
assert.deepEqual(X.subjects('Computer Science\nCalculus'),['Computer Science','Calculus']);
assert.throws(()=>X.subjects('Calculus\nCalculus'));
assert.throws(()=>X.subjects('<script>'));
assert.equal(X.exams('Semester finals | 2026-12-15 | 100')[0].maxScore,100);
assert.throws(()=>X.exams('Bad | date | -1'));
const custom=JSON.parse(JSON.stringify(s));custom.settings.subjects=['Computer Science','Calculus'];custom.settings.exams=[{name:'Semester finals',date:'2026-12-15',maxScore:100}];custom.settings.companion='robot';custom.chapters=[];custom.sessions=[];custom.weeks=[];
custom.mocks=[{id:'college-paper',exam:'Semester finals',date:today,name:'Practice',score:80,minutes:120,scores:[null,null,null],analysis:'',analysed:false}];
assert.doesNotThrow(()=>C.validate(custom));custom.mocks[0].score=101;assert.throws(()=>C.validate(custom));custom.mocks[0].score=80;
const bonus=JSON.parse(JSON.stringify(custom));bonus.ledger=[];
assert.equal(C.award(bonus,'workout-1',25,'workout',today),25);
assert.equal(C.award(bonus,'workout-2',25,'workout',today),0);
assert.equal(C.award(bonus,'goal-1',200,'weekly',today),200);
assert.equal(C.award(bonus,'goal-1',200,'weekly',today),0);
assert.equal(C.award(bonus,'goal-2',200,'weekly',C.weekStart(today)),0);
assert.equal(C.award(bonus,'goal-3',200,'weekly',C.addDays(C.weekStart(today),7)),200);
bonus.workouts=[{id:'move-1',date:today,category:'cardio',minutes:30,note:''}];
bonus.weeklyGoals=[{id:'promise-1',start:C.weekStart(today),end:C.addDays(C.weekStart(today),6),title:'Practice two topics',unit:'topics',target:2,plan:'Solve fresh questions and review errors',reward:'Movie evening',logs:[{id:'goal-log-1',date:today,amount:2,note:'Practised two topics'}],claimed:true,rewardUsed:false}];
assert.doesNotThrow(()=>C.validate(bonus));bonus.weeklyGoals[0].logs[0].amount=1;assert.throws(()=>C.validate(bonus));bonus.weeklyGoals[0].logs[0].amount=2;
bonus.workouts[0].category='unknown';assert.throws(()=>C.validate(bonus));
console.log('PASS: custom profiles, exam scales, workout caps, weekly repeat protection and goal validation.');
require('./disk-check.cjs')().catch(e=>{console.error(e);process.exitCode=1;});

assert.equal(X.dailyQuote('2026-09-30'),'Quiet days. Stronger tomorrow.');
assert.notEqual(X.dailyQuote('2026-10-01'),X.dailyQuote('2026-09-30'));
assert.equal(X.dailyQuote('2026-10-01'),X.dailyQuote('2026-10-01'));
assert.equal(new Set(Array.from({length:20},(_,i)=>X.dailyQuote(C.addDays('2026-10-01',i)))).size,20);
assert.deepEqual(X.evolutionLevels,[1,5,10,17,25]);
for(const p of X.companions){
 const levels=p.assets?X.evolutionLevels:[1,10,25];
 const forms=levels.map(at=>X.companionForm(p.id,at));
 assert.equal(new Set(forms.map(f=>f.form)).size,levels.length);
 if(p.assets)assert.equal(new Set(forms.map(f=>f.asset)).size,5,'Anime forms must use five different sprites');
 for(let i=0;i<levels.length;i++){
  for(const level of [levels[i],(levels[i+1]||51)-1]){
   const form=X.companionForm(p.id,level);assert.equal(form.tier,i);assert.equal(form.next,levels[i+1]||null);
   assert(fs.existsSync(__dirname+'/assets/'+form.asset),'Missing sprite: '+form.asset);
  }
 }
 const saved=JSON.parse(JSON.stringify(custom));saved.settings.companion=p.id;assert.doesNotThrow(()=>C.validate(saved));
 if(p.assets){assert.equal(X.companionForm(p.id,10).asset,p.id+'-2.png');assert.equal(X.companionForm(p.id,25).asset,p.id+'-3.png');}
}
assert.equal(X.companionForm('jinwoo',5).asset,'jinwoo-early.png');
assert.equal(X.companionForm('jinwoo',17).asset,'jinwoo-late.png');
assert.equal(X.companionForm('frost',5).next,10);
assert.equal(X.companionForm('naruto',10).form,'Sage Mode');
console.log('PASS: daily quote preservation, stable shuffled rotation, all companion assets and evolution boundaries.');

const timeHistory={sessions:[{date:'2026-09-30',minutes:25},{date:'2026-09-30',minutes:25},{date:'2026-09-29',minutes:90}]};
assert.equal(C.focusMinutes(timeHistory,'2026-09-30'),50);
assert.equal(C.focusMinutes(timeHistory),140);
assert.equal(C.focusMinutes({sessions:[]}),0);
assert.equal(C.focusMinutes(timeHistory,'2026-10-01'),0);
console.log('PASS: daily and lifetime study time, including backdated logs and empty history.');
require('./motion-check.cjs');

require('./syllabus-check.cjs');
require('./mobile-check.cjs');
