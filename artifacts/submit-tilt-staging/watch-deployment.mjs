import {execFileSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
const sha=process.argv[2];
if(!/^[a-f0-9]{40}$/.test(sha||''))throw new Error('Expected the exact commit SHA');
const deadline=Date.now()+15*60_000;
while(Date.now()<deadline){
 const response=JSON.parse(execFileSync('gh',['api',`repos/createhub365/vk-company/commits/${sha}/check-runs`],{encoding:'utf8'}));
 const check=response.check_runs.find(c=>c.name==='Cloudflare Pages'&&c.head_sha===sha);
 const evidence={checkedAt:new Date().toISOString(),sha,check:check?{id:check.id,name:check.name,status:check.status,conclusion:check.conclusion,head_sha:check.head_sha,details_url:check.details_url,output:check.output}:null};
 await writeFile('artifacts/submit-tilt-staging/deployment-check.json',JSON.stringify(evidence,null,2));
 console.log(evidence.checkedAt,check?.status||'waiting for Cloudflare check',check?.conclusion||'');
 if(check?.status==='completed'){
  if(check.conclusion!=='success')throw new Error(`Cloudflare result: ${check.conclusion}. See deployment-check.json`);
  const url=check.output.summary.match(/href=['"](https:\/\/[^'"\s]+\.pages\.dev)['"]/u)?.[1];
  if(!url||!new URL(url).hostname.endsWith('.vk-company.pages.dev'))throw new Error('Successful check did not provide the expected Pages preview URL');
  await writeFile('artifacts/submit-tilt-staging/deployment-url.txt',url+'\n');console.log('VERIFIED_DEPLOYMENT',sha,url);process.exit(0);
 }
 await new Promise(resolve=>setTimeout(resolve,15000));
}
throw new Error('Cloudflare did not finish within 15 minutes; deployment is not confirmed');
