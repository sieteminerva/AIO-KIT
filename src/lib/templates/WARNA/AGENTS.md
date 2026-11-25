> **STEP 0 (Mandatory):** Run `node scripts/session.mjs start`. Read **only** `.guidance/project/STATUS.md` (≤ {{STATUS_MAX_LINES}} lines) and `.guidance/project/README.md` (read-only).
> Do **not** scan directories or open `docs/`, `.archieves/`, or other dimensions unless explicitly needed.
> Claim your write scope in `.guidance/project/REGISTRY.md` **before** editing; overlapping an active scope = stop and ask.

# AGENTS.md — {{PROJECT_NAME}} (WARNA Root)

## 1. Role Lock (Match User Intent)

- **Discusser:** Discussion/sketching/opinions only. Answer with facts and trade-offs. **Zero** file edits, **zero** execution plans, **no** _"do you want me to start?"_ at the end.
- **Conceptor:** High-level architecture, module flow, and function outlines only. **No** implementation code or unrequested file edits.
- **Executor:** Implement/fix/refactor only when asked. State a 2–3 line plan, claim scope, run gates, and leave a `{{CHECKPOINT_LINES}}`-line `CP-3` block.

## 2. Dimension Routes (Strict — No Raw Doc Dumps)

Stay inside your active dimension. This table maps **dimensions to their router file only**—never dump raw docs, notes, or ad-hoc links here. Do not add rows without explicit instruction.

| Dimension | Paths | Router |
| --------- | ----- | ------ |

{{DIMENSION_ROWS}}

## 3. Hard Zone & Note Rules

- **`docs/` & `.archieves/`:** **STRICT READ-ONLY** for agents. Never create new `.md` files in `docs/` when asked to _"catatkan"_, _"bukukan"_, or _"dokumentasikan"_.
- **`.temp/`:** Script/session logs and ephemeral outputs only. Never store permanent notes or specs here.
- **Direct Note Targets:** Session/progress → `.guidance/project/STATUS.md` | Queue/stage → `.guidance/project/PLAN.md` | Scope lock → `.guidance/project/REGISTRY.md` | Case spec → local `TASK.md` (≤ {{TASK_MAX_LINES}} lines, delete when done).
- **`/memories/`:** Pointer-only + last 3 `CP-3` blocks (≤ {{MEMORY_MAX_LINES}} lines). **Never** copy `STATUS.md` or rules into `/memories/`.

## 4. Mandatory Cleanup & Pre-Compact

- **Cleanup Before Wrap-Up / Handoff:** Delete finished `TASK.md` files, clear obsolete `.temp/` scratch logs, release your claim row in `.guidance/project/REGISTRY.md`, prune `/memories/` to ≤ {{MEMORY_MAX_LINES}} lines, and verify no stray `.md` files exist in `docs/` or `.archieves/`.
- **Pre-Compact Thresholds:** Wrap batch at **~60k**; run cleanup + `node scripts/session.mjs end` + signal compact at **~80k**; hard stop at **~100k**.
- **Language:** Reply matching the user's language (Indonesian/English); write all repo code, comments, JSDoc, and docs in **English**.
