#!/usr/bin/env node
/**
 * WARNA — COMPONENT / MODULE CATALOGUE COMPILER
 *
 * Compiles README.md files under the configured scan roots (`catalogue.readmeSrc`
 * in `.guidance/manifest.json`) into a machine-readable catalogue JSON file without
 * duplicating prose by hand.
 *
 * Usage:
 *   node scripts/catalogue.mjs          # dry run: report size & staleness
 *   node scripts/catalogue.mjs --apply  # write output catalogue JSON
 *   node scripts/catalogue.mjs --check  # exit 1 when output is stale
 */
import {
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, relative } from "node:path";

const ROOT = process.cwd();
const MANIFEST_FILES = [".guidance/manifest.json", "warna.manifest.json"];
const FORMAT = 1;

const DEFAULTS = {
  scanDir: ".",
  scanDirs: [],
  targetFile: "README.md",
  outputFile: join(".docs", "catalogue.json"),
  scopePrefix: "", // optional, e.g. "@scope/" or leave empty for any package name
  ignoreDirs: [
    "node_modules",
    "dist",
    "build",
    ".git",
    ".temp",
    ".archieves",
    "docs",
    ".guidance",
    "__tests__",
  ],
  requiredSections: [],
  readOnlyZones: ["docs", ".archieves"],
};

function loadConfig() {
  const cfg = { ...DEFAULTS };
  const manifestPath = MANIFEST_FILES.map((file) => join(ROOT, file)).find(
    (full) => existsSync(full),
  );
  if (!manifestPath) return cfg;

  try {
    const raw = JSON.parse(readFileSync(manifestPath, "utf8"));
    const cat = raw.catalogue || {};
    if (cat.scanDir) cfg.scanDir = cat.scanDir;
    if (Array.isArray(cat.readmeSrc) && cat.readmeSrc.length > 0) {
      cfg.scanDirs = cat.readmeSrc;
    }
    if (cat.targetFileName) cfg.targetFile = cat.targetFileName;
    if (cat.outputFile) cfg.outputFile = cat.outputFile;
    if (typeof cat.scopePrefix === "string") cfg.scopePrefix = cat.scopePrefix;
    if (Array.isArray(cat.ignoreDirs)) cfg.ignoreDirs = cat.ignoreDirs;
    if (Array.isArray(cat.requiredSections))
      cfg.requiredSections = cat.requiredSections;
    if (Array.isArray(raw.governance?.readOnlyZones)) {
      cfg.readOnlyZones = raw.governance.readOnlyZones;
    }
  } catch {
    // Keep defaults if manifest is unreadable or partial
  }
  return cfg;
}

const config = loadConfig();
const SCAN_ROOTS = (
  config.scanDirs.length ? config.scanDirs : [config.scanDir]
).map((dir) => join(ROOT, dir));
const OUTPUT = join(ROOT, config.outputFile);

const args = process.argv.slice(2);
const apply = args.includes("--apply");
const check = args.includes("--check");

/** `true` while inside a ``` or ~~~ fence, flipped by the fence lines themselves. */
const isFence = (line) => /^\s*(```|~~~)/.test(line);

/** `Default tag` -> `defaultTag`; `Class / note` -> `classNote`; `` `--x` `` -> `x`. */
function cellKey(header) {
  const cleaned = header
    .replace(/[`*_]/g, "")
    .replace(/[^a-zA-Z0-9]+/g, " ")
    .trim();
  const parts = cleaned.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "col";
  return parts
    .map((part, index) =>
      index === 0
        ? part.toLowerCase()
        : part[0].toUpperCase() + part.slice(1).toLowerCase(),
    )
    .join("");
}

/** Splits one GFM table row into cells; `\|` is a literal pipe, not a separator. */
function splitRow(line) {
  const trimmed = line.trim().replace(/^\|/, "").replace(/\|$/, "");
  const cells = [];
  let cell = "";
  for (let index = 0; index < trimmed.length; index++) {
    const char = trimmed[index];
    if (char === "\\" && trimmed[index + 1] === "|") {
      cell += "|";
      index++;
      continue;
    }
    if (char === "|") {
      cells.push(cell.trim());
      cell = "";
      continue;
    }
    cell += char;
  }
  cells.push(cell.trim());
  return cells;
}

/** A separator row: only dashes, colons and spaces. */
const isSeparator = (line) =>
  /^\s*\|?[\s:-]*-[\s|:-]*$/.test(line) && line.includes("-");

/** Reads the tables out of a block of markdown lines. */
function readTables(lines) {
  const tables = [];
  let inFence = false;
  let current = null;

  const flush = () => {
    if (current) tables.push(current);
    current = null;
  };

  for (let index = 0; index < lines.length; index++) {
    const line = lines[index];

    if (isFence(line)) {
      inFence = !inFence;
      flush();
      continue;
    }
    if (inFence) continue;

    if (!line.trim().startsWith("|")) {
      flush();
      continue;
    }

    if (!current) {
      const next = lines[index + 1] ?? "";
      if (!isSeparator(next)) continue;
      current = { columns: splitRow(line), rows: [] };
      index++;
      continue;
    }

    const cells = splitRow(line);
    const row = {};
    current.columns.forEach((column, cellIndex) => {
      row[cellKey(column)] = cells[cellIndex] ?? "";
    });
    current.rows.push(row);
  }

  flush();
  return tables;
}

/** Splits a README into a lead paragraph and H2 sections, respecting code fences. */
function parseReadme(text) {
  const lines = text.replace(/\r\n/g, "\n").split("\n");
  const sections = [];
  const lead = [];
  let title = "";
  let current = null;
  let inFence = false;

  for (const line of lines) {
    if (isFence(line)) {
      inFence = !inFence;
      (current ? current.lines : lead).push(line);
      continue;
    }

    if (!inFence) {
      if (!title && /^#\s+/.test(line)) {
        title = line.replace(/^#\s+/, "").trim();
        continue;
      }
      if (/^##\s+/.test(line)) {
        if (current) sections.push(current);
        current = { heading: line.replace(/^##\s+/, "").trim(), lines: [] };
        continue;
      }
    }

    (current ? current.lines : lead).push(line);
  }
  if (current) sections.push(current);

  return { title, lead: lead.join("\n").trim(), sections };
}

/** Turns one section's raw lines into prose + examples + tables. */
function readSection(section) {
  const prose = [];
  const examples = [];
  let inFence = false;
  let fenceLang = "";
  let buffer = [];

  for (const line of section.lines) {
    if (isFence(line)) {
      if (!inFence) {
        inFence = true;
        fenceLang = line.trim().replace(/^(```|~~~)\s*/, "");
        buffer = [];
      } else {
        inFence = false;
        examples.push({ lang: fenceLang, code: buffer.join("\n") });
      }
      continue;
    }
    if (inFence) buffer.push(line);
    else if (line.trim().startsWith("|")) continue;
    else prose.push(line);
  }

  return {
    text: prose
      .join("\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim(),
    examples,
    tables: readTables(section.lines),
  };
}

/** Extracts a package/module identifier in backticks from H1 when present. */
function claimedId(title) {
  const match = title.match(/`([^`]+)`/);
  return match ? match[1].trim() : null;
}

/** Every target README under `dir`, at any depth, as absolute paths. */
function readmes(dir) {
  if (!existsSync(dir)) return [];
  const found = [];
  const target = config.targetFile.toLowerCase();
  for (const entry of readdirSync(dir)) {
    if (config.ignoreDirs.includes(entry)) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) found.push(...readmes(full));
    else if (entry.toLowerCase() === target) found.push(full);
  }
  return found;
}

function normalizeKey(pkgName, folder) {
  if (!pkgName) return folder;
  if (config.scopePrefix && pkgName.startsWith(config.scopePrefix)) {
    return pkgName.slice(config.scopePrefix.length);
  }
  return pkgName.replace(/^@[^/]+\//, "");
}

function compile() {
  const problems = [];
  const entries = [];
  const relOutput = relative(ROOT, OUTPUT).replace(/\\/g, "/");

  for (const zone of config.readOnlyZones) {
    const cleanZone = zone.replace(/^\/+|\/+$/g, "");
    if (relOutput === cleanZone || relOutput.startsWith(`${cleanZone}/`)) {
      problems.push(
        `output path "${relOutput}" sits inside read-only zone "${cleanZone}/"`,
      );
    }
  }

  for (const file of [
    ...new Set(SCAN_ROOTS.flatMap((root) => readmes(root))),
  ].sort()) {
    const dir = file.replace(/[\\/]README\.md$/i, "");
    const folder = dir.split(/[\\/]/).pop();
    const fallbackName = config.scopePrefix
      ? `${config.scopePrefix}${folder}`
      : folder;

    let packageName = fallbackName;
    try {
      const pkg = JSON.parse(readFileSync(join(dir, "package.json"), "utf8"));
      if (pkg.name) packageName = pkg.name;
    } catch {
      problems.push(
        `${folder}: no readable package.json — using "${fallbackName}"`,
      );
    }

    const doc = parseReadme(readFileSync(file, "utf8"));
    if (!doc.title) problems.push(`${folder}: no H1 title`);

    for (const required of config.requiredSections) {
      const heading = required.replace(/^#+\s*/, "").toLowerCase();
      const found = doc.sections.some(
        (section) => section.heading.toLowerCase() === heading,
      );
      if (!found)
        problems.push(`${folder}: missing required section "${required}"`);
    }

    const claimed = claimedId(doc.title);
    if (claimed && claimed !== packageName) {
      problems.push(
        `${folder}: H1 says "${claimed}", package.json says "${packageName}"`,
      );
    }

    const cleanTitle = (doc.title || folder)
      .replace(/\s*\(`[^`]+`\)\s*$/, "")
      .trim();
    const entry = {
      package: packageName,
      title: cleanTitle,
      lead: doc.lead,
      sections: {},
    };

    for (const section of doc.sections) {
      entry.sections[section.heading] = readSection(section);
    }

    entries.push({ key: normalizeKey(packageName, folder), entry });
  }

  const relScan =
    SCAN_ROOTS.map(
      (root) => relative(ROOT, root).replace(/\\/g, "/") || ".",
    ).join(", ") || ".";
  const document = {
    $comment:
      `Generated by WARNA catalogue compiler from ${relScan}/**/README.md. ` +
      "Do not hand-edit — update the source README and re-run with --apply.",
    format: FORMAT,
    source: `${relScan}/**/README.md`,
    packages: Object.fromEntries(entries.map(({ key, entry }) => [key, entry])),
  };

  return { document, problems };
}

const { document, problems } = compile();
const serialized = `${JSON.stringify(document, null, 2)}\n`;
const names = Object.keys(document.packages);

let existing = null;
try {
  existing = readFileSync(OUTPUT, "utf8");
} catch {
  existing = null;
}

function isStale(prev, nextSerialized) {
  if (prev === null) return true;
  if (prev === nextSerialized) return false;
  try {
    return (
      JSON.stringify(JSON.parse(prev)) !==
      JSON.stringify(JSON.parse(nextSerialized))
    );
  } catch {
    return true;
  }
}

const stale = isStale(existing, serialized);
const relOut = relative(ROOT, OUTPUT).replace(/\\/g, "/");

if (check) {
  for (const problem of problems) console.error(`[catalogue] ${problem}`);
  if (stale) {
    console.error(
      `[catalogue] ${relOut} is stale — run with --apply to refresh.`,
    );
    process.exit(1);
  }
  console.log(
    `[catalogue] ${names.length} package(s) match their READMEs${problems.length ? `, ${problems.length} warning(s)` : ""}`,
  );
  process.exit(0);
}

for (const problem of problems) console.warn(`[catalogue] ${problem}`);

if (apply) {
  mkdirSync(dirname(OUTPUT), { recursive: true });
  writeFileSync(OUTPUT, serialized);
  console.log(
    `[catalogue] wrote ${relOut} — ${names.length} package(s), ${(serialized.length / 1024).toFixed(1)} kB`,
  );
} else {
  console.log(
    `[catalogue] dry run — ${names.length} package(s), ${(serialized.length / 1024).toFixed(1)} kB`,
  );
  console.log(
    `[catalogue] would write ${relOut}${stale ? " (changes)" : " (no changes)"}`,
  );
  if (stale) console.log(`[catalogue] pass --apply to write`);
}
