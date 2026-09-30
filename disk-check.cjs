/* Exercise the file queue against a real temporary file without opening a user's planner. */
module.exports=async function(){
const fs=require('node:fs/promises'),path=require('node:path'),os=require('node:os'),vm=require('node:vm'),assert=require('node:assert/strict');
const dir=await fs.mkdtemp(path.join(os.tmpdir(),'winter-arc-check-')),file=path.join(dir,'test.json');
try{await fs.writeFile(file,'');const handle={name:'test.json',async getFile(){const text=await fs.readFile(file,'utf8');return {size:Buffer.byteLength(text),async text(){return text;}};},async createWritable(){let data;return {async write(text){data=text;},async close(){await fs.writeFile(file,data);},async abort(){}};}};
const box={window:{},location:{search:''},URLSearchParams,indexedDB:{open(){throw Error('No browser database in this check');}},navigator:{locks:{async request(name,save){return save();}}}};
vm.runInNewContext(await fs.readFile(path.join(__dirname,'disk.js'),'utf8'),box);const disk=box.window.WA_DISK;
await disk.attach({handle,text:''});const a=disk.write({revision:1},null),b=disk.write({revision:2},{minutes:35,elapsed:1000});await Promise.all([a,b]);
const saved=JSON.parse(await fs.readFile(file,'utf8'));assert.equal(saved.format,'winter-arc-file-v1');assert.equal(saved.planner.revision,2);assert.equal(saved.timer.minutes,35);assert.equal(disk.pending,0);
await fs.writeFile(file,'external edit');await assert.rejects(disk.write({revision:3},null),/changed elsewhere/);assert.equal(await fs.readFile(file,'utf8'),'external edit');
await disk.attach({handle,text:'external edit'});await disk.write({revision:4},null);assert.equal(JSON.parse(await fs.readFile(file,'utf8')).planner.revision,4);
const raw=disk.decode('{"version":1}');assert.equal(raw.planner.version,1);assert.equal(raw.timer,null);
console.log('PASS: actual file writes, queued snapshots, timer persistence, external-edit protection and reconnection.');
}finally{await fs.unlink(file).catch(()=>{});await fs.rmdir(dir);}
};
