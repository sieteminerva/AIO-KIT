# WARNA Agent Rules

Operational contract for agents working in this repository. Keep signal high, avoid blind file reads, and never bypass zone or budget rules.

## 1. Role Lock & Non-Intrusive Collaboration

- **Discusser:** Answer with facts, trade-offs, and analysis only. Do not edit files, do not build execution plans, and never end with _"do you approve / should I start?"_.
- **Conceptor:** Sketch architecture, boundaries, data flow, and function outlines only. Do not write full implementation code or touch source files unless asked.
- **Executor:** Execute only when asked. State a 2–3 line plan first, claim write scope before editing, verify results, and leave a `{{CHECKPOINT_LINES}}`-line `CP-3` block.

## 2. Hard Line & Volume Budgets (Enforced by `node scripts/session.mjs lint`)

Item count limits alone are invalid (e.g., 3 bullets with 200 lines still violate budgets).

| Target                        | Max Lines                | Cap Rule                                                                           |
| ----------------------------- | ------------------------ | ---------------------------------------------------------------------------------- |
| `.guidance/project/STATUS.md` | **{{STATUS_MAX_LINES}}** | Max {{STATUS_MAX_CARDS}} cards; ≤ {{STATUS_MAX_CARD_LINES}} lines/card + 1 pointer |
| `.guidance/project/PLAN.md`   | **{{PLAN_MAX_LINES}}**   | Max {{PLAN_MAX_ACTIVE}} `## Active` items; ≤ {{PLAN_MAX_ITEM_LINES}} lines/item    |
| `TASK.md` (module/project)    | **{{TASK_MAX_LINES}}**   | README-style single-pass spec; **delete** when finished                            |
| `/memories/*`                 | **{{MEMORY_MAX_LINES}}** | Pointers + ≤ 3 `CP-3` blocks only; never copy `STATUS.md` or rules                 |
| `CP-3` checkpoint             | **{{CHECKPOINT_LINES}}** | Strictly `CHANGED →`, `PROVED →`, `NEXT →` (never a 4th line)                      |

## 3. Reads, Direct Note Targets & Zone Locks

- **Orient first:** Run `node scripts/session.mjs start`, then read only `.guidance/project/STATUS.md` and `.guidance/project/README.md` (read-only). Open a module/project `TASK.md` only for the active task and delete it when done.
- **Bounded output:** Keep terminal output compact (`git --no-pager`, `| head` / `| tail`). Never read lockfiles or generated build artifacts unless required.
- **Direct-to-target notes:**
  - Session state / return point → `.guidance/project/STATUS.md`
  - Queue / stage status → `.guidance/project/PLAN.md`
  - Active write scope → `.guidance/project/REGISTRY.md`
  - Active case context → local `TASK.md`
- **Forbidden note dumps:** Never create new `.md` files in `docs/` when asked to record/document, never treat `.archieves/` as active source, and never use `.temp/` as permanent storage.

## 4. Claim Board, Gates, Commits & Proof

- **Claims:** Claim your write scope in `.guidance/project/REGISTRY.md` before the first edit. Overlapping a live scope is a **stop-and-ask** (never silently overwrite). Stale claims past `{{BOARD_TTL}}` with idle `git status --short` may be reclaimed.
- **Gates & proof:** Run only the narrowest relevant verification gate for what changed (or state `md-only` for markdown-only changes). State concrete measured proof for output/behavior changes—never rely on _"looks right"_ or stale gate runs.
- **Commits:** Commit batches using `git commit -F <msg-file>` with `<type>(<scope>): <summary>` and concise `finding → fix → evidence` bullets so history survives context compaction.

## 5. Pre-Compact & Session Handoff (~60k / ~80k / ~100k)

- **~60k tokens:** Wrap the active batch cleanly (finish edits, run gate, commit).
- **~80k tokens (or on compact/new-chat request):** Stop new edits and run handoff:
  1. Run `node scripts/session.mjs end` and clean obsolete `.temp/` logs or finished `TASK.md` files.
  2. Commit completed work via `git commit -F <msg-file>`.
  3. Update `TASK.md` (`Next:` with file + symbol) and `.guidance/project/STATUS.md` with links valid in the commit, then release your claim row in `.guidance/project/REGISTRY.md`.
  4. Prune `/memories/` to ≤ {{MEMORY_MAX_LINES}} lines (pointers + last 3 `CP-3` blocks only).
  5. Report 4 bullets (**Changed**, **Proved**, **Unproved**, **Next Action**) and ask the user to compact or open a new chat.
- **~100k tokens:** Hard stop; execute handoff immediately without starting new edits.

## Execution & Anti-Loop Locks

- **Fail-fast (2x cap)**: If reading/editing a file or running a command fails **2 consecutive times** for the same reason, stop repeating blind retries, note the blocker briefly, and report concrete facts—never loop to burn context[cite: 4].
- **Write-scope discipline**: Touch only files inside the active claim scope in `REGISTRY.md` (or the 1–2 target files in micro-scope mode). Do not expand into unrelated folders without clear proof/reason.
- **Producer vs. Consumer boundary**: In `Consumer` scopes, rely on module contracts/catalogues rather than editing `Producer` internals unless explicitly assigned to the `Producer` scope[cite: 3, 4].

## Code Style Locks (High-Drift Rules)

- **CSS selectors**: Do **not** use `dash-case` class/selector names except forced modifiers when unavoidable; prefer nested CSS syntax.
- **JS/TS naming**: Prefer short, clear, or single-word names for classes, methods, and functions; avoid long, verbose compound names.
- **Batch discipline**: When updating multiple CSS or JS/TS files, work in small batches and re-check style rules before finishing or running handoff[cite: 1, 3].
