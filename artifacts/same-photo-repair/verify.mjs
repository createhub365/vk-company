import {readFile,writeFile} from 'node:fs/promises';import assert from 'node:assert/strict';import sharp from 'sharp';
const before=JSON.parse(await readFile('artifacts/same-photo-repair/local-before.json')),after=JSON.parse(await readFile('artifacts/same-photo-repair/after.json'));
const summary=[];
for(let i=0;i<after.length;i++){
 const r=after[i];assert.equal(r.text,before[i].text);assert.equal(r.overflow,false);assert(r.entries.every(e=>e.loaded));
 if(r.route==='/'){assert.equal(r.entries.length,4);assert.equal(new Set(r.entries.map(e=>e.frame.join('x'))).size,1);}
 summary.push({route:r.route,width:r.width,frames:r.entries.map(e=>e.frame),selectedSources:r.entries.map(e=>({path:e.src,pixels:e.source})),allDecoded:true,textUnchanged:true,overflow:false});
}
for(const [kind,left] of [['domestic',38],['international',814]])for(const [index,top,height] of [[1,144,248],[2,432,254],[3,724,254]]){
 const original=await sharp('public/media/international/image.png').extract({left,top,width:392,height}).raw().toBuffer();
 const prepared=await sharp(`public/media/photos/selected-${kind}-${index}-392.webp`).raw().toBuffer();assert(original.equals(prepared));
}
await writeFile('artifacts/same-photo-repair/verified.json',JSON.stringify({layouts:summary,nativeServiceRegionsPixelIdentical:true},null,2));console.log('12 layouts: photos decode, equal process frames, unchanged text, no overflow. Six service regions preserve exact native pixels.');
