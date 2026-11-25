#!/usr/bin/env node
/**
 * WARNA — SESSION RITUAL RUNNER (Manifest-Driven, Read-Only)
 *
 * Reads governance limits, dimensions, and read-only zones from `.guidance/manifest.json`
 * (falling back to a root `warna.manifest.json`) while keeping interactive prompts, CLI flags,
 * `--json` output, and zero-mutation safety.
 *
 * Doors:
 *   node scripts/session.mjs start     STEP 0 — tree, git log, logbook cards, claims, lint warnings
 *   node scripts/session.mjs cp        CP-3 — one checkpoint block, three pointer lines
 *   node scripts/session.mjs end       Pre-compact handoff checklist, audit, and skeletons
 *   node scripts/session.mjs lint      Check line budgets, card cap, and read-only zone violations
 *   node scripts/session.mjs --help
 */
import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";
import { createInterface } from "node:readline/promises";

const ROOT = process.cwd();
const MANIFEST_FILES = [".guidance/manifest.json", "warna.manifest.json"];

const DEFAULT_MANIFEST = {
  governance: {
    guidanceDir: ".guidance",
    projectDir: ".guidance/project",
    boardFile: ".guidance/project/REGISTRY.md",
    readmeDoc: ".guidance/project/README.md",
    readOnlyZones: ["docs", ".archieves"],
    ephemeralZones: [".temp"],
    boardTtl: "24h",
    limits: {
      statusMaxLines: 45,
      statusMaxCards: 3,
      statusMaxCardLines: 4,
      planMaxLines: 60,
      planMaxActiveItems: 3,
      planMaxItemLines: 2,
      taskMaxLines: 50,
      memoryMaxLines: 12,
      checkpointLines: 3,
    },
  },
  dimensions: [
    {
      name: "Guidance",
      paths: [".guidance/**"],
      router: "AGENTS.md",
    },
    {
      name: "Rituals & Scripts",
      paths: ["scripts/**"],
      router: "scripts/session.mjs",
    },
    {
      name: "Source",
      paths: ["src/**", "app/**", "packages/**", "project/**"],
      router: "AGENTS.md",
    },
  ],
  rituals: {
    gitLogCount: 8,
    verifyCommand: "node scripts/session.mjs lint",
  },
};

const argv = process.argv.slice(2);
const command = argv.find((arg) => !arg.startsWith("--")) ?? "help";
const flag = (name) => argv.includes(name);
const valueOf = (name) => {
  const index = argv.indexOf(name);
  return index === -1 ? undefined : argv[index + 1];
};

function loadManifest() {
  const manifestFile = MANIFEST_FILES.map((file) => join(ROOT, file)).find(
    (full) => existsSync(full),
  );
  const rawText = manifestFile ? text(relative(ROOT, manifestFile)) : "";
  if (!rawText) return DEFAULT_MANIFEST;
  try {
    const parsed = JSON.parse(rawText);
    return {
      ...DEFAULT_MANIFEST,
      ...parsed,
      governance: {
        ...DEFAULT_MANIFEST.governance,
        ...(parsed.governance || {}),
        readOnlyZones:
          parsed.governance?.readOnlyZones ??
          DEFAULT_MANIFEST.governance.readOnlyZones,
        ephemeralZones:
          parsed.governance?.ephemeralZones ??
          DEFAULT_MANIFEST.governance.ephemeralZones,
        limits: {
          ...DEFAULT_MANIFEST.governance.limits,
          ...(parsed.governance?.limits || {}),
        },
      },
      dimensions:
        Array.isArray(parsed.dimensions) && parsed.dimensions.length > 0
          ? parsed.dimensions
          : DEFAULT_MANIFEST.dimensions,
      rituals: {
        ...DEFAULT_MANIFEST.rituals,
        ...(parsed.rituals || {}),
      },
    };
  } catch {
    return DEFAULT_MANIFEST;
  }
}

const manifest = loadManifest();
const LIMITS = manifest.governance.limits;
const PROJECT_DIR = manifest.governance.projectDir || ".guidance/project";
const STATUS = join(PROJECT_DIR, "STATUS.md").replace(/\\/g, "/");
const PLAN = join(PROJECT_DIR, "PLAN.md").replace(/\\/g, "/");
const README_DOC = (
  manifest.governance.readmeDoc || join(PROJECT_DIR, "README.md")
).replace(/\\/g, "/");
const BOARD = (
  manifest.governance.boardFile || join(PROJECT_DIR, "REGISTRY.md")
).replace(/\\/g, "/");
const READ_ONLY_ZONES = manifest.governance.readOnlyZones || [
  "docs",
  ".archieves",
];
const DIMENSION_NAMES = manifest.dimensions.map((d) => d.name);

const USAGE = `
WARNA session ritual runner (manifest-driven, read-only).

  node scripts/session.mjs start     STEP 0: tree, git log, logbook cards, live claims, lint check
  node scripts/session.mjs cp        CP-3: one checkpoint block, three pointer lines
  node scripts/session.mjs end       Pre-compact handoff checklist, audit, and skeletons
  node scripts/session.mjs lint      Validate line budgets, card cap, and read-only zones

Fields are prompted when stdin is a TTY; pass them as flags otherwise:

  --dimension --changed --proved --next --blocks --n      (cp)
  --gate --doc --task --proved --unproved --next          (end)
  --no-prompt        never prompt, print the skeleton with placeholders
  --ignore-dirty     do not treat uncommitted work as a blocker
  --committed        the batch is committed even though the tree is dirty
  --json             emit pure JSON output
  --no-colour        disable ANSI colours
`;

if (flag("--help") || command === "help") {
  process.stdout.write(USAGE + "\n");
  process.exit(0);
}

/** Runs a command in the repo and returns trimmed stdout, or `""` when it fails. */
function sh(line) {
  try {
    return execSync(line, {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/** Reads a repo-relative file, or `""` when it does not exist. */
function text(relativePath) {
  try {
    return readFileSync(join(ROOT, relativePath), "utf8");
  } catch {
    return "";
  }
}

function lineCount(relativePath) {
  const content = text(relativePath);
  if (!content) return 0;
  return content.split(/\r?\n/).length;
}

const useColour = process.stdout.isTTY && !flag("--no-colour");
const dim = (s) => (useColour ? `\x1b[2m${s}\x1b[0m` : s);
const bold = (s) => (useColour ? `\x1b[1m${s}\x1b[0m` : s);

const lines = (value, count) =>
  value.split(/\r?\n/).filter(Boolean).slice(0, count);

const asJson = flag("--json");
const say = (...args) => {
  if (!asJson) console.log(...args);
};
const emit = (payload) =>
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);

/** Rows of the claim board — an empty list means no live writer. */
function claimRows() {
  const board = text(BOARD);
  if (!board) return [];
  const startIdx = board.indexOf("## Live claims");
  if (startIdx !== -1) {
    const endIdx = board.indexOf("## Row shape", startIdx);
    return board
      .slice(startIdx, endIdx === -1 ? undefined : endIdx)
      .split(/\r?\n/)
      .filter((line) => /^\|\s*`/.test(line))
      .map((line) => line.trim());
  }
  return board
    .split(/\r?\n/)
    .filter(
      (line) =>
        /^\|[^|]+\|/.test(line) &&
        !/Agent\s*\/\s*Session/i.test(line) &&
        !/^\|\s*-+/.test(line) &&
        !/\*\(empty\)\*/i.test(line) &&
        !/^\|\s*—\s*\|/.test(line),
    )
    .map((line) => line.trim());
}

function findTaskFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (
      [
        "node_modules",
        ".git",
        "dist",
        ...READ_ONLY_ZONES,
        ...(manifest.governance.ephemeralZones || []),
      ].includes(entry.name)
    ) {
      continue;
    }
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      findTaskFiles(full, out);
    } else if (entry.isFile() && /^TASK.*\.md$/i.test(entry.name)) {
      out.push(relative(ROOT, full).replace(/\\/g, "/"));
    }
  }
  return out;
}

/** Validates line budgets, card cap, and read-only zones without modifying any file. */
function lintRepo(rawPorcelain = "") {
  const issues = [];

  const statusLines = lineCount(STATUS);
  if (statusLines > LIMITS.statusMaxLines) {
    issues.push(
      `${STATUS}: ${statusLines} lines exceeds budget (${LIMITS.statusMaxLines})`,
    );
  }

  const planLines = lineCount(PLAN);
  if (planLines > LIMITS.planMaxLines) {
    issues.push(
      `${PLAN}: ${planLines} lines exceeds budget (${LIMITS.planMaxLines})`,
    );
  }

  const statusContent = text(STATUS);
  if (statusContent) {
    const cardCount = statusContent
      .split(/\r?\n/)
      .filter((l) => /^###\s+/.test(l)).length;
    if (cardCount > LIMITS.statusMaxCards) {
      issues.push(
        `${STATUS}: ${cardCount} cards exceeds max (${LIMITS.statusMaxCards})`,
      );
    }
  }

  for (const taskFile of findTaskFiles(ROOT)) {
    const tLines = lineCount(taskFile);
    if (tLines > LIMITS.taskMaxLines) {
      issues.push(
        `${taskFile}: ${tLines} lines exceeds budget (${LIMITS.taskMaxLines})`,
      );
    }
  }

  const porcelainLines = rawPorcelain
    ? rawPorcelain.split(/\r?\n/).filter(Boolean)
    : [];
  for (const rawLine of porcelainLines) {
    const filePath = rawLine.slice(3).trim().replace(/\\/g, "/");
    for (const zone of READ_ONLY_ZONES) {
      const normalizedZone = zone.replace(/^\/+|\/+$/g, "");
      if (
        filePath === normalizedZone ||
        filePath.startsWith(`${normalizedZone}/`)
      ) {
        issues.push(
          `Read-only zone touched: ${filePath} (zone: ${normalizedZone}/)`,
        );
      }
    }
  }

  return issues;
}

/** Everything the doors need, gathered once. */
function facts() {
  const statusRaw = sh("git status --short");
  const rawEntries = lines(statusRaw, 40);
  const untracked = rawEntries.filter((l) => l.startsWith("??")).length;
  const stagedOrModified = rawEntries.filter((l) => !l.startsWith("??")).length;
  const changed = rawEntries.map((line) =>
    line.replace(/^(\?\?|[ MADRCU?!]{1,2})\s+/, ""),
  );
  const logCount = Number(manifest.rituals?.gitLogCount) || 8;

  return {
    branch: sh("git rev-parse --abbrev-ref HEAD") || "?",
    head: (() => {
      const sha = sh("git rev-parse --short HEAD");
      return sha ? `${sha} ${sh("git log -1 --pretty=%s")}` : "(no commits)";
    })(),
    recent: lines(sh(`git log --oneline -${logCount}`), logCount),
    dirty: changed.length > 0,
    changed,
    staged: stagedOrModified,
    untracked,
    cards: lines(text(STATUS), 200)
      .filter((line) => /^###\s/.test(line))
      .map((line) =>
        line
          .replace(/^###\s*/, "")
          .replace(/^\d+[.)]\s*/, "")
          .trim(),
      ),
    claims: claimRows(),
    issues: lintRepo(statusRaw),
    stamp: (() => {
      const now = new Date();
      const pad = (n) => String(n).padStart(2, "0");
      return (
        `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ` +
        `${pad(now.getHours())}:${pad(now.getMinutes())}`
      );
    })(),
  };
}

/** Free-text answer: the flag when given, else a prompt, else the fallback. */
async function ask(rl, question, flagName, fallback = "") {
  const fromFlag = valueOf(flagName);
  if (fromFlag !== undefined) return fromFlag;
  if (!rl) return fallback;
  const answer = (
    await rl.question(`  ${question}${fallback ? dim(` [${fallback}]`) : ""} `)
  ).trim();
  return answer || fallback;
}

/** Opens a readline only when the session is interactive on both ends. */
function openPrompt() {
  if (!process.stdin.isTTY || !process.stdout.isTTY || flag("--no-prompt")) {
    return null;
  }
  return createInterface({ input: process.stdin, output: process.stdout });
}

// ─────────────────────────────────────────────────────────────────────────────
// start — STEP 0
// ─────────────────────────────────────────────────────────────────────────────
function start(f) {
  const verifyCmd =
    manifest.rituals?.verifyCommand ||
    (Array.isArray(manifest.rituals?.verifyPipeline)
      ? manifest.rituals.verifyPipeline.join(" && ")
      : null) ||
    "node scripts/session.mjs lint";
  const gate =
    f.staged + f.untracked > 0
      ? `code/files may have changed — run \`${verifyCmd}\` before the next commit`
      : "tree clean; a gate was probably already run — do not repeat it";

  say(bold(`\nWARNA session start — ${f.stamp}`));
  say(dim(`  branch ${f.branch} · HEAD ${f.head}\n`));

  say(bold("TREE    "), f.dirty ? `${f.changed.length} change(s)` : "clean");
  for (const line of f.changed) say(`  ${line}`);

  say(
    bold("\nRECENT  "),
    `${f.recent.length} commit(s)`,
    dim("(read: these are the log)"),
  );
  for (const line of f.recent) say(`  ${line}`);

  say(
    bold("\nLOGBOOK "),
    `${STATUS} — ${f.cards.length} card(s) (max ${LIMITS.statusMaxLines} lines)`,
  );
  f.cards.forEach((card, index) => say(`  ${index + 1}. ${card}`));

  say(
    bold("\nCLAIMS  "),
    f.claims.length ? `${f.claims.length} live writer(s)` : "no live writer",
  );
  for (const row of f.claims) say(`  ${row}`);

  say(bold("\nGATE    "), gate);

  if (f.issues.length > 0) {
    say(bold("\nBUDGETS "), `${f.issues.length} warning(s)`);
    for (const issue of f.issues) say(`  ! ${issue}`);
  }

  say(`\n${bold("REPORT THIS, then stop and ask which card:")}`);
  f.cards.forEach((card, index) => say(`  ${index + 1}. ${card}`));
  say(
    dim(
      "  Say the detail is NOT read yet, and that the git commands are unavailable if they are.",
    ),
  );

  say(
    `\n${bold("DO NOT read yet:")} detail docs, ${PLAN}, other dimensions, ${READ_ONLY_ZONES.map((z) => `${z}/`).join(", ")}`,
  );
  say(
    dim(
      `  Read ${README_DOC} (read-only) for big-picture flow; open a local TASK.md only after picking a card.\n` +
        `  Take a claim row (${BOARD}) before the first edit.\n`,
    ),
  );

  if (asJson) {
    emit({
      door: "start",
      stamp: f.stamp,
      branch: f.branch,
      head: f.head,
      tree: { clean: !f.dirty, changed: f.changed },
      recent: f.recent,
      logbook: {
        file: STATUS,
        cards: f.cards,
        maxLines: LIMITS.statusMaxLines,
      },
      claims: f.claims,
      gate,
      issues: f.issues,
      report: f.cards,
      doNotRead: [
        "detail docs",
        PLAN,
        "other dimensions",
        ...READ_ONLY_ZONES.map((z) => `${z}/`),
      ],
      next: "ask which card to continue",
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// cp — the checkpoint
// ─────────────────────────────────────────────────────────────────────────────
async function checkpoint(f, rl) {
  const dimHint = DIMENSION_NAMES.join("|");
  const defaultDim = DIMENSION_NAMES[0] || "Project";

  say(bold(`\nCP-${LIMITS.checkpointLines} — ${f.stamp}`));
  say(
    dim(
      `  ${LIMITS.checkpointLines} pointer lines. No prose — prose belongs in a file.\n`,
    ),
  );

  const dimension = await ask(
    rl,
    `Dimension (${dimHint}):`,
    "--dimension",
    defaultDim,
  );
  const changedIn = await ask(
    rl,
    "CHANGED → <path>:<symbol> (<test|command>):",
    "--changed",
    f.changed[0] ?? "",
  );
  const proved = await ask(
    rl,
    "PROVED  → <command> → <measured>:",
    "--proved",
    "",
  );
  const next = await ask(rl, "NEXT    → <one action>:", "--next", "");
  const blocks = await ask(rl, "blocks (none|item):", "--blocks", "none");
  const n = Number(
    await ask(
      rl,
      "CP number:",
      "--n",
      String(Number(sh("git rev-list --count HEAD") || 0)),
    ),
  );

  const block = [
    `CP ${Number.isFinite(n) ? n : "?"} ${f.stamp} ${dimension}`,
    `CHANGED → ${changedIn || "<path>:<symbol> (<test|command>)"}`,
    `PROVED  → ${proved || "<command> → <measured result>"}`,
    `NEXT    → ${next || "<one action>"} | blocks: ${blocks}`,
  ].join("\n");

  say(
    `\n${bold(`paste into /memories/session/<task>.md (keep last 3 only, total ≤ ${LIMITS.memoryMaxLines} lines):`)}\n`,
  );
  say(block);
  say("");

  if (asJson) {
    emit({
      door: "cp",
      checkpoint: {
        n: Number.isFinite(n) ? n : null,
        stamp: f.stamp,
        dimension,
        changed: changedIn,
        proved,
        next,
        blocks,
      },
      block,
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// end — the pre-compact handoff
// ─────────────────────────────────────────────────────────────────────────────
async function end(f, rl) {
  say(bold(`\nPre-compact handoff — ${f.stamp}`));
  say(dim(`  HEAD ${f.head}\n`));

  const dirty = f.dirty && !flag("--ignore-dirty");
  const step = (n, title, state) =>
    say(`${String(n).padStart(2)}. ${title} — ${state}`);

  step(
    1,
    "Stop clean",
    dirty ? `${f.changed.length} uncommitted change(s)` : "nothing in flight",
  );
  if (dirty) for (const line of f.changed) say(`      ${line}`);

  const gate = await ask(rl, "2. Gate result (or `md-only`):", "--gate", "");
  step(2, "Gate", gate || "NOT RECORDED");

  step(
    3,
    "Commit",
    dirty && !flag("--committed")
      ? "UNCOMMITTED — an uncommitted batch does not survive"
      : "committed",
  );

  const doc = await ask(
    rl,
    "4. Active TASK.md path (or empty if deleted/none):",
    "--doc",
    "",
  );
  step(
    4,
    "Task doc",
    doc
      ? `${doc} (≤ ${LIMITS.taskMaxLines} lines) — update Next: or delete if done`
      : "none / cleaned",
  );

  const task = await ask(
    rl,
    "5. Session memory file (/memories/session/<task>.md):",
    "--task",
    "",
  );
  step(
    5,
    "Memory",
    task
      ? `${task} — pointer + last 3 CPs only (≤ ${LIMITS.memoryMaxLines} lines total)`
      : "no memory file",
  );

  step(
    6,
    "Logbook",
    `${f.cards.length} card(s) in ${STATUS} (≤ ${LIMITS.statusMaxLines} lines) — rewrite, newest on top`,
  );
  step(
    7,
    "Queue/Plan",
    `${PLAN} (≤ ${LIMITS.planMaxLines} lines) — update only if queue/stage changed`,
  );
  step(
    8,
    "Report",
    "four bullets (Changed, Proved, Unproved, Next) in chat language",
  );
  step(
    9,
    "Claim row",
    f.claims.length ? `LIVE in ${BOARD} — release it` : "already empty",
  );

  if (f.issues.length > 0) {
    say(`\n${bold("── budget & zone warnings ──")}`);
    for (const issue of f.issues) say(`  ! ${issue}`);
  }

  const proved = await ask(
    rl,
    "PROVED → <command> → <number>:",
    "--proved",
    gate,
  );
  const unproved = await ask(
    rl,
    "NOT PROVED:",
    "--unproved",
    "nothing outstanding",
  );
  const next = await ask(rl, "NEXT → <single action>:", "--next", "");

  say(`\n${bold("── report to the user ──")}`);
  say(`Sampai di sini.`);
  say(
    `\nCHANGED → ${f.changed.length ? f.changed.slice(0, 6).join(", ") : "nothing pending"}`,
  );
  say(`PROVED  → ${proved || "<command> → <number>"}`);
  say(`NOT PROVED → ${unproved}`);
  say(`NEXT    → ${next || "<one action>"}`);
  say(`\nSilakan compact / buka chat baru.`);

  say(
    `\n${bold(`── memory skeleton (overwrite, ≤ ${LIMITS.memoryMaxLines} lines, no STATUS mirror) ──`)}`,
  );
  say(`Task: ${doc || "<none>"}`);
  say(`State: ${f.head}`);
  say(`Next: ${next || "<one action>"}`);

  say(`\n${bold(`── logbook skeleton (≤ ${LIMITS.statusMaxLines} lines) ──`)}`);
  say(`### 1. <newest — one line from the last commit> — active`);
  say(`**Open:** ${next || "<what is left>"}`);
  say("→ " + (doc || README_DOC));
  say(
    dim(
      `  Max ${LIMITS.statusMaxCards} cards; demote older cards and drop cards past the cap.`,
    ),
  );

  say(`\n${bold("── commit shape ──")}`);
  say(
    "<type>(<scope>): <imperative summary, <= 72 chars>\n\n- <finding> → <fix> → <evidence>\n",
  );
  if (dirty)
    say(
      dim(
        "  Uncommitted work is blocking this handoff — commit or revert first.\n",
      ),
    );

  if (asJson) {
    emit({
      door: "end",
      stamp: f.stamp,
      head: f.head,
      steps: {
        stopClean: dirty ? "uncommitted" : "clean",
        changed: f.changed,
        gate: gate || null,
        commit: dirty && !flag("--committed") ? "uncommitted" : "committed",
        taskDoc: doc || null,
        memory: task || null,
        logbook: {
          file: STATUS,
          cards: f.cards,
          maxLines: LIMITS.statusMaxLines,
        },
        claimRow: f.claims.length ? "release" : "empty",
      },
      issues: f.issues,
      report: {
        changed: f.changed.slice(0, 6),
        proved: proved || null,
        notProved: unproved,
        next: next || null,
      },
      memorySkeleton: { task: doc || null, state: f.head, next: next || null },
      commitShape: "<type>(<scope>): <imperative summary, <= 72 chars>",
      blocked: dirty && !flag("--committed"),
    });
  }
}

function runLint(f) {
  if (asJson) {
    emit({
      door: "lint",
      stamp: f.stamp,
      ok: f.issues.length === 0,
      limits: LIMITS,
      readOnlyZones: READ_ONLY_ZONES,
      issues: f.issues,
    });
    process.exitCode = f.issues.length === 0 ? 0 : 1;
    return;
  }

  if (f.issues.length === 0) {
    console.log(
      `WARNA lint OK (budgets & read-only zones [${READ_ONLY_ZONES.join(", ")}] clean).`,
    );
    process.exitCode = 0;
    return;
  }

  console.error(`WARNA lint found ${f.issues.length} issue(s):`);
  for (const issue of f.issues) {
    console.error(` - ${issue}`);
  }
  process.exitCode = 1;
}

const f = facts();
const rl = openPrompt();
try {
  if (command === "start") start(f);
  else if (command === "cp" || command === "checkpoint")
    await checkpoint(f, rl);
  else if (command === "end" || command === "pre-compact") await end(f, rl);
  else if (command === "lint") runLint(f);
  else {
    console.error(
      `Unknown door "${command}". Try: start · cp · end · lint · --help`,
    );
    process.exitCode = 1;
  }
} finally {
  rl?.close();
}
