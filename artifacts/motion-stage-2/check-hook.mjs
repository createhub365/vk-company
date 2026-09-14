import {mkdtemp,cp,symlink,readFile,writeFile,mkdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';import {join} from 'node:path';import {spawnSync} from 'node:child_process';import assert from 'node:assert/strict';
const repo=process.cwd(),directory=await mkdtemp(join(tmpdir(),'vk-hook-check-'));
const run=(cmd,args=[])=>spawnSync(cmd,args,{cwd:directory,encoding:'utf8',maxBuffer:12*1024*1024});
const results=[];
try{
 for(const path of ['app','components','lib','styles','scripts','public','.githooks','package.json','package-lock.json','next.config.ts','tsconfig.json','postcss.config.mjs','next-env.d.ts','MOTION_AUDIT.md'])await cp(join(repo,path),join(directory,path),{recursive:true});
 await mkdir(join(directory,'artifacts/motion-audit'),{recursive:true});await cp(join(repo,'artifacts/motion-audit/baseline.json'),join(directory,'artifacts/motion-audit/baseline.json'));
 await symlink(join(repo,'node_modules'),join(directory,'node_modules'),'dir');
 await writeFile(join(directory,'.gitignore'),'node_modules\n.next\nout\n*.tsbuildinfo\n');
 assert.equal(run('git',['init','--quiet']).status,0);assert.equal(run('git',['add','.']).status,0);
 let r=run('sh',['.githooks/pre-commit']);results.push({case:'unchanged staged content',status:r.status,output:r.stdout+r.stderr});assert.equal(r.status,0,r.stdout+r.stderr);
 const file=join(directory,'app/(site)/page.tsx');const original=await readFile(file,'utf8');await writeFile(file,original.replace('Across cities.','Changed headline.'));
 // Stage the bad copy, then make the working tree look clean: must still reject.
 assert.equal(run('git',['add','app/(site)/page.tsx']).status,0);await writeFile(file,original);
 r=run('sh',['.githooks/pre-commit']);results.push({case:'staged bad copy concealed by clean working copy',status:r.status,output:r.stdout+r.stderr});assert.notEqual(r.status,0);assert.match(r.stderr,/stage the exact content/);
 // A fully staged copy change must reach the rebuilt contract and fail there.
 await writeFile(file,original.replace('Across cities.','Changed headline.'));
 assert.equal(run('git',['add','.']).status,0);
 r=run('sh',['.githooks/pre-commit']);results.push({case:'fully staged changed headline',status:r.status,output:r.stdout+r.stderr});assert.notEqual(r.status,0);assert.match(r.stderr,/Content\/semantics changed/);
 console.log('PASS: pre-commit accepts matching content, rejects partial-staging concealment, rejects a fully staged content change. No commits created.');
}finally{await writeFile(join(repo,'artifacts/motion-stage-2/hook-results.json'),JSON.stringify(results,null,2));await rm(directory,{recursive:true,force:true});}
