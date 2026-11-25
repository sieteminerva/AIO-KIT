import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

/** Template root, resolved next to the compiled class (`dest/lib/templates/WARNA`). */
const TEMPLATES_DIR = join(dirname(fileURLToPath(import.meta.url)), "..", "lib", "templates", "WARNA");
const MANIFEST_FILE = join(TEMPLATES_DIR, "warna.manifest.json");

// Stateful project files that must never be overwritten without `force`
const STATEFUL = new Set([
  ".guidance/project/REGISTRY.md",
  ".guidance/project/STATUS.md",
  ".guidance/project/README.md",
  ".guidance/project/PLAN.md",
]);

/**
 * Template-relative path → consumer-relative path.
 * Unlisted files keep their relative path; the manifest is seeded, never copied raw.
 */
const LAYOUT: Record<string, string> = {
  "warna.manifest.json": ".guidance/manifest.json",
  "warna.md": ".guidance/warna.md",
};

export interface WarnaOptions {
  /** Target workspace root. Defaults to `process.cwd()`. */
  cwd?: string;
  /** Overwrite existing files, including stateful ones. */
  force?: boolean;
  /** Only sync guidance rules; skip stateful project files. */
  syncRulesOnly?: boolean;
}

interface Manifest {
  name: string;
  governance: Record<string, any> & { limits?: Record<string, any> };
  dimensions?: { name: string; paths: string[]; router: string }[];
  overrideConditions?: {
    existingWins?: boolean;
    warnOnMisplacedExisting?: boolean;
    alternativePaths?: Record<string, string[]>;
  };
  stitching?: Record<string, any>;
  rituals?: Record<string, any>;
  [key: string]: any;
}

/**
 * ## AioWarna
 *
 * Generates a WARNA workspace from the external templates in
 * `src/lib/templates/WARNA`, driven by `warna.manifest.json`.
 * Placeholders such as `{{PROJECT_NAME}}` are injected, and existing files win
 * unless `force` is passed. The manifest and `warna.md` are routed into
 * `.guidance/` (see `LAYOUT`) so the consumer layout matches `warna.md`.
 *
 * @example
 * ```typescript
 *
 *    AioWarna.init({ cwd: './my-workspace' });
 *    AioWarna.init({ cwd: './my-workspace', force: true });
 *
 * ```
 */
export class AioWarna {

  static readonly templateDir = TEMPLATES_DIR;

  static init({ cwd = process.cwd(), force = false, syncRulesOnly = false }: WarnaOptions = {}): void {
    if (!existsSync(TEMPLATES_DIR)) {
      throw new Error(`[WARNA] Templates directory not found at: ${TEMPLATES_DIR}`);
    }

    // The manifest is seeded into the target root, so it must exist first
    mkdirSync(cwd, { recursive: true });

    const manifest = this._manifest(cwd);
    const tokens = this._tokens(manifest);
    const override = manifest.overrideConditions ?? {};
    const existingWins = override.existingWins !== false;

    // Ensure governance & zone folders exist
    for (const dir of [
      manifest.governance.guidanceDir,
      manifest.governance.mandatoryDir,
      manifest.governance.projectDir,
      manifest.governance.docsDir,
      manifest.governance.scriptsDir,
      ...(manifest.governance.readOnlyZones ?? []),
      ...(manifest.governance.ephemeralZones ?? []),
    ]) {
      mkdirSync(join(cwd, dir), { recursive: true });
    }

    for (const relPath of this._collect()) {
      const outRel = LAYOUT[relPath] ?? relPath;
      const isStateful = STATEFUL.has(outRel);

      if (syncRulesOnly && isStateful) {
        console.log(`[SKIP] ${outRel} (--sync-rules mode)`);
        continue;
      }

      const conflict = this._conflict(cwd, outRel, override);
      if (conflict && !force) {
        if (conflict.type === "misplaced") {
          if (override.warnOnMisplacedExisting !== false) {
            console.warn(
              `[WARN: CONFLICT] Skipped ${outRel} — existing file found at "${conflict.foundAt}". Existing wins; pass --force to write ${outRel} anyway.`,
            );
          }
          continue;
        }
        if (isStateful || existingWins) {
          console.log(`[KEEP] ${outRel} (existing file wins; pass --force to overwrite)`);
          continue;
        }
      }

      const raw = readFileSync(join(TEMPLATES_DIR, relPath), "utf8");
      const rendered = this._inject(raw, tokens);
      const dest = join(cwd, outRel);

      mkdirSync(dirname(dest), { recursive: true });
      writeFileSync(dest, rendered, "utf8");
      console.log(`${conflict && force ? "[FORCE]" : "[WRITE]"} ${outRel}`);
    }

    console.log("\n[WARNA] Done. Run: node scripts/session.mjs start");
  }

  /** Lists template files relative to the template root (manifest excluded). */
  private static _collect(dir: string = TEMPLATES_DIR, root: string = TEMPLATES_DIR): string[] {
    const files: string[] = [];
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const full = join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this._collect(full, root));
      } else if (entry.isFile() && entry.name !== "warna.manifest.json") {
        files.push(relative(root, full).replace(/\\/g, "/"));
      }
    }
    return files;
  }

  /** Loads the target manifest if present, otherwise seeds it from the default one. */
  private static _manifest(cwd: string): Manifest {
    const defaults: Manifest = JSON.parse(readFileSync(MANIFEST_FILE, "utf8"));
    const manifestRel = LAYOUT["warna.manifest.json"] ?? "warna.manifest.json";
    const target = join(cwd, manifestRel);
    const legacy = join(cwd, "warna.manifest.json");

    if (!existsSync(target)) {
      // No manifest yet: adopt a legacy root manifest when present, else seed a fresh one
      if (existsSync(legacy)) {
        const migrated: Manifest = JSON.parse(readFileSync(legacy, "utf8"));
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, JSON.stringify(migrated, null, 2) + "\n", "utf8");
        console.log(`[WARNA] Migrated warna.manifest.json → ${manifestRel}`);
        return this._merge(defaults, migrated);
      }

      const created = { ...defaults, name: basename(cwd) };
      mkdirSync(dirname(target), { recursive: true });
      writeFileSync(target, JSON.stringify(created, null, 2) + "\n", "utf8");
      console.log(`[WARNA] Created ${manifestRel}`);
      return created;
    }

    const user = JSON.parse(readFileSync(target, "utf8"));
    return this._merge(defaults, user);
  }

  /** Deep-merges a user manifest over the defaults (governance/limits/mappings). */
  private static _merge(defaults: Manifest, user: Partial<Manifest>): Manifest {
    return {
      ...defaults,
      ...user,
      governance: {
        ...defaults.governance,
        ...(user.governance ?? {}),
        limits: {
          ...defaults.governance.limits,
          ...(user.governance?.limits ?? {}),
        },
      },
      overrideConditions: {
        ...defaults.overrideConditions,
        ...(user.overrideConditions ?? {}),
        alternativePaths: {
          ...defaults.overrideConditions?.alternativePaths,
          ...(user.overrideConditions?.alternativePaths ?? {}),
        },
      },
      stitching: { ...defaults.stitching, ...(user.stitching ?? {}) },
      rituals: { ...defaults.rituals, ...(user.rituals ?? {}) },
    };
  }

  /** Builds the placeholder → value map from the manifest. */
  private static _tokens(manifest: Manifest): Record<string, string> {
    const L = manifest.governance.limits ?? {};
    const rows = (manifest.dimensions ?? [])
      .map(d => `| ${d.name} | \`${d.paths.join("`, `")}\` | \`${d.router}\` |`)
      .join("\n");

    return {
      "{{PROJECT_NAME}}": manifest.name,
      "{{BOARD_TTL}}": String(manifest.governance.boardTtl ?? "24h"),
      "{{STATUS_MAX_LINES}}": String(L.statusMaxLines ?? 45),
      "{{STATUS_MAX_CARDS}}": String(L.statusMaxCards ?? 3),
      "{{STATUS_MAX_CARD_LINES}}": String(L.statusMaxCardLines ?? 4),
      "{{PLAN_MAX_LINES}}": String(L.planMaxLines ?? 60),
      "{{PLAN_MAX_ACTIVE}}": String(L.planMaxActiveItems ?? 3),
      "{{PLAN_MAX_ITEM_LINES}}": String(L.planMaxItemLines ?? 2),
      "{{TASK_MAX_LINES}}": String(L.taskMaxLines ?? 50),
      "{{MEMORY_MAX_LINES}}": String(L.memoryMaxLines ?? 12),
      "{{CHECKPOINT_LINES}}": String(L.checkpointLines ?? 3),
      "{{DIMENSION_ROWS}}": rows,
    };
  }

  private static _inject(raw: string, tokens: Record<string, string>): string {
    let output = raw;
    for (const [placeholder, value] of Object.entries(tokens)) {
      output = output.split(placeholder).join(value);
    }
    return output;
  }

  /** Detects an exact or misplaced existing file for the given template path. */
  private static _conflict(
    cwd: string,
    relPath: string,
    override: Manifest["overrideConditions"],
  ): { type: "exact" | "misplaced"; foundAt: string } | null {
    if (existsSync(join(cwd, relPath))) {
      return { type: "exact", foundAt: relPath };
    }
    for (const altRel of override?.alternativePaths?.[relPath] ?? []) {
      if (existsSync(join(cwd, altRel))) {
        return { type: "misplaced", foundAt: altRel };
      }
    }
    return null;
  }
}
