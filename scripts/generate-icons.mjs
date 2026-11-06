// Gera o favicon SVG e os PNGs de instalação a partir do mesmo monograma.
// Uso: node scripts/generate-icons.mjs
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'public');

const ICON_BACKGROUND = [64, 90, 103];
const ICON_FOREGROUND = [249, 249, 251];
const ICON_SIZE = 32;
const ICON_RADIUS = 4;
const STROKE_WIDTH = 2.8;
const MONOGRAM = [[8.5, 23], [8.5, 9], [16, 18], [23.5, 9], [23.5, 23]];

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

function encodePng(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    raw.set(rgba.subarray(y * width * 4, (y + 1) * width * 4), rowStart + 1);
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

function render(size, { solidBackground = false } = {}) {
  const rgba = new Uint8Array(size * size * 4);
  const scale = size / ICON_SIZE;
  const segments = MONOGRAM.slice(1).map((point, index) => [...MONOGRAM[index], ...point]);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const px = (x + 0.5) / scale;
      const py = (y + 0.5) / scale;
      const backgroundDistance = distToRoundRect(px, py, 16, 16, 16, 16, ICON_RADIUS);
      const alpha = solidBackground ? 1 : Math.max(0, Math.min(1, 0.5 - backgroundDistance * scale));
      const strokeDistance = Math.min(...segments.map(segment => distToSeg(px, py, ...segment)));
      const coverage = Math.max(0, Math.min(1, 0.5 + (STROKE_WIDTH / 2 - strokeDistance) * scale));
      const i = (y * size + x) * 4;
      for (let channel = 0; channel < 3; channel++) {
        rgba[i + channel] = Math.round(ICON_BACKGROUND[channel] + (ICON_FOREGROUND[channel] - ICON_BACKGROUND[channel]) * coverage);
      }
      rgba[i + 3] = Math.round(alpha * 255);
    }
  }
  return rgba;
}

mkdirSync(outDir, { recursive: true });
const hex = color => `#${color.map(channel => channel.toString(16).padStart(2, '0')).join('')}`;
const path = MONOGRAM.map(([x, y], index) => `${index ? 'L' : 'M'}${x} ${y}`).join('');
writeFileSync(join(outDir, 'img/favicon.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">\n  <rect width="32" height="32" rx="${ICON_RADIUS}" fill="${hex(ICON_BACKGROUND)}"/>\n  <path d="${path}" fill="none" stroke="${hex(ICON_FOREGROUND)}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round" stroke-linejoin="round"/>\n</svg>\n`);
writeFileSync(join(outDir, 'icon-192.png'), encodePng(192, 192, render(192)));
writeFileSync(join(outDir, 'icon-512.png'), encodePng(512, 512, render(512)));
writeFileSync(join(outDir, 'icon-maskable-512.png'), encodePng(512, 512, render(512, { solidBackground: true })));
writeFileSync(join(outDir, 'apple-touch-icon.png'), encodePng(180, 180, render(180, { solidBackground: true })));
console.log('Ícones gerados em', outDir);
