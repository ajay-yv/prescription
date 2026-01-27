// sanitize-prescriptionresults-safe.js
const fs = require('fs');
const path = 'C:\\Users\\ajayy\\OneDrive\\Desktop\\Prescription\\Prescription\\prescription-analyzer\\src\\components\\PrescriptionResults.tsx';
if (!fs.existsSync(path)) {
  console.error('File not found:', path);
  process.exit(1);
}
const orig = fs.readFileSync(path, 'utf8');
const backupPath = path + '.bak.' + Date.now();
fs.writeFileSync(backupPath, orig, 'utf8');
console.log('Backup written to', backupPath);

// Replace common problematic characters
let fixed = orig
  .replace(/[“”]/g, '"')
  .replace(/[‘’]/g, "'")
  .replace(/[–—]/g, '-')
  .replace(/×/g, 'x')
  .replace(/\u00A0/g, ' ')
  .replace(/\u200B/g, '')   // zero width space
  .replace(/\uFEFF/g, '');  // BOM

// Remove control characters by scanning each character's code (avoids control-regex)
function removeControlChars(str) {
  const out = [];
  for (let i = 0; i < str.length; i++) {
    const code = str.charCodeAt(i);
    // keep tab (9), LF (10), CR (13) and printable chars 32..126 and extended printable 160..65535
    if (code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127) || code >= 160) {
      out.push(str.charAt(i));
    } else {
      // skip control char
      // optionally you can log its position here for debugging
    }
  }
  return out.join('');
}

fixed = removeControlChars(fixed);

if (fixed === orig) {
  console.log('No changes required (no problematic characters found).');
} else {
  fs.writeFileSync(path, fixed, 'utf8');
  console.log('Sanitization complete. Original backed up at:', backupPath);
}
