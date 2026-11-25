import fs from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const rl = readline.createInterface({ input, output });
const root = process.cwd();

function writeFile(relPath, content) {
  const fullPath = path.join(root, relPath);
  fs.mkdirSync(path.dirname(fullPath), { recursive: true });
  fs.writeFileSync(fullPath, content.trimStart(), "utf8");
  console.log(`  [+] Created: ${relPath}`);
}

async function ask(question, defaultVal) {
  const suffix = defaultVal ? ` (${defaultVal})` : "";
  const answer = await rl.question(`${question}${suffix}: `);
  return answer.trim() || defaultVal;
}

async function main() {
  console.log("\n======================================================");
  console.log("   MULTI-AGENT & SPEC-DRIVEN HARNESS GENERATOR");
  console.log("======================================================\n");

  const projectName = await ask(
    "1. Nama Codebase / Workspace",
    "my-agentic-workspace",
  );
  const projectCountStr = await ask(
    "2. Ada berapa sub-project/peruntukan dalam 1 codebase?",
    "3",
  );
  const projectCount = Math.max(1, parseInt(projectCountStr, 10) || 1);

  const projects = [];
  for (let i = 1; i <= projectCount; i++) {
    console.log(`\n--- Konfigurasi Sub-Project #${i} ---`);
    const folderName = await ask(
      `   Nama folder untuk project #${i}`,
      `project-${i}`,
    );
    const roleDesc = await ask(
      `   Peruntukan/fungsi utama "${folderName}"`,
      "Core application / module",
    );
    const duration = await ask(
      `   Target durasi pengerjaan "${folderName}"`,
      "2 minggu",
    );
    const manpower = await ask(
      `   Jumlah manpower (developer) untuk "${folderName}"`,
      "1 orang",
    );
    const hasCatalogue =
      (
        await ask(
          `   Apakah "${folderName}" menghasilkan library/komponen untuk catalogue.json? (y/n)`,
          i === 1 ? "y" : "n",
        )
      ).toLowerCase() === "y";

    projects.push({ folderName, roleDesc, duration, manpower, hasCatalogue });
  }

  console.log("\n--- Konfigurasi Tata Kelola & Boards ---");
  const boardTtl = await ask(
    "3. Batas waktu expiry / TTL pada boards sebelum sah di-override (misal: 8h, 24h, 2d)",
    "24h",
  );
  const isTeamMode =
    (await ask(
      "4. Mode boards: [1] Single file (Solo) atau [2] Multi-file per task (Tim Kantor)?",
      "2",
    )) === "2";
  const verifyCmd = await ask(
    "5. Perintah verifikasi kode utama (linter/test/build)",
    "npm run stitch && npm run session:end",
  );

  rl.close();

  console.log("\nMembangun arsitektur workspace...\n");

  // 1. Root AGENTS.MD (Router & Project Matrix)
  const projectTable = projects
    .map(
      (p) =>
        `| \`/${p.folderName}\` | ${p.roleDesc} | ${p.duration} | ${p.manpower} | ${p.hasCatalogue ? "Producer (`catalogue.json`)" : "Consumer"} |`,
    )
    .join("\n");

  writeFile(
    "AGENTS.MD",
    `
      # ROOT AGENT ROUTER: ${projectName.toUpperCase()}

      Dokumen ini adalah peta navigasi utama berbasis Spec-Driven Development.
      **WAJIB**: Baca \`/.guidance/Agent_rules.md\` dan periksa status di \`/.guidance/boards/\` sebelum bertindak.

      ## Peta Sub-Project & Alokasi Resource

      | Folder | Peruntukan | Target Durasi | Manpower | Peran Katalog |
      | :--- | :--- | :--- | :--- | :--- |
      ${projectTable}

      ## Indeks Autopilot & Tata Kelola
      - **Katalog Spesifikasi**: \`/.docs/catalogue.json\` (Baca file ini untuk melihat kontrak komponen/modul yang tersedia).
      - **Daftar Perintah CLI**: \`/scripts/readme.md\` (Wajib dibaca sebelum menjalankan perintah *build*, *packaging*, atau ritual).
      - **Papan Tugas Aktif**: \`/.guidance/${isTeamMode ? "boards/" : "boards.md"}\` (TTL Lock: **${boardTtl}**).

      ## Kontrak Lintas Folder
      1. Dilarang memindai seluruh direktori secara acak (*no blind directory traversal*). Gunakan \`AGENTS.MD\` lokal dan \`catalogue.json\`.
      2. Sub-project berstatus **Consumer** hanya boleh mengonsumsi modul dari **Producer** sesuai kontrak pada \`catalogue.json\`.
      3. Seluruh ritual sesi, *stitching*, dan verifikasi wajib menggunakan skrip resmi di \`/scripts/\`.
      `,
  );

  // 2. Guidance Files
  writeFile(
    ".guidance/Agent_rules.md",
    `
    # AGENT EXECUTION & CONTEXT RULES

    1. **Selective Reading (Progressive Disclosure)**: Dilarang membaca dokumen di \`/.guidance\` atau \`/.docs\` yang tidak relevan dengan tugas aktif.
    2. **Session Bootstrapping**:
      - Jalankan \`npm run session:start\` di awal sesi.
      - Periksa \`/scripts/readme.md\` jika membutuhkan eksekusi *build*, *packaging*, atau otomasi khusus.
    3. **Fail-Fast Protocol**: Jika terjadi kegagalan akses file atau error eksekusi 2 kali berturut-turut, segera hentikan proses, catat kendala pada papan tugas, dan laporkan.
    4. **Pre-Compact Protocol (Wajib Sebelum Sesi Berakhir / Handoff)**:
      - Ekstrak temuan & keputusan teknis penting ke \`/.docs/session-notes.txt\`.
      - Jika ada perubahan spesifikasi atomik, jalankan \`npm run stitch\`.
      - Perbarui papan tugas dengan batas ketat: **maksimal 3 poin utama** dan **maksimal 8 baris total**.
      - Jalankan \`npm run verify\` sebelum mengakhiri sesi.
    `,
  );

  writeFile(
    ".guidance/work_agreement.md",
    `
    # WORK AGREEMENT, TTL & MULTI-MODEL ROUTING

    ## 1. Aturan Kepemilikan & TTL (${boardTtl})
    - Setiap tugas aktif wajib mencatat \`Owner\` (Developer + Model Agen) dan \`Timestamp\`.
    - **Aturan Override**: Jika tugas di papan berstatus aktif namun tidak ada pembaruan melewati batas **${boardTtl}**, agen/developer berikutnya sah mengambil alih dan melakukan *override*.

    ## 2. Pembagian Peran Model (Cost-to-Intelligence)
    - **Brainstorming & Spec Outlining**: Web Chat / Reasoning Model (di luar IDE agar *context window* tetap bersih).
    - **Arsitektur & Final Review**: Model Penalaran Tinggi (misal: Codex / Sonnet).
    - **Eksekusi Kode & Refactoring**: Model Cepat / Hemat (misal: DeepSeek API / Copilot).
    - **Dokumentasi Atomik & Bug Fix Terisolasi**: Model Ringan / Free Tier.
    `,
  );

  writeFile(
    ".guidance/Rules.md",
    `# TECHNICAL RULES\n- Setiap modul/komponen publik wajib memiliki \`readme.md\` atomik di direktorinya sendiri.\n- Dilarang membuat perintah *build* atau *packaging* manual di luar daftar \`/scripts/readme.md\`.`,
  );
  writeFile(
    ".guidance/convention.md",
    `
    # CONVENTIONS\n- Gunakan \`kebab-case\` untuk penamaan folder modul/komponen.\n- Struktur \`readme.md\` atomik wajib memuat: \`# NamaModul\`, \`## Contract / Props\`, dan \`## Usage\`.`,
  );

  // 3. Boards Setup (Solo vs Team Mode)
  const sampleBoardContent = `
    # TASK BOARD (MAX 3 POINTS / MAX 8 LINES)
    - Owner: @Unassigned | TTL: ${boardTtl} | Status: READY
    - [TASK 1] Setup fondasi struktur pada ${projects.folderName} (Target: ${projects.duration}, MP: ${projects.manpower}).
    - [NEXT] Buat readme.md atomik pertama dan jalankan \`npm run stitch\`.
    `;

  if (isTeamMode) {
    writeFile(".guidance/boards/TASK-001-init.md", sampleBoardContent);
    writeFile(
      ".guidance/boards/README.md",
      `# TEAM BOARDS DIRECTORY\n- Buat 1 file terpisah per tiket/developer (contoh: \`FEAT-101-login.md\`) untuk mencegah Git Merge Conflict.\n- Wajib mematuhi batas maksimal **3 poin / 8 baris** per file dan TTL **${boardTtl}**.`,
    );
  } else {
    writeFile(".guidance/boards.md", sampleBoardContent);
  }

  // 4. Sub-projects & Atomic Readme Example
  const producerFolders = [];
  for (const p of projects) {
    writeFile(
      `${p.folderName}/AGENTS.MD`,
      `
      # SUB-PROJECT: ${p.folderName.toUpperCase()}
      - **Peruntukan**: ${p.roleDesc}
      - **Target Durasi**: ${p.duration} | **Manpower**: ${p.manpower}
      - **Peran**: ${p.hasCatalogue ? "Producer (Menyediakan modul & readme.md atomik ke catalogue.json)" : "Consumer (Mengonsumsi modul via /.docs/catalogue.json)"}
      `,
    );

    if (p.hasCatalogue) {
      producerFolders.push(p.folderName);
      writeFile(
        `${p.folderName}/modules/sample-module/readme.md`,
        `
        # SampleModule
        Modul contoh untuk ${p.folderName}.

        ## Contract / Props
        - \`id\`: \`string\` (wajib)

        ## Usage
        \`\`\`js
        initSampleModule({ id: '001' });
        \`\`\`
        `,
      );
    }
  }

  // 5. Scripts Directory & Self-Documenting Registry
  writeFile(
    "scripts/readme.md",
    `
    # CLI RITUALS & AUTOMATION REGISTRY

    Daftar skrip resmi dalam workspace ini. Agen **wajib** merujuk ke dokumen ini sebelum menjalankan otomasi.

    | Command | Kegunaan | Kapan Waktu Menggunakan |
    | :--- | :--- | :--- |
    | \`npm run session:start\` | Memuat status papan tugas aktif & 5 git log terakhir. | **Wajib** di awal setiap sesi kerja baru. |
    | \`npm run stitch\` | Mengompilasi semua \`readme.md\` atomik menjadi \`/.docs/catalogue.json\`. | Setiap kali ada penambahan/perubahan spesifikasi modul. |
    | \`npm run session:end\` | Memvalidasi batas 8 baris pada papan tugas sebelum *compact*. | Sebelum mengakhiri sesi atau estafet ke agen lain. |
    | \`npm run verify\` | Menjalankan seluruh rangkaian validasi & kompilasi akhir. | **Wajib** sebelum *commit* atau menutup *batch* pekerjaan. |
    `,
  );

  writeFile(
    "scripts/stitch-catalogue.mjs",
    `
    import fs from 'node:fs';
    import path from 'node:path';

    const producers = ${JSON.stringify(producerFolders)};
    const outputFile = path.join(process.cwd(), '.docs', 'catalogue.json');

    function scanReadmes(dir, baseFolder, results = {}) {
      if (!fs.existsSync(dir)) return results;
      for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          scanReadmes(fullPath, baseFolder, results);
        } else if (entry.name.toLowerCase() === 'readme.md') {
          const relDir = path.relative(process.cwd(), dir).replace(/\\\\/g, '/');
          const moduleName = path.basename(dir);
          results[moduleName] = {
            sourceProject: baseFolder,
            path: relDir,
            spec: fs.readFileSync(fullPath, 'utf8').trim()
          };
        }
      }
      return results;
    }

    const catalogue = {
      workspace: ${JSON.stringify(projectName)},
      generatedAt: new Date().toISOString(),
      totalModules: 0,
      modules: {}
    };

    for (const folder of producers) {
      const found = scanReadmes(path.join(process.cwd(), folder), folder);
      Object.assign(catalogue.modules, found);
    }

    catalogue.totalModules = Object.keys(catalogue.modules).length;

    fs.mkdirSync(path.dirname(outputFile), { recursive: true });
    fs.writeFileSync(outputFile, JSON.stringify(catalogue, null, 2), 'utf8');
    console.log(\`[STITCH] Berhasil mengompilasi ${catalogue.totalModules} spesifikasi atomik ke .docs/catalogue.json\`);
    process.exit(0);
    `,
  );

  writeFile(
    "scripts/session.mjs",
    `
    import fs from 'node:fs';
    import path from 'node:path';
    import { execSync } from 'node:child_process';
    const mode = process.argv;
    const isTeamMode = ${isTeamMode};
    const boardTarget = path.join(process.cwd(), '.guidance', isTeamMode ? 'boards' : 'boards.md');
      function getGitLog() {
        try {
          return execSync('git log -n 5 --oneline', { encoding: 'utf8' }).trim();
        } catch {
          return '(Git belum diinisialisasi)';
        }
      }
      function readBoards() {
        if (!fs.existsSync(boardTarget)) return 'Board tidak ditemukan.';
        if (!isTeamMode) return fs.readFileSync(boardTarget, 'utf8');
        const files = fs.readdirSync(boardTarget).filter(f => f.endsWith('.md') && f !== 'README.md');
        return files.map(f => \`--- ${f} ---\n${fs.readFileSync(path.join(boardTarget, f), "utf8").trim()}\`).join('\n\n');
      }

    if (mode === '--start') {
      console.log('=== SESSION START RITUAL ===');
      console.log('\n[ACTIVE BOARDS]:\n' + readBoards());
      console.log('\n[RECENT GIT LOG]:\n' + getGitLog());
    } else if (mode === '--end') {
      console.log('=== SESSION END VALIDATION ===');
      const files = isTeamMode
        ? fs.readdirSync(boardTarget).filter(f => f.endsWith('.md') && f !== 'README.md').map(f => path.join(boardTarget, f))
        : [boardTarget];
      for (const file of files) {
        const lines = fs.readFileSync(file, 'utf8').trim().split('\n');
        const name = path.basename(file);
        console.log(\`[CHECK] ${name}: ${lines.length} baris (Max: 8)\`);
        if (lines.length > 8) {
          console.warn(\`[WARNING] ${name} melebihi batas 8 baris! Harap ringkas sebelum compact.\`);
        }
      }
    } else {
      console.log('Usage: node scripts/session.mjs [--start | --end]');
    }
    process.exit(0);
    `,
  );

  // 6. Docs, Cline Bridge & Package.json
  writeFile(
    ".docs/session-notes.txt",
    `Arsip rangkuman pre-compact untuk ${projectName}.\n`,
  );

  writeFile(
    ".clinerules",
    `
    CLINE OVERRIDE RULES
    1. Ikuti \`AGENTS.MD\` dan \`/.guidance/Agent_rules.md\` sebagai otoritas utama.
    2. Dilarang melakukan directory traversal manual; gunakan \`/.docs/catalogue.json\` untuk melihat spesifikasi modul.
    3. Sebelum menjalankan perintah terminal, baca \`/scripts/readme.md\` dan gabungkan perintah berurutan menggunakan \`&&\`.
    4. Wajib patuhi batas maksimal 3 poin / 8 baris pada papan tugas sebelum mengakhiri sesi.
  `,
  );

  writeFile(".clineignore", `node_modules/ dist/ build/ .git/ .docs/*.txt`);
  writeFile(
    "package.json",
    JSON.stringify(
      {
        name: projectName.toLowerCase().replace(/\s+/g, "-"),
        private: true,
        type: "module",
        scripts: {
          "session:start": "node scripts/session.mjs --start",
          "session:end": "node scripts/session.mjs --end",
          stitch: "node scripts/stitch-catalogue.mjs",
          verify: verifyCmd,
        },
      },
      null,
      2,
    ),
  );
  console.log("\n======================================================");
  console.log("   BOILERPLATE BERHASIL DIBANGUN!");
  console.log('   Jalankan "npm run session:start" & "npm run stitch"');
  console.log("======================================================\n");
}
main();
