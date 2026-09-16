import { readFile,writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const root='artifacts/generated-service-photos';
const old=JSON.parse(await readFile(`${root}/before/baseline.json`,'utf8'));
const current=JSON.parse(await readFile('artifacts/motion-audit/baseline.json','utf8'));
const manifest=JSON.parse(await readFile(`${root}/manifest.json`,'utf8'));
const expected=manifest.map(m=>m.destination.replace(/^public\//,'out/')).sort();
const changed=Object.keys(old.images).filter(key=>old.images[key]!==current.images[key]).sort();
assert.deepEqual(changed,expected);assert.equal(changed.length,6);
assert.equal(Object.keys(current.images).length,66);
assert.deepEqual({...current,images:old.images},old,'Non-image content contract changed');
const hashes=JSON.parse(await readFile(`${root}/before/hashes.json`,'utf8'));
const allowed=new Set([...manifest.map(m=>m.destination),'artifacts/motion-audit/baseline.json','scripts/verify-content.mjs']);
const changedFiles=[];
for(const [path,hash] of Object.entries(hashes)) {
 const now=createHash('sha256').update(await readFile(path)).digest('hex');
 if(now!==hash){assert(allowed.has(path),`Unexpected pre-existing file changed: ${path}`);changedFiles.push(path);}
}
assert.equal(changedFiles.length,8);
await writeFile(`${root}/scope-results.json`,JSON.stringify({changedFiles,changedImageContractEntries:changed,preservedImageEntries:60,allOtherContractDataIdentical:true,preExistingStage7WorkUnchanged:true},null,2)+'\n');
console.log('PASS: exactly six image files plus six approved manifest hashes and its integrity pin. All other pre-existing files and contract data unchanged.');
