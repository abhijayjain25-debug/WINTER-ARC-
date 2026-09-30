const assert=require('node:assert/strict'),S=require('./syllabus.js');
assert.deepEqual(S.topics('• Limits\n1. Differentiation\n\nlimits\n2) Integration'),['Limits','Differentiation','Integration']);
assert.throws(()=>S.topics(''),/1–200/);assert.throws(()=>S.topics('x'.repeat(201)),/Split long paragraphs/);
assert.throws(()=>S.topics(Array.from({length:201},(_,i)=>'Topic '+i).join('\n')),/1–200/);
assert.deepEqual(S.topics('<script>alert(1)</script>'),['<script>alert(1)</script>'],'text stays text; UI must escape it');
assert.throws(()=>S.checkWordZip(new ArrayBuffer(32)),/not a readable/);
const name=Buffer.from('word/document.xml'),zip=Buffer.alloc(46+name.length+22);zip.writeUInt32LE(0x02014b50,0);zip.writeUInt16LE(name.length,28);name.copy(zip,46);const end=46+name.length;zip.writeUInt32LE(0x06054b50,end);zip.writeUInt16LE(1,end+10);
const buffer=()=>zip.buffer.slice(zip.byteOffset,zip.byteOffset+zip.byteLength);
assert.doesNotThrow(()=>S.checkWordZip(buffer()));zip.writeUInt32LE(31*1024*1024,24);assert.throws(()=>S.checkWordZip(buffer()),/exceeds 30 MB/);
console.log('PASS: reviewed syllabus topics, deduplication, import bounds, invalid documents, and expanded Word size limits.');

// Exercise the actual profile integration with an isolated planner and no DOM writes.
const vm=require('node:vm'),fs=require('node:fs'),C=require('./core.js'),X=require('./custom.js');
const seed={window:{}};vm.runInNewContext(fs.readFileSync(__dirname+'/data.js','utf8'),seed);const D=seed.window.WA_DATA;
const original={version:1,settings:{name:'College tester',hours:8,dailyGoal:300,theme:'dark',motion:false,sound:false,jeeDate:'2027-01-20',clatDate:'2026-12-06',ailetDate:'2026-12-13',jeeConfirmed:false,notes:''},chapters:JSON.parse(JSON.stringify(D.chapters)),weeks:JSON.parse(JSON.stringify(D.weeks)),quests:[],sessions:[],mocks:[],errors:[],ledger:[],rewards:JSON.parse(JSON.stringify(D.rewards)),redemptions:[],badges:[]};
let nextID=0;const box={state:original,C,X,WA_SYLLABUS:S,clone:v=>JSON.parse(JSON.stringify(v)),subjects:()=>box.state.settings.subjects||D.subjects,checkEditable(){},assert:(ok,msg)=>assert.ok(ok,msg),uid:()=>`import-${++nextID}`,changed(){},go(){},document:{querySelector:()=>({addEventListener(){}})},window:{addEventListener(){}}};
vm.runInNewContext(fs.readFileSync(__dirname+'/profile.js','utf8'),box);
box.addSyllabus('Computer Science','Data Structures\nAlgorithms\ndata structures','course.pdf');
assert.ok(box.state.settings.subjects.includes('Computer Science'));assert.equal(box.state.chapters.length,50);assert.equal(C.totalXP(box.state),0);assert.equal(original.chapters.length,48,'the existing state is not mutated before validation');
assert.equal(box.state.chapters.at(-1).notes,'Imported from course.pdf');
box.addSyllabus('Computer Science','ALGORITHMS\nDatabase Systems');assert.equal(box.state.chapters.length,51,'existing topics are skipped regardless of case');
const before=JSON.stringify(box.state);assert.throws(()=>box.addSyllabus('Invalid <course>','New chapter'));assert.equal(JSON.stringify(box.state),before,'invalid imports are atomic');
console.log('PASS: syllabus imports create profile subjects, append topics, preserve history and XP, skip duplicates, and validate before mutation.');
