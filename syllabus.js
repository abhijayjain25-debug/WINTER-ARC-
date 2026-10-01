/* Reviewable, on-device document imports. No uploads or automatic scoring. */
(function(root){
'use strict';
function topics(text){
 const lines=String(text).split(/\r?\n/).map(s=>s.replace(/^\s*(?:[-•●▪–*]+|\d+[.)])\s+/u,'').trim()).filter(Boolean);
 const seen=new Set(),unique=lines.filter(s=>{const key=s.toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
 if(!unique.length||unique.length>200||unique.some(s=>s.length>200))throw Error('Use 1–200 topics, one per line, each up to 200 characters. Split long paragraphs and remove headings or page numbers you don’t need.');
 return unique;
}

const limits={fileMB:100,wordMB:25,pages:1000,characters:3000000,expandedWordMB:100};
const numbers={first:1,second:2,third:3,fourth:4,fifth:5,sixth:6,seventh:7,eighth:8,ninth:9,tenth:10,i:1,ii:2,iii:3,iv:4,v:5,vi:6,vii:7,viii:8,ix:9,x:10,xi:11,xii:12};
function period(line){
 if(line.length>100||/\.{3}|contents|index|\b(?:and|&)\b/i.test(line))return null;
 const token='(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth|xii|xi|ix|iv|viii|vii|vi|iii|ii|i|v|x|\\d{1,2})(?:st|nd|rd|th)?';
 const read=kind=>{const m=line.match(new RegExp('\\b(?:'+kind+')\\s*[-:–]?\\s*'+token+'\\b','i'))||line.match(new RegExp('\\b'+token+'\\s*[-:–]?\\s*(?:'+kind+')\\b','i'));return m?(numbers[m[1].toLowerCase()]||Number(m[1])):0;};
 const semester=read('semester|sem\\.?'),year=read('year');
 return semester||year?{semester,year}:null;
}
function courseTitle(line){
 let m=line.match(/^(?:course|subject|paper)\s*(?:title|name)\s*[:–-]\s*(.+)$/i)||line.match(/^(?:course|subject)\s*:\s*(.+)$/i);
 if(m)return m[1].replace(/\s+(?:course\s*)?code\s*:.*$/i,'').trim();
 // Course codes are strong signals; bare capitalized text is deliberately not guessed as a course.
 m=line.match(/^(?:course\s*code\s*[:–-]?\s*)?([0-9]{0,4}[A-Z]{2,6}[ -]?\d{2,5}[A-Z]?)\s*[:|–-]?\s+([A-Za-z][^\n]{3,160})$/);
 return m?m[2].replace(/\s+(?:\d+(?:\.\d+)?\s*){2,}.*$/,'').trim():null;
}
function analyze(text){
 const pages=String(text).split('\f'),lines=pages.flatMap((p,i)=>p.split(/\r?\n/).map(text=>({text:text.replace(/\s+/g,' ').trim(),page:i+1}))).filter(x=>x.text);
 const repeated=new Map();for(const p of pages){const unique=new Set(p.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(x=>x.length>5));for(const x of unique)repeated.set(x,(repeated.get(x)||0)+1);}
 const sections=[],sectionMap=new Map(),topicSets=new Map();let year=0,semester=0,section,course,skip=false,removed=0,pendingCode=false;
 function getSection(){const key=year+'-'+semester;if(!sectionMap.has(key)){const label=(year?'Year '+year:'')+(year&&semester?' · ':'')+(semester?'Semester '+semester:'')||'Unassigned / no semester heading';sectionMap.set(key,{id:'section-'+sections.length,label,year,semester,courses:[]});sections.push(sectionMap.get(key));}return sectionMap.get(key);}
 function getCourse(name,page){section=getSection();course=section.courses.find(c=>c.name===name);if(!course){course={id:'course-'+sections.reduce((n,s)=>n+s.courses.length,0),name,page,topics:[]};section.courses.push(course);topicSets.set(course.id,new Set());}return course;}
 for(const row of lines){const line=row.text;
  if(/^table of contents|^contents$|^index$|\.{3,}\s*\d+\s*$/i.test(line)){removed++;continue;}
  const at=period(line);if(at){const old=year+'-'+semester;if(at.year&&at.year!==year){year=at.year;semester=0;}if(at.semester)semester=at.semester;section=getSection();if(old!==year+'-'+semester){course=null;skip=false;}removed++;continue;}
  if(/^(?:Course Code\s*:\s*)?[0-9]{0,4}[A-Z]{2,6}[ -]?\d{2,5}[A-Z]?$/.test(line)){pendingCode=true;removed++;continue;}
  const title=courseTitle(line)||(pendingCode&&line.length<120&&!/^(?:credit|unit|module|semester|year|[\d\W]+$)/i.test(line)?line:null);pendingCode=false;if(title&&!/^(code|credits?|structure|outcomes?|objectives?|syllabus|category|type)\b/i.test(title)){getCourse(title,row.page);skip=false;removed++;continue;}
  const unit=/^(?:unit|module)\s*[-:–]?\s*(?:[ivx]+|\d+)\b\s*[:.)–-]?\s*/i;
  if(unit.test(line)){skip=false;const rest=line.replace(unit,'').replace(/\s*\(?\d+\s*(?:hours?|hrs?|lectures?)\)?\s*$/i,'').trim();if(!rest){removed++;continue;}}
  else if(/^(?:text\s*(?:and reference\s*)?books?|reference(?:s|\s*books)?|bibliography|suggested readings?|recommended books?|course outcomes?|learning outcomes?|course objectives?|objectives?|assessment|evaluation|examination scheme)\b/i.test(line)){skip=true;removed++;continue;}
  if(skip||/^\d{1,4}$|^(?:page\s*\d+(?:\s*of\s*\d+)?|https?:\/\/|www\.|©|copyright|isbn)/i.test(line)||/^(?:course\s*code|credits?|total\s*(?:hours?|credits?)|teaching scheme|l\s+t\s+p|lecture\s+tutorial|contact hours?|prerequisites?|approved by|effective from|academic regulations|university|department of|faculty of)\b/i.test(line)){removed++;continue;}
  if(pages.length>=3&&repeated.get(line)>=Math.max(3,Math.ceil(pages.length*.5))&&!unit.test(line)){removed++;continue;}
  const clean=line.replace(unit,'').replace(/^\s*(?:[-•●▪–*]+|\d+[.)])\s+/u,'').replace(/\s*\(?\d+\s*(?:hours?|hrs?|lectures?)\)?\s*$/i,'').trim();
  if(clean.length<3||!/[\p{L}]/u.test(clean)||/^(?:[0-9]{0,4}[A-Z]{2,6}[ -]?\d{2,5}[A-Z]?|S\.?\s*No\.?|Course Title|Course Name)$/i.test(clean)){removed++;continue;}
  if(!course)getCourse('Review topics',row.page);
  // Sentence/semicolon boundaries produce reviewable topics; long leftovers are never silently chopped.
  for(const topic of clean.split(/\s*;\s*|(?<=[.!?])\s+(?=[A-Z])/u).filter(Boolean)){const key=topic.toLowerCase(),seen=topicSets.get(course.id);if(!seen.has(key)){seen.add(key);course.topics.push(topic);}}
 }
 const useful=sections.filter(s=>s.courses.some(c=>c.topics.length));for(const s of useful)s.courses=s.courses.filter(c=>c.topics.length);
 return {sections:useful,removed,pages:pages.length,hasPeriods:useful.some(s=>s.year||s.semester),topicCount:useful.reduce((n,s)=>n+s.courses.reduce((a,c)=>a+c.topics.length,0),0)};
}
function checkWordZip(buffer){
 const v=new DataView(buffer);let end=-1;
 for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-65557);i--)if(v.getUint32(i,true)===0x06054b50){end=i;break;}
 if(end<0)throw Error('This is not a readable Word .docx file. Save the document as .docx and try again.');
 let offset=v.getUint32(end+16,true),total=0,found=false;const count=v.getUint16(end+10,true);
 if(count===65535||offset===0xffffffff)throw Error('This document archive is too large. Import a smaller syllabus.');
 for(let i=0;i<count;i++){
  if(offset+46>v.byteLength||v.getUint32(offset,true)!==0x02014b50)throw Error('The Word document archive is damaged.');
  total+=v.getUint32(offset+24,true);if(total>limits.expandedWordMB*1024*1024)throw Error('The expanded Word document exceeds 100 MB. Use a smaller document or paste the syllabus.');
  const n=v.getUint16(offset+28,true),extra=v.getUint16(offset+30,true),comment=v.getUint16(offset+32,true);
  if(offset+46+n+extra+comment>v.byteLength)throw Error('The Word document archive is damaged.');
  const name=new TextDecoder().decode(new Uint8Array(buffer,offset+46,n));if(name==='word/document.xml')found=true;
  offset+=46+n+extra+comment;
 }
 if(!found)throw Error('This archive is not a Word .docx document.');
}
let pdfReader,wordReader;
async function extract(file,progress=()=>{},signal){
 const aborted=()=>{if(signal?.aborted)throw new DOMException('Import cancelled.','AbortError');};aborted();
 if(!file.size||file.size>limits.fileMB*1024*1024)throw Error('Choose a non-empty syllabus of up to 100 MB.');
 const ext=file.name.split('.').pop().toLowerCase();
 if(!['pdf','docx','txt','md'].includes(ext))throw Error('Choose PDF, Word (.docx), or text (.txt / .md). Convert older .doc files to .docx first.');
 if(ext==='docx'&&file.size>limits.wordMB*1024*1024)throw Error('Word imports support up to 25 MB. Save large handbooks as PDF (up to 100 MB).');
 let text='';
 if(ext==='pdf'){
  pdfReader ||= import('./assets/pdf-reader.mjs').catch(()=>{pdfReader=null;throw Error('PDF reader could not load. Refresh the planner and try again.');});const lib=await pdfReader;lib.GlobalWorkerOptions.workerSrc=new URL('assets/pdf-worker.mjs',document.baseURI).href;
  const data=new Uint8Array(await file.arrayBuffer());aborted();const task=lib.getDocument({data,isEvalSupported:false,useWorkerFetch:false});
  const cancel=()=>{task.destroy().catch(()=>{});};signal?.addEventListener('abort',cancel,{once:true});
  try{
   const pdf=await task.promise;aborted();if(pdf.numPages>limits.pages)throw Error('This handbook exceeds 1,000 pages. Export just the relevant course or year.');
   for(let n=1;n<=pdf.numPages;n++){
    aborted();progress(`Reading page ${n} of ${pdf.numPages}…`);const page=await pdf.getPage(n),content=await page.getTextContent();let line='',lastY;
    for(const item of content.items){if(typeof item.str!=='string')continue;const y=item.transform?.[5];if(line&&lastY!==undefined&&Math.abs(y-lastY)>3){text+=line.trim()+'\n';line='';}line+=(line?' ':'')+item.str;lastY=y;if(item.hasEOL){text+=line.trim()+'\n';line='';}}
    text+=line.trim()+'\n\f';page.cleanup();if(text.length>limits.characters)throw Error('This handbook exceeds 3 million text characters. Export only the relevant programme or year.');
   }
  }catch(err){if(err.name==='PasswordException')throw Error('This PDF is password-protected. Export an unlocked copy, then import it.');throw err;}finally{signal?.removeEventListener('abort',cancel);await task.destroy();}
 }else if(ext==='docx'){
  const buffer=new Uint8Array(await file.arrayBuffer()).slice().buffer;aborted();checkWordZip(buffer);
  wordReader ||= new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/word-reader.js';script.onload=()=>resolve(root.mammoth);script.onerror=()=>{wordReader=null;script.remove();reject(Error('Word reader could not load. Refresh the planner and try again.'));};document.head.append(script);});
  const reader=await wordReader;aborted();text=(await reader.extractRawText({arrayBuffer:buffer})).value;
 }else text=await file.text();
 aborted();if(text.length>limits.characters)throw Error('This handbook exceeds 3 million text characters. Export only the relevant programme or year.');
 if(!text.trim())throw Error('No readable text found. Scanned PDFs need text recognition first. Copy recognized text into Paste syllabus, or use a text-based PDF / Word file.');
 return text.trim().replace(/\f$/,'');
}
const api={topics,checkWordZip,extract,analyze,period,courseTitle,limits};if(typeof module==='object'&&module.exports)module.exports=api;else root.WA_SYLLABUS=api;
})(typeof window!=='undefined'?window:globalThis);
