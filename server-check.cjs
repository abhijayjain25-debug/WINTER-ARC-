/* Real HTTP checks on a temporary loopback port; no browser or save access. */
const assert=require('node:assert/strict');
const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const createServer=require('./server.cjs');

async function checkServer(){
  const server=createServer();
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});
  const request=(url,method='GET')=>new Promise((resolve,reject)=>{
    http.request({hostname:'127.0.0.1',port:server.address().port,path:url,method},res=>{
      const chunks=[];res.on('data',chunk=>chunks.push(chunk));
      res.on('end',()=>resolve({status:res.statusCode,headers:res.headers,body:Buffer.concat(chunks)}));
      res.on('error',reject);
    }).on('error',reject).end();
  });
  try{
    const index=await request('/');
    assert.equal(index.status,200);
    const assets=[...index.body.toString('utf8').matchAll(/(?:src|href)="([^"#]+\.(?:js|css|png))"/g)].map(match=>match[1]);
    for(const file of ['plan.js','planner.js','planner.css'])assert.ok(assets.includes(file));
    await Promise.all(assets.map(async file=>{
      const response=await request('/'+file+'?asset-check=1');
      assert.equal(response.status,200,file+' must load through the local server');
      assert.deepEqual(response.body,fs.readFileSync(path.join(__dirname,file)),file+' must return its actual bytes');
      const expectedType=file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'image/png';
      assert.ok(response.headers['content-type'].startsWith(expectedType),file+' MIME type');
      assert.equal(response.headers['cache-control'],'no-store');
      assert.equal(response.headers['x-content-type-options'],'nosniff');
    }));
    const head=await request('/planner.js','HEAD');assert.equal(head.status,200);assert.equal(head.body.length,0);
    for(const url of ['/server.cjs','/README.md','/missing.js','/assets/../server.cjs','/%2e%2e/server.cjs','/assets/%2e%2e%2fserver.cjs'])assert.equal((await request(url)).status,404,url+' must stay private or missing');
    assert.equal((await request('/%zz')).status,400);
    assert.equal((await request('/planner.js','POST')).status,405);
    assert.equal((await request('/health')).body.toString(),'winter-arc-local-v1');
    console.log('PASS: real local HTTP delivery of every entry-page asset, planner MIME types, HEAD, health and private-path rejection.');
  }finally{
    await new Promise(resolve=>server.close(resolve));
  }
}
checkServer().catch(error=>{console.error(error);process.exitCode=1;});
