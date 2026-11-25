# Architecture Guidance

## Core Belief

Build systems from the root of the problem. Prefer understandable foundations, explicit boundaries, and modules that can be used independently.

## Boundaries & Routing

- Keep lower layers or core contracts free of coupling to concrete feature/app implementations.
- Keep module-specific logic and contracts scoped to their own dimension/folder (`README.md` + `TASK.md`) instead of crossing boundaries.
- Use explicit entry points and exports rather than deep internal coupling.
- Respect read-only zones (`docs/`, `.archieves/`) and ephemeral automation zones (`.temp/`).

## State & Lifecycle

- Keep data, state transitions, and rendering/output separable and traceable.
- Respect mount/init, update, and teardown/cleanup lifecycles without hidden global mutations.

## Change Strategy

Prefer small, reversible changes. Verify existing behavior before restructuring.
