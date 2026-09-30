/* Reviewable, on-device document imports. No uploads or automatic scoring. */
(function(root){
'use strict';
function topics(text){
 const lines=String(text).split(/\r?\n/).map(s=>s.replace(/^\s*(?:[-•●▪–*]+|\d+[.)])\s+/u,'').trim()).filter(Boolean);
 const seen=new Set(),unique=lines.filter(s=>{const key=s.toLocaleLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
 if(!unique.length||unique.length>200||unique.some(s=>s.length>200))throw Error('Use 1–200 topics, one per line, each up to 200 characters. Split long paragraphs and remove headings or page numbers you don’t need.');
 return unique;
}
function checkWordZip(buffer){
 const v=new DataView(buffer);let end=-1;
 for(let i=v.byteLength-22;i>=Math.max(0,v.byteLength-65557);i--)if(v.getUint32(i,true)===0x06054b50){end=i;break;}
 if(end<0)throw Error('This is not a readable Word .docx file. Save the document as .docx and try again.');
 let offset=v.getUint32(end+16,true),total=0,found=false;const count=v.getUint16(end+10,true);
 if(count===65535||offset===0xffffffff)throw Error('This document archive is too large. Import a smaller syllabus.');
 for(let i=0;i<count;i++){
  if(offset+46>v.byteLength||v.getUint32(offset,true)!==0x02014b50)throw Error('The Word document archive is damaged.');
  total+=v.getUint32(offset+24,true);if(total>30*1024*1024)throw Error('The expanded Word document exceeds 30 MB. Use a smaller document or paste the syllabus.');
  const n=v.getUint16(offset+28,true),extra=v.getUint16(offset+30,true),comment=v.getUint16(offset+32,true);
  if(offset+46+n+extra+comment>v.byteLength)throw Error('The Word document archive is damaged.');
  const name=new TextDecoder().decode(new Uint8Array(buffer,offset+46,n));if(name==='word/document.xml')found=true;
  offset+=46+n+extra+comment;
 }
 if(!found)throw Error('This archive is not a Word .docx document.');
}
let pdfReader,wordReader;
async function extract(file,progress=()=>{}){
 if(!file.size||file.size>10*1024*1024)throw Error('Choose a non-empty syllabus smaller than 10 MB.');
 const ext=file.name.split('.').pop().toLowerCase();
 if(!['pdf','docx','txt','md'].includes(ext))throw Error('Choose PDF, Word (.docx), or text (.txt / .md). Convert older .doc files to .docx first.');
 let text='';
 if(ext==='pdf'){
  pdfReader ||= import('./assets/pdf-reader.mjs').catch(()=>{pdfReader=null;throw Error('PDF reader could not load. Refresh the planner and try again.');});const lib=await pdfReader;lib.GlobalWorkerOptions.workerSrc=new URL('assets/pdf-worker.mjs',document.baseURI).href;
  const task=lib.getDocument({data:new Uint8Array(await file.arrayBuffer()),isEvalSupported:false,useWorkerFetch:false});
  try{
   const pdf=await task.promise;if(pdf.numPages>100)throw Error('Choose a syllabus of 100 pages or fewer. Split large course handbooks first.');
   for(let n=1;n<=pdf.numPages;n++){
    progress(`Reading page ${n} of ${pdf.numPages}…`);const page=await pdf.getPage(n),content=await page.getTextContent();let line='',lastY;
    for(const item of content.items){if(typeof item.str!=='string')continue;const y=item.transform?.[5];if(line&&lastY!==undefined&&Math.abs(y-lastY)>3){text+=line.trim()+'\n';line='';}line+=(line?' ':'')+item.str;lastY=y;if(item.hasEOL){text+=line.trim()+'\n';line='';}}
    text+=line.trim()+'\n';page.cleanup();if(text.length>100000)throw Error('This syllabus contains too much text. Split it into individual course documents.');
   }
  }catch(err){if(err.name==='PasswordException')throw Error('This PDF is password-protected. Export an unlocked copy, then import it.');throw err;}finally{await task.destroy();}
 }else if(ext==='docx'){
  const buffer=new Uint8Array(await file.arrayBuffer()).slice().buffer;checkWordZip(buffer);
  wordReader ||= new Promise((resolve,reject)=>{const script=document.createElement('script');script.src='assets/word-reader.js';script.onload=()=>resolve(root.mammoth);script.onerror=()=>{wordReader=null;script.remove();reject(Error('Word reader could not load. Refresh the planner and try again.'));};document.head.append(script);});
  const reader=await wordReader;text=(await reader.extractRawText({arrayBuffer:buffer})).value;
 }else text=await file.text();
 if(text.length>100000)throw Error('This syllabus contains too much text. Split it into individual course documents.');
 if(!text.trim())throw Error('No readable text found. Scanned PDFs need text recognition first. Copy recognized text into Paste syllabus, or use a text-based PDF / Word file.');
 return text.trim();
}
const api={topics,checkWordZip,extract};if(typeof module==='object'&&module.exports)module.exports=api;else root.WA_SYLLABUS=api;
})(typeof window!=='undefined'?window:globalThis);
