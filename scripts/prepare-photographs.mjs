import sharp from 'sharp';
import { mkdir, readdir, writeFile } from 'node:fs/promises';
const originalDir = 'assets/photographs/originals';
await mkdir('public/media/photos', { recursive: true });
const sources = Object.fromEntries((await readdir(originalDir)).filter(file => file.endsWith('.png')).map(file => [file.slice(0,-4), `${originalDir}/${file}`]));
sources.workspace = 'public/media/dispatch-workspace.png';
sources['existing-aircraft'] = 'public/media/homepage-international-cargo.jpg';
// Preserve fine parcel, face and aircraft detail without lossy WebP encoding.
const losslessPhotos = new Set(["aircraft", "details", "dispatch", "domestic", "review", "scan"]);
const manifest = {};
for (const [name, path] of Object.entries(sources)) {
  const { width, height } = await sharp(path).metadata();
  const widths = [...new Set([480, 768, 1024, 1440, width].filter(w => w <= width))].sort((a,b)=>a-b);
  for (const w of widths) await sharp(path).resize({ width: w, withoutEnlargement: true }).webp({ lossless: losslessPhotos.has(name), quality: 90, effort: 6 }).toFile(`public/media/photos/${name}-${w}.webp`);
  manifest[name] = { width, height, widths, original: path, illustrative: true };
}
await writeFile('lib/photographs.json', JSON.stringify(manifest, null, 2)+'\n');
console.log(manifest);

// Also retain the exact deployed selections when rebuilding responsive assets.
await import("./prepare-selected-photographs.mjs");
