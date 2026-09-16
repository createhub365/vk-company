// Reproduce this authorized six-image replacement from retained generated PNGs.
// This does not recapture the copy/layout contract or touch other image hashes.
import sharp from 'sharp';
import assert from 'node:assert/strict';
import { readFile, writeFile, copyFile, access } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const root='artifacts/generated-service-photos';
const selections=JSON.parse(await readFile(`${root}/selections.json`,'utf8'));
const baselinePath='artifacts/motion-audit/baseline.json';
const baseline=JSON.parse(await readFile(`${root}/before/baseline.json`,'utf8'));
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const manifest=[];
for(const selection of selections) {
 const {kind,index,source}=selection;
 const filename=`selected-${kind}-${index}-392.webp`;
 const original=`${root}/originals/${kind}-${index}.png`;
 if(!await access(original).then(()=>true,()=>false)) await copyFile(source,original);
 const native=await sharp(original).metadata();
 const ratio=index===1?[49,31]:[196,127];
 const multiplier=Math.floor(Math.min(native.width/ratio[0],native.height/ratio[1]));
 const [width,height]=ratio.map(value=>value*multiplier);
 assert(width>=1251,`Insufficient native resolution: ${filename}`);
 const destination=`public/media/photos/${filename}`;
 const bytes=await sharp(original).resize(width,height,{fit:'cover',position:'centre',withoutEnlargement:true}).webp({quality:94,effort:6}).toBuffer();
 await writeFile(destination,bytes);
 const oldHash=baseline.images[`out/media/photos/${filename}`];assert(oldHash);
 baseline.images[`out/media/photos/${filename}`]=sha(bytes);
 manifest.push({...selection,destination,original,nativePixels:[native.width,native.height],outputPixels:[width,height],aspectRatio:ratio.join(':'),encoding:'WebP quality 94; downsample only; minimal aspect normalization; no sharpening',bytes:bytes.length,oldSha256:oldHash,newSha256:sha(bytes),provenance:'Built-in raster image generation and branding edit using the official transparent logo. Illustrative scenes, not photographs of actual company staff, premises, vehicles or operations.'});
}
assert.equal(manifest.length,6);
const baselineText=JSON.stringify(baseline,null,2)+'\n';
await writeFile(baselinePath,baselineText);
const verifier=await readFile(`${root}/before/verify-content.mjs`,'utf8');
await writeFile('scripts/verify-content.mjs',verifier.replace(/const expectedBaseline = '[a-f0-9]+';/,`const expectedBaseline = '${sha(baselineText)}';`));
await writeFile(`${root}/manifest.json`,JSON.stringify(manifest,null,2)+'\n');
console.log(manifest.map(({destination,nativePixels,outputPixels,bytes})=>({destination,nativePixels,outputPixels,bytes})));
