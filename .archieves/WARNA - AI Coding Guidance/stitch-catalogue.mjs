import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const manifestPath = path.join(root, 'warna.manifest.json');

if (!fs.existsSync(manifestPath)) {
  console.error('[WARNA ERROR] warna.manifest.json tidak ditemukan di root workspace.');
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const { readmeSpecsIn, targetFileName, outputFile, ignoreDirs, requiredSections } = manifest.stitching;

function scanSpecs(targetDir, results = {}, warnings = []) {
  if (!fs.existsSync(targetDir)) return;

  for (const entry of fs.readdirSync(targetDir, { withFileTypes: true })) {
    if (ignoreDirs.includes(entry.name)) continue;

    const fullPath = path.join(targetDir, entry.name);
    if (entry.isDirectory()) {
      scanSpecs(fullPath, results, warnings);
    } else if (entry.name.toLowerCase() === targetFileName.toLowerCase()) {
      const content = fs.readFileSync(fullPath, 'utf8').trim();
      const relDir = path.relative(root, targetDir).replace(/\\/g, '/');
      const moduleName = path.basename(targetDir);

      // Validasi struktur bagian wajib pada atomic readme
      if (Array.isArray(requiredSections)) {
        const missing = requiredSections.filter(sec => !content.includes(sec));
        if (missing.length > 0) {
          warnings.push(`${relDir}/${entry.name} kekurangan bagian: ${missing.join(', ')}`);
        }
      }

      results[moduleName] = {
        path: relDir,
        spec: content
      };
    }
  }
}

const catalogue = {
  workspace: manifest.name,
  generatedAt: new Date().toISOString(),
  totalSpecs: 0,
  specs: {}
};

const warnings = [];
for (const relPath of readmeSpecsIn) {
  scanSpecs(path.join(root, relPath), catalogue.specs, warnings);
}

catalogue.totalSpecs = Object.keys(catalogue.specs).length;
const outFullPath = path.join(root, outputFile);
fs.mkdirSync(path.dirname(outFullPath), { recursive: true });
fs.writeFileSync(outFullPath, JSON.stringify(catalogue, null, 2), 'utf8');

console.log(`[WARNA STITCH] ${catalogue.totalSpecs} spesifikasi berhasil dikompilasi ke ${outputFile}`);
if (warnings.length > 0) {
  console.warn('\n[WARNA LINT WARNING]:');
  warnings.forEach(w => console.warn(`  - ${w}`));
}
process.exit(0);
