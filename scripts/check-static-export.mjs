import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import assert from "node:assert/strict";

const walk = dir => readdirSync(dir).flatMap(name => {
  const path = join(dir, name);
  return statSync(path).isDirectory() ? walk(path) : [path];
});
const pages = ["index", "about", "contact", "get-a-quote", "track", "faq", "privacy", "terms", "services/domestic", "services/international", "404"];
for (const page of pages) assert(existsSync(`out/${page}.html`), `Missing ${page}`);
assert.equal(readFileSync("out/_headers", "utf8"), readFileSync("public/_headers", "utf8"));
for (const path of walk("out")) {
  const name = relative("out", path);
  assert(!/^(archive|admin|api|quote|supabase|tests)(\/|\.)/.test(name), `Retired/private output: ${name}`);
  assert(!/(^|\/)\.env|\.tsx?$|\.sql$/.test(name), `Source/private output: ${name}`);
  assert(statSync(path).size <= 25 * 1024 * 1024, `Pages asset too large: ${name}`);
  if (/\.(html|js|txt|json|xml)$/.test(name)) {
    const source = readFileSync(path, "utf8");
    assert(!/SUPABASE_SERVICE_ROLE_KEY|SMTP_PASS|createPrivilegedClient|\/api\/enquiries|\/api\/support/.test(source), `Retired server reference: ${name}`);
    assert(!/-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(source), `Private key: ${name}`);
  }
}
console.log(`Static export verified: ${pages.length} required HTML documents, matching Pages headers, no retired routes/source/known secret markers, assets within 25 MiB.`);
console.log("This is a scoped artifact check, not a complete security assessment.");
