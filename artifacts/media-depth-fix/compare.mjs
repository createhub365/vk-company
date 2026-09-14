import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';
const b=JSON.parse(await readFile('artifacts/media-depth-fix/baseline-audit.json')),a=JSON.parse(await readFile('artifacts/media-depth-fix/after-audit.json'));
const summary={combinations:a.length,contentDifferences:[],issues:[],quoteGeometry:[],densityShortfalls:[]};
for(let i=0;i<a.length;i++){
 if(JSON.stringify(a[i].content)!==JSON.stringify(b[i].content))summary.contentDifferences.push([a[i].route,a[i].width]);
 if(a[i].overflow||a[i].errors.length)summary.issues.push(a[i]);
 if(a[i].route==='/get-a-quote')summary.quoteGeometry.push({width:a[i].width,headingUnchanged:JSON.stringify(a[i].layout['h1'])===JSON.stringify(b[i].layout['h1']),formUnchanged:JSON.stringify(a[i].layout['.form-shell'])===JSON.stringify(b[i].layout['.form-shell'])});
 for(const p of a[i].photos)if(p.pixels[0]+2<p.img.width*(a[i].width<500?3:2))summary.densityShortfalls.push({route:a[i].route,width:a[i].width,asset:p.selected,pixels:p.pixels[0],cssWidth:p.img.width});
}
assert.equal(summary.contentDifferences.length,0);assert.equal(summary.issues.length,0);assert(summary.quoteGeometry.every(x=>x.headingUnchanged&&x.formUnchanged));
await writeFile('artifacts/media-depth-fix/verification-summary.json',JSON.stringify(summary,null,2));console.log(summary);
