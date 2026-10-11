const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.mjs':'text/javascript; charset=utf-8','.txt':'text/plain; charset=utf-8','.css':'text/css; charset=utf-8','.ico':'image/x-icon','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
// Root assets come from the entry page so new features cannot miss the allowlist.
const allowed = new Set(['index.html',...Array.from(fs.readFileSync(path.join(root,'index.html'),'utf8').matchAll(/(?:src|href)="([a-zA-Z0-9_-]+\.(?:js|css))"/g),match=>match[1])]);
function createServer(){return http.createServer((req,res)=>{
  if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);return res.end();}
  if(name==='health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('winter-arc-local-v1');}
  if(!allowed.has(name) && !/^assets\/[a-zA-Z0-9_-]+\.(jpg|png|webp|svg|ico|js|mjs|txt)$/.test(name)){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(root,name),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:data);});
});}
module.exports = createServer;
if(require.main===module){
  const server=createServer();
  server.on('error',err=>{console.error(err.message);process.exitCode=1;});
  server.listen(47827,'127.0.0.1',()=>console.log('Winter Arc: http://127.0.0.1:47827'));
}
