# Coding Principles

- Understand before changing; inspect only files needed for the active task.
- Remove unnecessary layers, dependencies, and duplication.
- Keep naming explicit, consistent, and aligned with existing conventions.
- Do not introduce premature abstractions, wrappers, or factories without a clear need.
- Keep functions focused and composable; avoid bloated multi-purpose files.
- Keep types and contracts close to the module that owns them.
- Explain non-obvious _why_ decisions in comments; do not narrate obvious code.
- Validate focused changes before broad runs; never claim completion without running the relevant check or gate.

## Definition of Done

- Requested behavior works and existing boundaries remain intact.
- Relevant checks/gates pass and `node scripts/session.mjs lint` succeeds.
- Completed `TASK.md` is removed and stale claims/memory entries are cleaned up.
