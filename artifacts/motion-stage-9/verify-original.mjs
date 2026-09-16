import {JSDOM} from 'jsdom';
import {readFileSync,writeFileSync,mkdirSync,readdirSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const dir='artifacts/motion-stage-9/final-preservation';mkdirSync(dir,{recursive:true});
const original='artifacts/original-copy-audit/original-export';
const baseline=JSON.parse(readFileSync('artifacts/motion-audit/baseline.json'));
const hash=b=>createHash('sha256').update(b).digest('hex');
const clean=s=>s.replace(/\s+/gu,' ').trim();
function prose(node){if(node.nodeType===3)return node.nodeValue;if(node.nodeType!==1||['SCRIPT','STYLE','SVG','NOSCRIPT'].includes(node.tagName))return '';if(node.tagName==='BR')return '\n';const text=[...node.childNodes].map(prose).join('');return /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|BUTTON|DD|DETAILS|DIV|DT|FIELDSET|FIGCAPTION|FOOTER|FORM|H[1-6]|HEADER|LABEL|LEGEND|LI|MAIN|NAV|OL|OPTION|P|SECTION|SUMMARY|UL)$/.test(node.tagName)?`\n${text}\n`:text;}
const approvedRemovals={'/':['Illustrative route imagery','Illustrative international logistics','Illustrative operations environment'],'/about':['Illustrative courier environment'],'/services/domestic':['Illustrative courier environment'],'/services/international':['Illustrative courier environment'],'/get-a-quote':['VKC']};
const pages=[];
for(const entry of baseline.pages){const route=entry.route,file=route==='/'?'index.html':route==='/404.html'?'404.html':route.slice(1)+'.html';const old=new JSDOM(readFileSync(`${original}/${file}`,'utf8')).window.document,now=new JSDOM(readFileSync(`out/${file}`,'utf8')).window.document;let oldText=clean(prose(old.body));for(const caption of approvedRemovals[route]||[]){assert(oldText.includes(caption));oldText=clean(oldText.replace(caption,''));}const currentText=clean(prose(now.body));assert.equal(currentText,oldText,`Unapproved body text difference ${route}`);
 const semantic={};for(const selector of ['h1,h2,h3,h4,h5,h6','a','input,select,textarea,option,button','label,legend','details','title,meta[name],meta[property],link[rel="canonical"],script[type="application/ld+json"]']){const inventory=d=>[...d.querySelectorAll(selector)].map(e=>({tag:e.tagName,text:clean(e.tagName==='SCRIPT'?e.textContent:prose(e)),...Object.fromEntries(['href','name','type','value','placeholder','for','content','property','action','method','aria-label','aria-controls','aria-expanded'].map(a=>[a,e.getAttribute(a)]))}));assert.deepEqual(inventory(now),inventory(old),`${route}: ${selector}`);semantic[selector]='identical';}
 const sectionsOld=old.querySelectorAll('main section').length,sectionsNow=now.querySelectorAll('main section').length;assert.equal(sectionsNow,sectionsOld);
 const imageInventory=d=>[...d.querySelectorAll('img')].map(e=>Object.fromEntries(['src','alt','srcset','width','height','sizes'].map(a=>[a,e.getAttribute(a)])));
 assert.deepEqual(imageInventory(now),entry.contract.images.map(image=>Object.fromEntries(Object.entries(image).filter(([key])=>!["text","tag"].includes(key)))),`Image drift from approved baseline: ${route}`);
 pages.push({route,unapprovedTextChanges:0,approvedRemovedText:approvedRemovals[route]||[],semantic,sections:sectionsNow,originalImages:imageInventory(old),approvedCurrentImages:imageInventory(now)});
}
const protectedSources=baseline.frozen.map(file=>{const old=execFileSync('git',['show',`c4e5357:${file}`]);const now=readFileSync(file);assert(old.equals(now),file);return {file,unchangedSinceOriginal:true,sha256:hash(now)};});
const oldRoutes=execFileSync('git',['ls-tree','-r','--name-only','c4e5357','app'],{encoding:'utf8'}).trim().split('\n').filter(f=>/\/(page|route)\.tsx?$/.test(f));
const walk=dir=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(`${dir}/${e.name}`):[`${dir}/${e.name}`]);const newRoutes=walk('app').filter(f=>/\/(page|route)\.tsx?$/.test(f));assert.deepEqual(newRoutes.sort(),oldRoutes.sort());
const images=Object.entries(baseline.images).map(([file,expected])=>{assert.equal(hash(readFileSync(file)),expected,file);return {file,sha256:expected};});
const result={originalCommit:execFileSync('git',['rev-parse','c4e5357'],{encoding:'utf8'}).trim(),approvedBaselineSha256:hash(readFileSync('artifacts/motion-audit/baseline.json')),pages,protectedSources,routeFiles:newRoutes,verifiedImages:images};
writeFileSync(`${dir}/comparison.json`,JSON.stringify(result,null,2));console.log('PASS: Original-commit body text differs only by six approved captions and decorative VKC. Headings, links, controls, labels, details, metadata, section counts, routes and protected sources match original; all 66 images match approved byte hashes.');
