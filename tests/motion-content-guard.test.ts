import { afterEach, describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync, symlinkSync, unlinkSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const repo = process.cwd();
const baseline = JSON.parse(readFileSync("artifacts/motion-audit/baseline.json", "utf8"));
const htmlFixtures = JSON.parse(readFileSync("artifacts/motion-stage-2/content-test-fixtures.json", "utf8"));
const temporary: string[] = [];
function fixture() {
  const directory = mkdtempSync(resolve(tmpdir(), "vk-motion-contract-")); temporary.push(directory);
  const write = (path: string, text: string) => { const full=resolve(directory,path);mkdirSync(dirname(full),{recursive:true});writeFileSync(full,text); };
  write("artifacts/motion-audit/baseline.json",JSON.stringify(baseline));
  write("MOTION_AUDIT.md",readFileSync(resolve(repo,"MOTION_AUDIT.md"),"utf8"));
  for(const [file,source] of Object.entries(baseline.sources))write(file,source as string);
  for(const [file,text] of Object.entries(baseline.extraExports))write(`out/${file}`,text as string);
  for(const page of baseline.pages) {
    const file=page.route==="/"?"index.html":page.route==="/404.html"?"404.html":`${page.route.slice(1)}.html`;
    // Historical Stage 2 fixtures predate the explicitly approved caption
    // removals. Apply only that exact removal before exercising the guard.
    let html = htmlFixtures[file] as string;
    for (const caption of ["Illustrative courier environment", "Illustrative route imagery", "Illustrative international logistics", "Illustrative operations environment"]) {
      html = html.replaceAll(`<span>${caption}</span>`, "");
    }
    write(`out/${file}`,html);
  }
  for(const file of Object.keys(baseline.images)) { const full=resolve(directory,file);mkdirSync(dirname(full),{recursive:true});symlinkSync(resolve(repo,file.replace(/^out\//,"public/")),full); }
  const check=()=>spawnSync(process.execPath,[resolve(repo,"scripts/audit-motion-content.mjs")],{cwd:directory,encoding:"utf8"});
  return {directory,write,check};
}
afterEach(()=>{for(const directory of temporary.splice(0))rmSync(directory,{recursive:true,force:true});});
describe("motion content contract rejects regressions",()=>{
  it("accepts the preserved static content",()=>{expect(fixture().check().status).toBe(0);});
  it("rejects a changed headline",()=>{const f=fixture();const html=readFileSync(resolve(f.directory,"out/index.html"),"utf8");f.write("out/index.html",html.replace("Across cities.","Changed headline."));const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Content/semantics changed");});
  it("rejects a photo disclaimer added back to the DOM",()=>{const f=fixture();const file="out/services/domestic.html";const html=readFileSync(resolve(f.directory,file),"utf8");f.write(file,html.replace("</main>","<span>Illustrative courier environment</span></main>"));const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Content/semantics changed");});
  it("rejects an editorial whitespace byte change that normalized copy would conceal",()=>{const f=fixture();const html=readFileSync(resolve(f.directory,"out/index.html"),"utf8");f.write("out/index.html",html.replace("Share the origin, destination", "Share the origin,  destination"));const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Editorial prose bytes changed");});
  it("rejects an edited editorial block in the Markdown contract",()=>{const f=fixture();const file="MOTION_AUDIT.md";const audit=readFileSync(resolve(f.directory,file),"utf8");f.write(file,audit.replace("Planned around your actual route.","Planned around your changed route."));const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Editorial audit bytes changed");});
  it("rejects changed image bytes even with the same URL",()=>{const f=fixture();const image=Object.keys(baseline.images)[0];unlinkSync(resolve(f.directory,image));f.write(image,"altered image");const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Image bytes changed");});
  it("rejects a dynamic form-message change even if exported HTML is unchanged",()=>{const f=fixture();const file="components/forms/enquiry-form.tsx";f.write(file,baseline.sources[file].replace("Submitting…","Sending now…"));const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Protected business source changed");});
  it("rejects an added route",()=>{const f=fixture();f.write("app/unapproved/page.tsx","export default function Page(){return null;}");const r=f.check();expect(r.status).not.toBe(0);expect(r.stderr).toContain("Route files changed");});
});
