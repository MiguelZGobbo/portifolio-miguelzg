import { writeFileSync } from 'node:fs';

const text1 = 'Resume not available in English yet.';
const text2 = 'Please check the Portuguese version.';

function escapePdf(s) {
  return s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

const content = [
  'BT',
  '/F1 22 Tf',
  '72 720 Td',
  `(${escapePdf(text1)}) Tj`,
  '/F1 14 Tf',
  '72 680 Td',
  `(${escapePdf(text2)}) Tj`,
  'ET',
].join('\n');

const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
  '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  `<< /Length ${content.length} >>\nstream\n${content}\nendstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [];
objects.forEach((body, i) => {
  offsets.push(Buffer.byteLength(pdf, 'latin1'));
  pdf += `${i + 1} 0 obj\n${body}\nendobj\n`;
});
const xrefPos = Buffer.byteLength(pdf, 'latin1');
pdf += `xref\n0 ${objects.length + 1}\n`;
pdf += '0000000000 65535 f \n';
offsets.forEach((off) => {
  pdf += `${String(off).padStart(10, '0')} 00000 n \n`;
});
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
pdf += `startxref\n${xrefPos}\n%%EOF\n`;

writeFileSync(new URL('../public/files/MiguelZagerGobbo-CV-EN.pdf', import.meta.url), Buffer.from(pdf, 'latin1'));
console.log('placeholder EN criado em public/files/MiguelZagerGobbo-CV-EN.pdf');
