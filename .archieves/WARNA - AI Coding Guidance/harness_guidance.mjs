import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

function writeFile(relPath, content) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart(), 'utf8');
  console.log(`Created: ${relPath}`);
}

// 1. Root Router: AGENTS.MD
writeFile('AGENTS.MD', `
# ROOT AGENT ROUTER

Dokumen ini adalah peta navigasi utama. Baca \`/.guidance/Agent_rules.md\` dan \`/.guidance/boards.md\` terlebih dahulu sebelum mengambil tindakan apa pun.

## Struktur Workspace
- \`/folder-a\`: Core UI Library (Monorepo packages). Gunakan dokumentasi atomik per komponen.
- \`/folder-b\`: Showcase, halaman demo, dan dokumentasi interaktif.
- \`/folder-c\`: Consumer Web App (implementasi library).
- \`/folder-d\`: CLI Automation & Ritual Scripts (\`.mjs\`).
- \`/folder-e\`: Experiments, generator logic, dan server-side orchestrator.

## Indeks Autopilot & Tata Kelola
- **Katalog Komponen**: \`/.docs/catalogue.json\` (Wajib dibaca jika tugas menggunakan komponen dari \`folder-a\`).
- **Papan Tugas Aktif**: \`/.guidance/boards.md\`
- **Aturan & Konvensi**: \`/.guidance/Rules.md\`, \`/.guidance/convention.md\`, \`/.guidance/work_agreement.md\`

## Kontrak Lintas Folder
1. Agen di \`folder-a\` boleh memicu pembaruan dokumentasi di \`folder-b\`, tetapi dilarang mengubah \`folder-c\` tanpa instruksi eksplisit.
2. Agen di \`folder-c\` atau \`folder-e\` hanya memiliki akses baca terhadap \`folder-a\` melalui \`catalogue.json\`.
3. Segala ritual sesi dan kompilasi katalog wajib menggunakan skrip di \`folder-d\`.
`);

// 2. Guidance Files
writeFile('.guidance/Agent_rules.md', `
# AGENT EXECUTION & CONTEXT RULES

1. **Selective Reading**: Dilarang membaca file di \`/.guidance\` atau \`/.docs\` yang tidak relevan dengan tugas aktif.
2. **Bootstrapping**: Di awal sesi, jalankan \`node folder-d/session.mjs --start\` dan baca \`boards.md\`.
3. **Fail-Fast**: Jika terjadi kegagalan akses file atau error eksekusi 2 kali berturut-turut, hentikan pekerjaan dan catat di \`boards.md\`.
4. **Pre-Compact Protocol (Wajib Sebelum Sesi Berakhir)**:
   - Rangkum temuan dan keputusan teknis ke file arsip di \`/.docs/session-notes.txt\`.
   - Jika ada perubahan komponen di \`folder-a\`, jalankan \`node folder-d/stitch-catalogue.mjs\`.
   - Perbarui \`boards.md\` dengan batas ketat: **maksimal 3 poin utama** dan **maksimal 8 baris total**.
   - Jalankan \`npm run verify\` dan \`node folder-d/session.mjs --end\`.
`);

writeFile('.guidance/boards.md', `
# ACTIVE TASK BOARD (MAX 3 POINTS / MAX 8 LINES)
- [READY] Status: Idle | Owner: None | TTL: 24h
- [TASK 1] Inisialisasi komponen dasar di folder-a dan sinkronisasi catalogue.json.
- [NEXT] Jalankan \`node folder-d/stitch-catalogue.mjs\` setelah komponen pertama selesai.
`);

writeFile('.guidance/work_agreement.md', `
# WORK AGREEMENT & HANDOFF PROTOCOL

1. **Estafet Lintas Model**:
   - **Model Ringan/Gratis**: Fokus pada pemetaan konteks, pembacaan \`catalogue.json\`, penulisan \`readme.md\` atomik, dan dokumentasi.
   - **Model Reasoning/Berbayar**: Fokus pada implementasi kode kompleks lintas modul dan refactoring.
2. **Aturan Override**: Setiap entri tugas di \`boards.md\` yang melewati batas waktu TTL (24 jam) tanpa pembaruan sah diambil alih dan di-override oleh agen berikutnya.
`);

writeFile('.guidance/Rules.md', `
# TECHNICAL RULES
- Setiap komponen baru di \`folder-a\` wajib memiliki \`readme.md\` atomik di direktorinya sendiri.
- Dilarang menduplikasi logika UI di \`folder-c\` atau \`folder-e\` jika komponen sudah tersedia di \`catalogue.json\`.
`);

writeFile('.guidance/convention.md', `
# CODE & NAMING CONVENTIONS
- Gunakan penamaan folder komponen dengan format \`kebab-case\`.
- Format \`readme.md\` atomik wajib diawali judul \`# ComponentName\` diikuti bagian \`## Props\` dan \`## Usage\`.
`);

// 3. Sub-folder AGENTS.MD & Contoh Atomic Component
writeFile('folder-a/AGENTS.MD', `
# FOLDER A: CORE UI LIBRARY
- Setiap komponen berada di \`/folder-a/library/components/<component-name>/\`.
- Wajib menyertakan \`readme.md\` atomik pada setiap komponen.
- Setelah menambah atau mengubah kontrak komponen, jalankan \`node folder-d/stitch-catalogue.mjs\`.
`);

writeFile('folder-a/library/components/button/readme.md', `
# Button
Komponen tombol standar dengan dukungan varian dan status loading.

## Props
- \`variant\`: \`"primary" | "secondary" | "ghost"\` (default: \`"primary"\`)
- \`disabled\`: \`boolean\`

## Usage
\`\`\`tsx
<Button variant="primary">Simpan</Button>
\`\`\`
`);

writeFile('folder-b/AGENTS.MD', `# FOLDER B: SHOWCASE & DOCS\n- Konsumsi komponen dari \`folder-a\` untuk kebutuhan demo interaktif.`);
writeFile('folder-c/AGENTS.MD', `# FOLDER C: CONSUMER WEB APP\n- Wajib memeriksa \`/.docs/catalogue.json\` sebelum membuat elemen UI baru.`);
writeFile('folder-d/AGENTS.MD', `# FOLDER D: CLI AUTOMATION\n- Berisi skrip deterministik \`.mjs\` untuk manajemen sesi dan kompilasi katalog.`);
writeFile('folder-e/AGENTS.MD', `# FOLDER E: ORCHESTRATOR & EXPERIMENTS\n- Eksperimen logika generator dan integrasi server-side.`);

// 4. Folder D Scripts: Stitching Catalogue & Session Ritual
writeFile('folder-d/stitch-catalogue.mjs', `
import fs from 'node:fs';
import path from 'node:path';

const componentsDir = path.join(process.cwd(), 'folder-a', 'library', 'components');
const outputFile = path.join(process.cwd(), '.docs', 'catalogue.json');

function stitch() {
  if (!fs.existsSync(componentsDir)) {
    console.error('Components directory not found:', componentsDir);
    process.exit(1);
  }

  const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
  const catalogue = {
    generatedAt: new Date().toISOString(),
    totalComponents: 0,
    components: {}
  };

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    const readmePath = path.join(componentsDir, entry.name, 'readme.md');
    if (fs.existsSync(readmePath)) {
      const content = fs.readFileSync(readmePath, 'utf8').trim();
      catalogue.components[entry.name] = {
        path: \`folder-a/library/components/\${entry.name}\`,
        spec: content
      };
      catalogue.totalComponents++;
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(catalogue, null, 2), 'utf8');
  console.log(\`Stitched \${catalogue.totalComponents} components into .docs/catalogue.json\`);
}

stitch();
`);

writeFile('folder-d/session.mjs', `
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const mode = process.argv[2];
const boardPath = path.join(process.cwd(), '.guidance', 'boards.md');

function getGitLog() {
  try {
    return execSync('git log -n 5 --oneline', { encoding: 'utf8' }).trim();
  } catch {
    return 'Git repository belum diinisialisasi.';
  }
}

if (mode === '--start') {
  console.log('=== SESSION START RITUAL ===');
  console.log('\\n[ACTIVE BOARD]:');
  console.log(fs.existsSync(boardPath) ? fs.readFileSync(boardPath, 'utf8') : 'boards.md not found');
  console.log('\\n[RECENT GIT LOG]:');
  console.log(getGitLog());
} else if (mode === '--end') {
  console.log('=== SESSION END CHECKLIST ===');
  const lines = fs.readFileSync(boardPath, 'utf8').trim().split('\\n');
  console.log(\`Board line count: \${lines.length} (Max allowed: 8)\`);
  if (lines.length > 8) {
    console.warn('WARNING: boards.md melebihi batas 8 baris! Harap ringkas sebelum compact.');
  }
} else {
  console.log('Usage: node folder-d/session.mjs [--start | --end]');
}
`);

// 5. Docs & Root Package.json
writeFile('.docs/session-notes.txt', `Arsip rangkuman sesi pre-compact akan dicatat di sini.\n`);

writeFile('package.json', JSON.stringify({
  name: "multi-agent-monorepo",
  private: true,
  type: "module",
  scripts: {
    "session:start": "node folder-d/session.mjs --start",
    "session:end": "node folder-d/session.mjs --end",
    "stitch": "node folder-d/stitch-catalogue.mjs",
    "verify": "node folder-d/stitch-catalogue.mjs && node folder-d/session.mjs --end"
  }
}, null, 2));

console.log('\\nSetup selesai! Jalankan "npm run stitch" untuk menguji kompilasi catalogue.json pertama Anda.');
