// Stage 1 contract. Capture once; subsequent runs verify the rebuilt static export.
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { JSDOM } from 'jsdom';
import assert from 'node:assert/strict';

const directory = 'artifacts/motion-audit';
const baselinePath = `${directory}/baseline.json`;
const routes = [
  ['/', 'app/(site)/page.tsx', 'index.html', ['HomePage: cinematic hero', 'HomePage: domestic editorial feature', 'HomePage: international editorial feature', 'HomePage: four-step process / ProcessPhoto ×4', 'HomePage: quote action entry', 'HomePage: company editorial feature', 'HomePage: common questions / FaqList', 'HomePage: contact finale']],
  ['/services/domestic', 'app/(site)/services/domestic/page.tsx', 'services/domestic.html', ['PageHero (domestic)', 'ServiceProcess (domestic): three existing articles', 'QuoteBand']],
  ['/services/international', 'app/(site)/services/international/page.tsx', 'services/international.html', ['PageHero (international)', 'ServiceProcess (international): three existing articles', 'QuoteBand']],
  ['/about', 'app/(site)/about/page.tsx', 'about.html', ['PageHero (about)', 'AboutPage: what we do, four service labels, three nested journey sections, purpose caption', 'QuoteBand']],
  ['/contact', 'app/(site)/contact/page.tsx', 'contact.html', ['ContactPage: introduction, illustration, enquiry topics, company channels, SupportForm, response-time caption']],
  ['/get-a-quote', 'app/(site)/get-a-quote/page.tsx', 'get-a-quote.html', ['PageHero (quote) / QuoteMedia', 'QuotePage: before-you-begin aside / EnquiryForm']],
  ['/faq', 'app/(site)/faq/page.tsx', 'faq.html', ['PageHero (faq)', 'FaqList: four native details elements', 'QuoteBand']],
  ['/track', 'app/(site)/track/page.tsx', 'track.html', ['PageHero (legal/default)', 'ShipmentUpdatePage: contact-based shipment support']],
  ['/privacy', 'app/(site)/privacy/page.tsx', 'privacy.html', ['PageHero (legal/default)', 'PrivacyPage: launch requirement and existing privacy information']],
  ['/terms', 'app/(site)/terms/page.tsx', 'terms.html', ['PageHero (legal/default)', 'TermsPage: launch requirement and existing terms information']],
  ['/404.html', 'app/not-found.tsx', '404.html', ['NotFound: message and return-home link']],
];
const hash = value => createHash('sha256').update(value).digest('hex');
const normalize = value => value.replace(/\s+/gu, ' ').trim();
function textContent(node) {
  if (node.nodeType === 3) return node.nodeValue;
  if (node.nodeType !== 1) return '';
  if (['SCRIPT', 'STYLE', 'SVG'].includes(node.tagName)) return '';
  if (node.tagName === 'BR') return '\n';
  const text = [...node.childNodes].map(textContent).join('');
  return /^(H[1-6]|P|LI|SECTION|ARTICLE|DIV|ASIDE|HEADER|FOOTER|NAV|MAIN|LABEL|LEGEND|SUMMARY|OPTION|BUTTON|DETAILS|UL|OL|FORM|FIELDSET)$/.test(node.tagName) ? `\n${text}\n` : text;
}
const attrs = (node, names) => Object.fromEntries(names.map(name => [name, node.getAttribute(name)]));
const elements = (root, selector, names) => [...root.querySelectorAll(selector)].map(node => ({tag:node.tagName.toLowerCase(), text:normalize(node.tagName === 'SCRIPT' ? node.textContent : textContent(node)), ...attrs(node,names)}));
async function filesIn(path) {
  const result=[];
  for(const entry of await readdir(path,{withFileTypes:true})) {
    const file=`${path}/${entry.name}`;
    if(entry.isDirectory()) result.push(...await filesIn(file));
    else if(/\.(tsx?|css|json)$/.test(file)) result.push(file);
  }
  return result.sort();
}
const frozen = ['components/forms/enquiry-form.tsx','components/forms/support-form.tsx','lib/schemas.ts','lib/quote-formsubmit.ts','lib/config.ts','lib/business-settings.ts','app/sitemap.ts','app/robots.ts','next.config.ts','public/_headers'];
async function capture() {
  const pages=[];const imageFiles=new Set();
  for(const [route,source,file,components] of routes) {
    const document=new JSDOM(await readFile(`out/${file}`,'utf8')).window.document;
    const main=document.querySelector('main');assert(main,`Missing main: ${route}`);
    const sections=[...main.children].filter(el=>el.tagName==='SECTION');
    const inventory=(sections.length?sections:[main]).map((el,i)=>({component:components[i], copy:textContent(el).split('\n').map(s=>s.trim()).filter(Boolean).join('\n'), headings:elements(el,'h1,h2,h3,h4,h5,h6',[])}));
    assert.equal(inventory.length,components.length,`Section mapping changed: ${route}`);
    const images=elements(document,'img',['src','srcset','sizes','alt','width','height']);
    for(const img of images)for(const src of [img.src,...(img.srcset||'').split(',').map(s=>s.trim().split(' ')[0])])if(src?.startsWith('/'))imageFiles.add(`out${decodeURI(src)}`);
    pages.push({route,source,components,inventory,contract:{
      text:normalize(textContent(document.body)),
      headings:elements(document,'h1,h2,h3,h4,h5,h6',[]),
      sections:document.querySelectorAll('main section').length,
      links:elements(document,'body a',['href','target','rel','aria-label']),
      images,
      controls:elements(document,'input,textarea,select,option,button',['id','name','type','value','placeholder','required','min','max','step','minlength','maxlength','autocomplete','aria-label','aria-controls','aria-expanded','tabindex']),
      labels:elements(document,'label,legend',['for']),
      forms:elements(document,'form',['action','method','novalidate']).map(({tag,action,method,novalidate})=>({tag,action,method,novalidate})),
      details:elements(document,'details',['open']),
      metadata:elements(document,'title,meta,link[rel="canonical"],script[type="application/ld+json"]',['name','property','content','rel','href','type']),
    }});
  }
  const images=Object.fromEntries(await Promise.all([...imageFiles].sort().map(async file=>[file,hash(await readFile(file))])));
  const sourceFiles=[...new Set([...(await filesIn('app')),...(await filesIn('components')),...(await filesIn('lib')),...frozen,'package.json'])].sort();
  const sources=Object.fromEntries(await Promise.all(sourceFiles.map(async file=>[file,await readFile(file,'utf8')])));
  const extraExports=Object.fromEntries(await Promise.all(['robots.txt','sitemap.xml','_headers'].map(async file=>[file,await readFile(`out/${file}`,'utf8')])));
  return {capturedAt:new Date().toISOString(),pages,images,sources,extraExports,frozen};
}
if(process.argv.includes('--capture')) {
  try { await readFile(baselinePath); throw new Error('Baseline already exists; refusing to overwrite the pre-work contract.'); }
  catch(error) { if(error.code!=='ENOENT') throw error; }
  const baseline=await capture();await mkdir(directory,{recursive:true});
  await writeFile(baselinePath,JSON.stringify(baseline,null,2)+'\n');
  const overview=await readFile(`${directory}/overview.md`,'utf8');
  let md=overview+'\n\n## Exact rendered copy, by route and existing section\n\nCopy below is decoded from a fresh local static export; line breaks separate existing text blocks. Hidden honeypot labels and closed FAQ answers are intentionally included. Exact source snapshots in the companion JSON preserve JSX spelling, entities and dynamic branches as well. This is the local working-tree contract, not a claim about deployment.\n';
  const home=new JSDOM(await readFile('out/index.html','utf8')).window.document;
  for(const [title,selector] of [['Shared SiteHeader','header'],['Shared SiteFooter','footer']])md+=`\n### ${title}\n\n\`\`\`text\n${textContent(home.querySelector(selector)).split('\n').map(s=>s.trim()).filter(Boolean).join('\n')}\n\`\`\`\n`;
  for(const page of baseline.pages) {
    md+=`\n### ${page.route}\n\nSource: \`${page.source}\`\n\nMetadata:\n\n\`\`\`json\n${JSON.stringify(page.contract.metadata,null,2)}\n\`\`\`\n`;
    for(const [i,section] of page.inventory.entries())md+=`\n#### ${i+1}. ${section.component}\n\n\`\`\`text\n${section.copy}\n\`\`\`\n`;
    md+=`\nImage, link, form and accessibility inventory:\n\n<details><summary>Exact attributes for ${page.route}</summary>\n\n\`\`\`json\n${JSON.stringify({images:page.contract.images,links:page.contract.links,forms:page.contract.forms,controls:page.contract.controls,labels:page.contract.labels},null,2)}\n\`\`\`\n\n</details>\n`;
  }
  md+='\n## Dynamic copy and submission contract\n\nThese unmodified source snapshots include pending/success/error messages, validation wording, names, endpoints and payload mapping that are not all visible in an initial page render. Keep these files unchanged; presentation can target their existing DOM from outside.\n';
  for(const file of frozen.filter(f=>/forms\/|schemas|quote-formsubmit|config.ts|business-settings/.test(f)))md+=`\n### ${file}\n\n<details><summary>Exact pre-work source</summary>\n\n\`\`\`tsx\n${baseline.sources[file]}\n\`\`\`\n\n</details>\n`;
  md+='\n## Source snapshot integrity\n\nThe baseline JSON contains complete source snapshots. These hashes identify the pre-work versions; presentation files may change, while the rendered contract and frozen business files must remain equal.\n\n| File | SHA-256 |\n|---|---|\n';
  for(const [file,source] of Object.entries(baseline.sources))md+=`| \`${file}\` | \`${hash(source)}\` |\n`;
  await writeFile('MOTION_AUDIT.md',md);console.log(`Captured ${baseline.pages.length} page outputs, ${imageFilesCount(baseline)} image files and ${Object.keys(baseline.sources).length} source snapshots.`);
} else {
  const baseline=JSON.parse(await readFile(baselinePath,'utf8'));const current=await capture();
  assert.deepEqual(current.pages.map(p=>p.route),baseline.pages.map(p=>p.route));
  for(const page of baseline.pages)assert.deepEqual(current.pages.find(p=>p.route===page.route).contract,page.contract,`Content/semantics changed: ${page.route}`);
  assert.deepEqual(current.images,baseline.images,'Image bytes changed');
  assert.deepEqual(current.extraExports,baseline.extraExports,'Static metadata/headers changed');
  for(const file of baseline.frozen)assert.equal(current.sources[file],baseline.sources[file],`Protected business source changed: ${file}`);
  const routeFiles=Object.keys(current.sources).filter(f=>f.startsWith('app/')&&/\/(page|route)\.tsx?$/.test(f));
  assert.deepEqual(routeFiles,Object.keys(baseline.sources).filter(f=>f.startsWith('app/')&&/\/(page|route)\.tsx?$/.test(f)),'Route files changed');
  console.log('PASS: 11 page outputs retain copy, sections, headings, links, images, controls, labels, form attributes, details and metadata; image bytes, business sources and static metadata/headers unchanged.');
}
function imageFilesCount(baseline) { return Object.keys(baseline.images).length; }
