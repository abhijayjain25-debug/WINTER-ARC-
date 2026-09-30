const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = __dirname;
const types = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
const allowed = new Set(['index.html','styles.css','motion.css','data.js','core.js','app.js','motion.js','custom.js','disk.js','profile.js','life.js']);
const server = http.createServer((req,res)=>{
  if(req.method!=='GET' && req.method!=='HEAD'){res.writeHead(405);return res.end();}
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname).replace(/^\//,'')||'index.html';}catch{res.writeHead(400);return res.end();}
  if(name==='health'){res.writeHead(200,{'Content-Type':'text/plain'});return res.end('winter-arc-local-v1');}
  if(!allowed.has(name) && !/^assets\/[a-zA-Z0-9_-]+\.(png|webp|svg)$/.test(name)){res.writeHead(404);return res.end('Not found');}
  fs.readFile(path.join(root,name),(err,data)=>{if(err){res.writeHead(404);return res.end('Not found');}res.writeHead(200,{'Content-Type':types[path.extname(name)]||'application/octet-stream','Cache-Control':'no-store','X-Content-Type-Options':'nosniff','Referrer-Policy':'no-referrer'});res.end(req.method==='HEAD'?undefined:data);});
});
server.on('error',err=>{console.error(err.message);process.exitCode=1;});
server.listen(47827,'127.0.0.1',()=>console.log('Winter Arc: http://127.0.0.1:47827'));
