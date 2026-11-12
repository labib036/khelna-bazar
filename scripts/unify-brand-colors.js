const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const full = path.join(dir, file);
    const stat = fs.statSync(full);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(full));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(full);
    }
  });
  return results;
}

const files = walk('src');
console.log(`Checking ${files.length} source files for brand color harmonization...`);

let replacedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let original = content;

  // Harmonize electric blue -> Khelna Bazar crimson red
  content = content
    .replaceAll('#1E5BFF', '#DC012B')
    .replaceAll('#1e5bff', '#dc012b')
    .replaceAll('#1546CC', '#B80023')
    .replaceAll('#1546cc', '#b80023')
    .replaceAll('#0B2A7A', '#8A0018')
    .replaceAll('#0b2a7a', '#8a0018')
    .replaceAll('#EBF1FF', '#FFF0F2')
    .replaceAll('#ebf1ff', '#fff0f2')
    .replaceAll('#1E2D5A', '#3D000B')
    .replaceAll('#1e2d5a', '#3d000b')
    .replaceAll('#14213D', '#18191F')
    .replaceAll('#14213d', '#18191f')
    .replaceAll('#E3E8F2', '#E8E2DE')
    .replaceAll('#e3e8f2', '#e8e2de');

  if (content !== original) {
    fs.writeFileSync(file, content, 'utf8');
    replacedCount++;
    console.log(`✓ Harmonized colors in: ${path.relative('.', file)}`);
  }
});

console.log(`\n🎉 Harmonized brand colors across ${replacedCount} files!`);
