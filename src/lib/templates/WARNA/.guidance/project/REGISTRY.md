# Claim Board & Edit Boundaries

## Edit Permissions

- `STATUS.md`: **Editable** (keep ≤ {{STATUS_MAX_LINES}} lines, max {{STATUS_MAX_CARDS}} cards).
- `PLAN.md`: **Queue/status only** (keep ≤ {{PLAN_MAX_LINES}} lines, max {{PLAN_MAX_ACTIVE}} active).
- `REGISTRY.md`: **Claim Board table only** — do not alter permissions or add prose here.
- `README.md`, `docs/`, & `.archieves/`: **READ-ONLY** unless explicitly instructed.

## Live claims (One Writer Per Write Scope, TTL {{BOARD_TTL}})

| Agent / Session | Dimension / Module | Task | Write Scope | Updated | State |
| --------------- | ------------------ | ---- | ----------- | ------- | ----- |
| —               | —                  | —    | —           | —       | idle  |
