// Exact photographs observed on the deployed site; originals are never overwritten.
import sharp from 'sharp';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile('lib/photographs.json', 'utf8'));
const directory = 'public/media/photos';
await mkdir(directory, { recursive: true });
const sources = {
  'process-review': 'assets/photographs/selected-originals/process-review.jpg',
  'process-dispatch': 'assets/photographs/selected-originals/process-dispatch.jpg',
  'process-scan': 'public/media/process/scan.jpg',
  'selected-domestic': 'public/media/domestic-road.png',
  'selected-international': 'public/media/international-cargo-apron.png',
  'selected-home-hero': 'public/media/domestic-courier-road.png',
};
for (const [name, original] of Object.entries(sources)) {
  const metadata = await sharp(original).metadata();
  // 2400px already covers these frames at 3x; keep larger masters outside public.
  const width = Math.min(metadata.width, 2400);
  const widths = [...new Set([480, 768, 1024, 1440, width].filter(w => w <= width))].sort((a,b)=>a-b);
  for (const w of widths) await sharp(original).resize({ width: w, withoutEnlargement: true }).webp({ quality: 94, effort: 6 }).toFile(`${directory}/${name}-${w}.webp`);
  const { height } = await sharp(`${directory}/${name}-${width}.webp`).metadata();
  manifest[name] = { width, height, widths, original, illustrative: true };
}
// These six exact images only exist inside the supplied 1554x1012 composition.
// Extract native pixels, without enlarging or inventing a high-resolution master.
const composition = 'public/media/international/image.png';
for (const [kind, left] of [['domestic',38],['international',814]]) {
  for (const [index, top, height] of [[1,144,248],[2,432,254],[3,724,254]]) {
    const name = `selected-${kind}-${index}`;
    await sharp(composition).extract({ left, top, width: 392, height }).webp({ lossless: true, effort: 6 }).toFile(`${directory}/${name}-392.webp`);
    manifest[name] = { width:392, height, widths:[392], original:composition, illustrative:true };
  }
}
await writeFile('lib/photographs.json', JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared exact selected photos; service-row source limit remains 392px.');
