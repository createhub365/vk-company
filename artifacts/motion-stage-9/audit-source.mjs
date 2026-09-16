import ts from 'typescript';
import { readFileSync, existsSync, readdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, relative } from 'node:path';
const root=process.cwd(), out='artifacts/motion-stage-9';
function files(dir){return readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(`${dir}/${e.name}`):[`${dir}/${e.name}`]);}
const seen=new Set(), edges=[];
function visit(file){
 if(seen.has(file))return; seen.add(file);
 const code=readFileSync(file,'utf8'), source=ts.createSourceFile(file,code,ts.ScriptTarget.Latest,true);
 function follow(spec){if(!spec.startsWith('.')&&!spec.startsWith('@/'))return;const base=spec.startsWith('@/')?resolve(root,spec.slice(2)):resolve(dirname(file),spec);const found=['','.tsx','.ts','.css','/index.tsx','/index.ts'].map(s=>base+s).find(f=>existsSync(f)&&!readdirSafe(f));if(found){const rel=relative(root,found);edges.push([file,rel]);if(/\.(tsx?|css)$/.test(rel))visit(rel);}}
 function walk(node){if((ts.isImportDeclaration(node)||ts.isExportDeclaration(node))&&node.moduleSpecifier&&ts.isStringLiteral(node.moduleSpecifier))follow(node.moduleSpecifier.text);if(ts.isCallExpression(node)&&node.expression.kind===ts.SyntaxKind.ImportKeyword&&ts.isStringLiteral(node.arguments[0]))follow(node.arguments[0].text);ts.forEachChild(node,walk);}
 walk(source);
}
function readdirSafe(path){try{readdirSync(path);return true;}catch{return false;}}
files('app').filter(f=>/\.(tsx?|css)$/.test(f)).forEach(visit);
const hits=[];for(const file of files('components').concat(files('styles'),files('lib'),files('app')).filter(f=>/\.(tsx?|css)$/.test(f))){readFileSync(file,'utf8').split('\n').forEach((line,i)=>{if(/requestAnimationFrame|will-change|willChange|autoRaf|frameloop|ssr: false/.test(line))hits.push({file,line:i+1,mountedImportGraph:seen.has(file),text:line.trim()});});}
const recurringNativeOwners=[{file:'node_modules/motion-dom/dist/es/frameloop/frame.mjs',description:'Motion shared frame batcher; one native recurring requestAnimationFrame owner.'}];
writeFileSync(`${out}/source-audit.json`,JSON.stringify({reachableFiles:[...seen].sort(),edges,hits,recurringNativeOwners},null,2));
console.log('Reachable public source files',seen.size);console.log('Application native rAF calls reachable from public routes:',hits.filter(h=>h.mountedImportGraph&&/requestAnimationFrame\(/.test(h.text)));console.log('Unreachable legacy native rAF / R3F sites:',hits.filter(h=>!h.mountedImportGraph&&/requestAnimationFrame\(|frameloop=/.test(h.text)));
