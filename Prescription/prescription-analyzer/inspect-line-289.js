// inspect-line-289.js
const fs = require('fs');
const path = 'C:\\Users\\ajayy\\OneDrive\\Desktop\\Prescription\\Prescription\\prescription-analyzer\\src\\components\\PrescriptionResults.tsx';

const txt = fs.readFileSync(path, 'utf8');
const lines = txt.split(/\r?\n/);

const lineno = 289 - 1; // Line 289 (zero-based index)

if (lineno < 0 || lineno >= lines.length) {
  console.error('Line out of range. File has', lines.length, 'lines.');
  process.exit(1);
}

const line = lines[lineno];

console.log('----- LINE 289 (raw) -----');
console.log(line);
console.log('----- CHARS with HEX -----');

for (let i = 0; i < line.length; i++) {
  const ch = line[i];
  const code = ch.charCodeAt(0);
  const display = ch === ' ' ? '[space]' : ch === '\t' ? '[tab]' : ch;
  console.log(String(i + 1).padStart(3, ' '), display, '0x' + code.toString(16).padStart(2, '0'));
}

const nonAscii = [...line].filter(c => c.charCodeAt(0) > 127);
if (nonAscii.length) {
  console.log('Non-ASCII characters found:', nonAscii.map(c =>
    `${c} (0x${c.charCodeAt(0).toString(16)})`
  ).join(', '));
} else {
  console.log('No non-ASCII characters detected.');
}
