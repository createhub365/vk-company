// Independent git-commit/export audit: no MOTION_AUDIT or motion baseline input.
import {JSDOM} from 'jsdom';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
const dir='artifacts/original-copy-audit';
const routes=['/','/about','/contact','/get-a-quote','/faq','/track','/privacy','/terms','/404.html','/services/domestic','/services/international'];
const clean=value=>value.replace(/\s+/gu,' ').trim();
function prose(node){
 if(node.nodeType===3)return node.nodeValue;
 if(node.nodeType!==1||['SCRIPT','STYLE','SVG','NOSCRIPT'].includes(node.tagName))return '';
 if(node.tagName==='BR')return '\n';
 const text=[...node.childNodes].map(prose).join('');
 return /^(ADDRESS|ARTICLE|ASIDE|BLOCKQUOTE|BUTTON|DD|DETAILS|DIV|DT|FIELDSET|FIGCAPTION|FOOTER|FORM|H[1-6]|HEADER|LABEL|LEGEND|LI|MAIN|NAV|OL|OPTION|P|SECTION|SUMMARY|UL)$/.test(node.tagName)?`\n${text}\n`:text;
}
function delta(oldValues,newValues){const old=[...oldValues],added=[];for(const value of newValues){const i=old.indexOf(value);if(i<0)added.push(value);else old.splice(i,1);}return {removed:old,added};}
const versions={};
for(const version of ['original','current']){
 versions[version]=[];await mkdir(`${dir}/${version}-text`,{recursive:true});
 for(const route of routes){
  const file=route==='/'?'index.html':route==='/404.html'?'404.html':route.slice(1)+'.html';
  const document=new JSDOM(await readFile(`${dir}/${version}-export/${file}`,'utf8')).window.document;
  const body=prose(document.body).split('\n').map(clean).filter(Boolean).join('\n');
  const page={route,body,bodyNormalized:clean(body),headings:[...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(e=>clean(prose(e))),images:[...document.querySelectorAll('img')].map(e=>({alt:e.getAttribute('alt'),src:e.getAttribute('src')})),accessibleLabels:[...document.querySelectorAll('[aria-label]')].map(e=>e.getAttribute('aria-label')),placeholders:[...document.querySelectorAll('[placeholder]')].map(e=>e.getAttribute('placeholder')),controls:[...document.querySelectorAll('input,select,textarea,button')].map(e=>({name:e.getAttribute('name'),type:e.getAttribute('type'),text:clean(prose(e))})),metadata:[...document.querySelectorAll('title,meta[name],meta[property],script[type="application/ld+json"]')].map(e=>({tag:e.tagName,name:e.getAttribute('name'),property:e.getAttribute('property'),content:e.getAttribute('content'),text:e.textContent})),links:[...document.querySelectorAll('a')].map(e=>({text:clean(prose(e)),href:e.getAttribute('href')}))};
  versions[version].push(page);await writeFile(`${dir}/${version}-text/${file.replaceAll('/','__')}.txt`,body+'\n');
 }
}
const changes=versions.original.map((old,index)=>{const now=versions.current[index];return {route:old.route,bodyEqual:old.bodyNormalized===now.bodyNormalized,imageAltDelta:delta(old.images.map(i=>i.alt),now.images.map(i=>i.alt)),accessibilityLabelDelta:delta(old.accessibleLabels,now.accessibleLabels),placeholderDelta:delta(old.placeholders,now.placeholders),headingsEqual:JSON.stringify(old.headings)===JSON.stringify(now.headings),controlsEqual:JSON.stringify(old.controls)===JSON.stringify(now.controls),metadataEqual:JSON.stringify(old.metadata)===JSON.stringify(now.metadata),linksEqual:JSON.stringify(old.links)===JSON.stringify(now.links)};});
// Dynamic/error copy is not all emitted on initial render. Compare complete
// source bytes directly to git for the modules that own business/form messages.
const messageFiles=['components/forms/enquiry-form.tsx','components/forms/support-form.tsx','lib/schemas.ts','lib/quote-formsubmit.ts','lib/business-settings.ts','lib/config.ts'];
const dynamic=[];for(const file of messageFiles){const old=execFileSync('git',['show',`c4e5357:${file}`]);const now=await readFile(file);dynamic.push({file,identical:old.equals(now),oldSha256:createHash('sha256').update(old).digest('hex'),currentSha256:createHash('sha256').update(now).digest('hex')});}
await writeFile(`${dir}/copy-inventory.json`,JSON.stringify(versions,null,2));
await writeFile(`${dir}/comparison.json`,JSON.stringify({changes,dynamic},null,2));console.log(JSON.stringify({changes,dynamic},null,2));
