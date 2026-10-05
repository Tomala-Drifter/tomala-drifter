// Generates the PWA / favicon PNGs into public/icons (no dependencies: tiny PNG encoder + SDF rasterizer).
// Usage: node scripts/gen-icons.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { deflateSync } from 'node:zlib';

const BG = [0x0e, 0x0f, 0x13];
const ACCENT = [0x2e, 0xc4, 0xa6];
const INK = [0x05, 0x2a, 0x22];

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(td));
  return Buffer.concat([len, td, crc]);
};

function png(size, pixel) {
  const raw = Buffer.alloc(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 3 + 1)] = 0;
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixel(x + 0.5, y + 0.5);
      const o = y * (size * 3 + 1) + 1 + x * 3;
      raw[o] = r; raw[o + 1] = g; raw[o + 2] = b;
    }
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; ihdr[9] = 2; // 8-bit RGB
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const mix = (a, b, t) => a.map((v, i) => Math.round(v + (b[i] - v) * Math.min(1, Math.max(0, t))));

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - ax - t * dx, py - ay - t * dy);
}

// Rounded mint square (56% of the icon, inside the maskable safe zone) with a dark check mark.
function icon(size, boxFrac = 0.56) {
  const c = size / 2;
  const half = (size * boxFrac) / 2;
  const radius = half * 0.6;
  const unit = (half * 2 * 0.6) / 24; // check drawn in a 24-unit box, 60% of the square
  const ox = c - 12 * unit, oy = c - 12 * unit;
  const P = [[5, 12.5], [9.5, 17], [19, 7.5]].map(([x, y]) => [ox + x * unit, oy + y * unit]);
  const sw = (3.2 * unit) / 2;
  return png(size, (x, y) => {
    const qx = Math.abs(x - c) - (half - radius), qy = Math.abs(y - c) - (half - radius);
    const box = Math.hypot(Math.max(qx, 0), Math.max(qy, 0)) + Math.min(Math.max(qx, qy), 0) - radius;
    let col = mix(BG, ACCENT, 0.5 - box);
    const d = Math.min(segDist(x, y, ...P[0], ...P[1]), segDist(x, y, ...P[1], ...P[2])) - sw;
    return mix(col, INK, 0.5 - d);
  });
}

mkdirSync('public/icons', { recursive: true });
for (const [name, size, frac] of [
  ['icon-192.png', 192],
  ['icon-512.png', 512],
  ['apple-touch-icon.png', 180, 0.7],
  ['favicon-32.png', 32, 0.94],
]) {
  writeFileSync(`public/icons/${name}`, icon(size, frac));
  console.log(`public/icons/${name}`);
}
