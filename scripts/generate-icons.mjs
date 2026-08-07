// Gera os ícones PNG do PWA (192, 512, maskable, apple-touch) com Node puro.
// Uso: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public');

const CREAM = [248, 240, 229];
const BROWN = [122, 82, 52];

function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let k = 0; k < 8; k++) {
      crc = crc & 1 ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(width, height, rgb) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc((width * 3 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 3 + 1);
    raw[rowStart] = 0;
    raw.set(rgb.subarray(y * width * 3, (y + 1) * width * 3), rowStart + 1);
  }
  const idat = deflateSync(raw);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

function distToSeg(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const l2 = dx * dx + dy * dy;
  const t = l2 === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / l2));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

function distToRoundRect(px, py, cx, cy, hw, hh, r) {
  const qx = Math.abs(px - cx) - (hw - r);
  const qy = Math.abs(py - cy) - (hh - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
}

function render(size, { maskable = false } = {}) {
  const rgb = new Uint8Array(size * size * 3);
  const half = maskable ? 0.38 : 0.36;
  const inner = maskable ? 0.30 : 0.28;
  const rad = maskable ? 0.05 : 0.12;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) / size;
      const py = (y + 0.5) / size;
      let color = CREAM;

      const dOuter = distToRoundRect(px, py, 0.5, 0.5, half, half, rad);
      const dInner = distToRoundRect(px, py, 0.5, 0.5, inner, inner, rad * 0.7);
      if (dOuter <= 0 && dInner >= 0) color = BROWN;

      const segs = [
        [0.30, 0.66, 0.30, 0.34],
        [0.30, 0.34, 0.50, 0.54],
        [0.50, 0.54, 0.70, 0.34],
        [0.70, 0.34, 0.70, 0.66],
      ];
      for (const [x1, y1, x2, y2] of segs) {
        if (distToSeg(px, py, x1, y1, x2, y2) < 0.045) color = BROWN;
      }

      const i = (y * size + x) * 3;
      rgb[i] = color[0];
      rgb[i + 1] = color[1];
      rgb[i + 2] = color[2];
    }
  }
  return rgb;
}

mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, 'icon-192.png'), encodePng(192, 192, render(192)));
writeFileSync(join(outDir, 'icon-512.png'), encodePng(512, 512, render(512)));
writeFileSync(join(outDir, 'icon-maskable-512.png'), encodePng(512, 512, render(512, { maskable: true })));
writeFileSync(join(outDir, 'apple-touch-icon.png'), encodePng(180, 180, render(180)));
console.log('Ícones gerados em', outDir);
