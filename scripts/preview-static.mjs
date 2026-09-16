// Local-only preview of out/. No application runtime or SPA fallback.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { gzipSync } from "node:zlib";

const root = resolve(process.argv[3] || "out");
const port = Number(process.argv[2] || 3102);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".txt": "text/plain", ".xml": "application/xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".svg": "image/svg+xml", ".ico": "image/x-icon", ".woff2": "font/woff2" };
const headers = Object.fromEntries((await readFile(resolve(root, "_headers"), "utf8")).split("\n").filter(line => line.startsWith("  ")).map(line => { const at = line.indexOf(":"); return [line.slice(0, at).trim(), line.slice(at + 1).trim()]; }));
createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method)) { res.writeHead(405, headers); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
    const base = resolve(root, "." + pathname);
    if (base !== root && !base.startsWith(root + sep)) { res.writeHead(404); res.end(); return; }
    let file;
    for (const candidate of [base, base + ".html", resolve(base, "index.html")]) {
      if (await stat(candidate).then(s => s.isFile()).catch(() => false)) { file = candidate; break; }
    }
    const status = file ? 200 : 404;
    file ||= resolve(root, "404.html");
    const data = await readFile(file);
    const contentType = mime[extname(file)] || "application/octet-stream";
    const acceptsGzip = (req.headers["accept-encoding"] || "").split(",").some(value => {
      const [encoding, ...parameters] = value.trim().split(";");
      const quality = parameters.find(parameter => parameter.trim().startsWith("q="));
      return encoding === "gzip" && (!quality || Number(quality.trim().slice(2)) > 0);
    });
    // Match Pages' negotiated text compression; original asset bytes and all
    // deployed security headers remain unchanged. No image recompression.
    const compressible = /^(text\/|application\/(json|xml))/.test(contentType);
    const compressed = compressible && acceptsGzip;
    const body = compressed ? gzipSync(data) : data;
    res.writeHead(status, { ...headers, "Content-Type": contentType,
      ...(compressible ? { Vary: "Accept-Encoding" } : {}),
      ...(compressed ? { "Content-Encoding": "gzip" } : {}),
      "Content-Length": body.length });
    res.end(req.method === "HEAD" ? undefined : body);
  } catch { res.writeHead(400); res.end(); }
}).listen(port, "127.0.0.1", () => console.log(`Static out/ preview: http://127.0.0.1:${port}`));
