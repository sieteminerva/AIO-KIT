# Documentation Rules

## Code & Declaration Docs

- Add or update concise JSDoc / TypeDoc on new or modified exported functions, classes, types, or key constants (`@summary`, `@param`, `@returns`, `@throws` when applicable).
- Use brief step comments only for non-trivial logical stages.

## Strict Placement & Anti-Leakage

- **NEVER** create new `.md` files in `docs/` when asked to record, log, or document work.
- Write directly to the matching target:
  - Session progress / return point → `.guidance/project/STATUS.md` (≤ {{STATUS_MAX_LINES}} lines)
  - Queue / stage change → `.guidance/project/PLAN.md` (≤ {{PLAN_MAX_LINES}} lines)
  - Single-pass task context → local `TASK.md` (≤ {{TASK_MAX_LINES}} lines; **delete** when finished)
- **NEVER** mirror `STATUS.md`, `PLAN.md`, or repo rules into `/memories/` (keep `/memories/` ≤ {{MEMORY_MAX_LINES}} lines, pointer & `CP-3` only).
