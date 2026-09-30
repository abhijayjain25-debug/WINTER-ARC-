/* Copy only public app assets; planner files and developer scratch never ship. */
const fs=require('node:fs'),path=require('node:path');
const files=['index.html','styles.css','motion.css','data.js','core.js','custom.js','disk.js','profile.js','syllabus.js','life.js','app.js','motion.js'];
const out=path.join(__dirname,'dist');fs.mkdirSync(path.join(out,'assets'),{recursive:true});
for(const name of files)fs.copyFileSync(path.join(__dirname,name),path.join(out,name));
const art=new Set(['social-preview.jpg','pdf-reader.mjs','pdf-worker.mjs','word-reader.js','pdf-reader-LICENSE.txt','word-reader-LICENSE.txt','winter-banner.png','winter-arc-icon.png','winter-arc.ico',...require('./custom.js').companions.flatMap(p=>p.assets||[p.asset])]);
for(const name of art)fs.copyFileSync(path.join(__dirname,'assets',name),path.join(out,'assets',name));
fs.writeFileSync(path.join(out,'.nojekyll'),'');console.log('Built static app in dist/ (no database, dependencies or personal data).');
