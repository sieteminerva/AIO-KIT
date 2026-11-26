## PLAN

- [ ] Make architecture plug and play, by making inside /prompts is the command to run.
      for example: There is /prompts/File, by default the index.ts will always scan that /prompts whenever
      `aio` command is executed. so by then `aio file` is automatically available
  - Approach: per-folder **`command.ts` manifest**, not raw folder scanning. Raw scanning
    breaks today because entry signatures differ (`Image` is `(filename, DIR)` while others
    are `(DIR, filename?)`), folder names do not equal command names (`Text` → `textminator`,
    `Image`/`Utility` are dialogs), and commands need `order` for stable `--help` output.
  - [ ] `src/lib/command.ts` — `AioCommand` type:
        `name`, `aliases[]`, `order`, `description`, `options[]` (`flags` + `desc`),
        `configure?(cmd)` escape hatch (for `.choices()` / `commander.Option`),
        `run(options)`
  - [ ] Loader in `src/index.ts` — `readdir('./prompts/')` → skip dirs without
        `command.js` → dynamic import (tsx maps `.js` → `.ts`) → register → sort by `order`
  - [ ] Move `parse()` to `await build(); aio.parseAsync(process.argv)` — the loader is
        async; keep `start` registered manually and `NO_COMMAND_SPECIFIED → aio.help()`
  - [ ] Shared `baseOptions` (`--path`, `--name`) reused by manifests, no copy-paste
  - [ ] No circular imports: `command.ts` imports only `src/lib/command.ts`, never `index.ts`
  - [ ] Phase 1: loader added, manual `aio.command(...)` blocks still present (nothing removed)
  - [ ] Phase 2: migrate `file` only → gate: `aio --help` and `aio file -h` identical
        to the pre-refactor output
  - [ ] Phase 3: migrate the remaining 6 folders one by one (same gate per step)
  - [ ] Phase 4: delete the manual blocks from `src/index.ts`
  - Fallback if filesystem discovery proves fragile: a single `src/commands.ts` array with
    the same object shape (no `readdir`, compile-time typed) — still removes the manual
    Commander blocks, at the cost of one edit per new command.

- [ ] Under `New` command, create:
  - vite x @aio-ui (custom build)
  - vite x @aio-gas (GAS consumer app x @aio-gas-library)
  - vite x @aio-ext (Chrome Extension)
  - vite x @aio-desktop (Desktop App)
  - vite x @aio-mobile (Mobile App)

## PLAN — Dependency bootstrapper (`ensure`)

Runtime check for external requirements (binaries + data files) with a guided
download prompt, then continue the original task automatically.

- [ ] `src/class/Dependency.class.ts`
  - registry entry: `id`, `kind: 'binary' | 'file'`, `env` override, `verify` args,
    `url(platform)`, `sha256`, `install(dest)`
  - `ensure(id): Promise<string>` returns a ready-to-use absolute path
  - resolution order: env override → `PATH` → user cache `~/.aio/bin` → prompt
  - cache negative/positive results per process (no repeated spawns)
- [ ] Installer
  - fetch → write `.tmp` → verify `sha256` → atomic rename → `chmod +x` (unix)
  - extract with `tar` (bsdtar on Windows 10+ handles `.zip`), no extra unzip dep
  - post-install probe (`-version`) must pass before continuing
  - idempotent: valid cache = no prompt, no download
- [ ] Prompt UX (`y/N` + progress + version output), then continue the task
- [ ] Non-interactive mode: `--yes` / `AIO_ASSUME_YES=1`; otherwise fail fast with
      manual install hint (never hang waiting for input in CI)
- [ ] Pin versions (stable, reproducible checksums)
  - ffmpeg **7.1** stable (not the nightly `N-*` build currently on PATH)
  - yt-dlp `2026.10.26` (user may still run `yt-dlp -U`)
  - tessdata `tessdata_fast/eng` (~4 MB)
- [ ] Never install into `dest/` or `node_modules`; cache lives in `~/.aio/bin`
- [ ] Migrate OCR tessdata to `ensure('tessdata-*')` and drop the 31 MB
      `lib/data` copy from `compileAssets.mjs` (keep local files as offline fallback)

## PLAN — Video toolkit (CLI spawn, no JS wrapper)

Decision: spawn `ffmpeg` / `ffprobe` / `yt-dlp` directly with `args[]` and
`shell: false` (wrapper libs like `fluent-ffmpeg` lag behind the CLI).

- [ ] `src/class/VideoProcessor.class.ts` (extends `AioFileOperation`)
  - `run(args, onProgress)` — spawn + exit code + tail of `stderr` on failure
  - `probe(file)` — `ffprobe -v quiet -print_format json`
  - `convert`, `compress`, `trim`, `concat`, `audio` (extract), `thumbnail`
  - `gif` — `palettegen` + `paletteuse` (better quality than the image `gif()`)
  - `download(url, options)` — `yt-dlp`, mp4 / audio-only
- [ ] Progress parsing
  - ffmpeg: `-nostats -progress pipe:1` → parse `key=value` (`out_time_ms`, `speed`)
  - yt-dlp: `--newline --progress-template`
- [ ] `src/prompts/Video/*.prompt.ts` + menu entry (`video` task in `MainDialogPrompt`)
- [ ] Execution order
  1. `VideoProcessor` + `run`/`probe` (gate: real `ffmpeg -version`, ffprobe JSON)
  2. convert + compress/trim prompts
  3. download via yt-dlp
  4. video → gif
- [ ] Binary source: `ensure('ffmpeg')` / `ensure('yt-dlp')` from the bootstrapper
      (PATH-first, guided download fallback), no ~80 MB binary in `dependencies`
