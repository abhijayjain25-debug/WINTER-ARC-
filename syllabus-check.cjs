const assert=require('node:assert/strict'),S=require('./syllabus.js');
assert.deepEqual(S.topics('• Limits\n1. Differentiation\n\nlimits\n2) Integration'),['Limits','Differentiation','Integration']);
assert.throws(()=>S.topics(''),/1–200/);assert.throws(()=>S.topics('x'.repeat(201)),/Split long paragraphs/);
assert.throws(()=>S.topics(Array.from({length:201},(_,i)=>'Topic '+i).join('\n')),/1–200/);
assert.deepEqual(S.topics('<script>alert(1)</script>'),['<script>alert(1)</script>'],'text stays text; UI must escape it');
assert.throws(()=>S.checkWordZip(new ArrayBuffer(32)),/not a readable/);
const name=Buffer.from('word/document.xml'),zip=Buffer.alloc(46+name.length+22);zip.writeUInt32LE(0x02014b50,0);zip.writeUInt16LE(name.length,28);name.copy(zip,46);const end=46+name.length;zip.writeUInt32LE(0x06054b50,end);zip.writeUInt16LE(1,end+10);
const buffer=()=>zip.buffer.slice(zip.byteOffset,zip.byteOffset+zip.byteLength);
assert.doesNotThrow(()=>S.checkWordZip(buffer()));zip.writeUInt32LE(101*1024*1024,24);assert.throws(()=>S.checkWordZip(buffer()),/exceeds 100 MB/);
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

// Course handbooks: Roman/ordinal periods, repeated semesters, filler, and safe atomic batches.
assert.deepEqual(S.period('SEMESTER III'),{semester:3,year:0});
assert.deepEqual(S.period('II Semester'),{semester:2,year:0});
assert.deepEqual(S.period('Year 2 - Semester IV'),{semester:4,year:2});
assert.deepEqual(S.period('Sem-5'),{semester:5,year:0});
assert.equal(S.period('Semester I and II'),null);
assert.equal(S.period('Semester IV ........ 45'),null);
const handbook='Table of Contents\nSemester I ........ 5\nFIRST YEAR\nSEMESTER I\nCourse Title: Engineering Mathematics\nCredits: 4\nCourse Objectives\nStudents will understand the foundations\nUnit I: Limits; Continuity\nUnit II: Differentiation\nReference Books\nBook that should be excluded\n\fSEMESTER II\n23CS201 Data Structures\nUNIT I: Arrays; Linked lists\nCourse Outcomes\nStudents will demonstrate knowledge\n\fSEMESTER I\nCourse Title: Engineering Mathematics\nUnit I: Limits; Continuity\nUnit III: Integration';
const analyzed=S.analyze(handbook);assert.equal(analyzed.sections.length,2);assert.equal(analyzed.sections[0].label,'Year 1 · Semester 1');
assert.deepEqual(analyzed.sections[0].courses[0].topics,['Limits','Continuity','Differentiation','Integration']);
assert.deepEqual(analyzed.sections[1].courses[0].topics,['Arrays','Linked lists']);assert.equal(analyzed.sections[1].courses[0].page,2);
assert.ok(analyzed.removed>5);assert.ok(analyzed.hasPeriods);
const unstructured=S.analyze('Introduction to Python\nFunctions\nFile handling');assert.equal(unstructured.hasPeriods,false);assert.equal(unstructured.topicCount,3);
box.addSyllabusBatch([{subject:'Mathematics (Sem 1)',text:'Limits\nContinuity',period:'Year 1 - Semester 1',page:2},{subject:'Data Structures (Sem 2)',text:'Arrays\nLinked lists',period:'Semester 2',page:10}],'handbook.pdf');
assert.equal(box.state.chapters.length,55);assert.equal(C.totalXP(box.state),0);assert.match(box.state.chapters.at(-1).notes,/page 10/);
const beforeBatch=JSON.stringify(box.state);assert.throws(()=>box.addSyllabusBatch([{subject:'Valid',text:'New topic',period:'Semester 1',page:1},{subject:'Invalid <name>',text:'Other topic',period:'Semester 2',page:2}],'book.pdf'));assert.equal(JSON.stringify(box.state),beforeBatch);
console.log('PASS: semester/year detection, course separation, filler filtering, page references, raw fallback and atomic multi-course imports.');

assert.deepEqual(S.analyze('Semester I\nCS101\nProgramming Fundamentals\nUnit I: Variables\n\fSemester I\nUnit II: Functions').sections[0].courses[0].topics,['Variables','Functions'],'repeated semester headers retain course context');
assert.equal(S.courseTitle('23CS101 Programming Fundamentals'),'Programming Fundamentals');
(async()=>{
 await assert.rejects(S.extract({size:101*1024*1024,name:'huge.pdf'}),/100 MB/);
 await assert.rejects(S.extract({size:26*1024*1024,name:'huge.docx'}),/25 MB/);
 const stop=new AbortController();stop.abort();await assert.rejects(S.extract({size:1,name:'test.txt'},()=>{},stop.signal),/cancelled/);
 console.log('PASS: file limits and cancelled reads fail before parsing.');
})();
