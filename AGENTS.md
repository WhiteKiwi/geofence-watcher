# AGENTS.md

## Working Rule

- Before starting any implementation work, always write `SPEC.md` and `IMPLEMENTATION.md` first.
- Do not begin coding until both documents exist and are aligned.

## Document Roles

### `SPEC.md`

- Captures the problem statement, goals, scope, constraints, and acceptance criteria.
- Answers "what are we building?" and "how do we know it is correct?"
- Should be written before implementation decisions so the work stays tied to requirements.

### `IMPLEMENTATION.md`

- Captures the concrete technical approach, file-level plan, data flow, and verification steps.
- Answers "how will we build it?" and "what will change?"
- Should translate the spec into an actionable plan before code changes begin.

## Operating Principle

- Treat `SPEC.md` as the source of truth for intent.
- Treat `IMPLEMENTATION.md` as the source of truth for execution.
- If the implementation changes materially, update both documents before continuing.
