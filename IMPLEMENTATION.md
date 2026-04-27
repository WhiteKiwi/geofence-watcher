# IMPLEMENTATION.md

## Overview

The implementation is split into three layers:

- CLI parsing and command handling
- domain storage and validation
- runtime processing for watch/evaluation/action execution

## Current Architecture

### CLI

- `src/cli/main.ts` is the entry point.
- `src/cli/parser.ts` parses top-level commands and options.
- `src/cli/commands/*.ts` handles each command group.
- `src/cli/commands/help.ts` prints usage text.

### Domain

- `src/domain/*.ts` defines Zod-backed domain schemas and TypeScript types.
- Domain objects are kept small and serializable.

### Storage

- `src/storage/domain-storage.ts` wires collections together.
- `src/storage/json-file-collection.ts` handles JSON persistence for each entity type.
- Collections are stored in a local data directory determined by `XDG_DATA_HOME` or `~/.local/share`.

### Runtime

- `src/runtime/watch.ts` orchestrates the full watch pass.
- `src/runtime/process-tracked-entity.ts` fetches the latest location for one tracked entity and builds the new state.
- `src/runtime/build-tracked-entity-state.ts` converts the latest location into persisted state.
- `src/runtime/diff-tracked-entity-state.ts` compares old and new state.
- `src/runtime/evaluate-geofence-rules.ts` evaluates geofence transitions.
- `src/runtime/execute-shell-action.ts` runs shell actions.

## Execution Flow

1. Load all tracked entities, states, locations, geofences, rules, and actions.
2. For each tracked entity:
   - fetch the latest location from the configured adapter
   - build the next tracked entity state
   - diff it against the previous state
   - evaluate geofence rules
   - select matching actions
   - execute matching shell actions
   - persist the new tracked entity state
3. Return per-entity success or error results.

## Rule Evaluation

- Rules are evaluated only when coordinates change.
- Circle geofences resolve their center from `centerLocationId`.
- Distances are computed in meters.
- `enter`: previous distance must be greater than `radius`, current distance must be less than or equal to `radius`
- `exit`: previous distance must be less than or equal to `radius`, current distance must be greater than `radius`

## Data Layout

The default files are:

- `tracked-entities.json`
- `tracked-entity-states.json`
- `actions.json`
- `locations.json`
- `geofences.json`
- `rules.json`

They are created under the local data directory and loaded on each run.

## Error Handling

- Missing geofence references throw errors during evaluation.
- Missing center locations throw errors during evaluation.
- Adapter failures are reported per tracked entity and do not stop the rest of the watch pass.
- Runtime command failures should surface a human-readable error message and set a non-zero exit code in the CLI entry point.

## Verification

Use the standard project checks:

- `pnpm lint`
- `pnpm typecheck`
- `pnpm build`

For runtime behavior, add or update focused tests under `src/runtime/*.test.ts` and `src/cli/*.test.ts` when behavior changes.

## Debug Logging Plan

The debug logger work is implemented as a small CLI/runtime add-on.

### Technical Approach

- Parse `--debug` as a boolean flag in `src/cli/parser.ts`.
- Set a shared debug state once in `src/cli/main.ts`.
- Add `src/cli/logger.ts` with `setDebugEnabled()` and `debug()`.
- Make `debug()` write only to `stderr`.
- Add log calls in `src/runtime/watch.ts`, `src/runtime/process-tracked-entity.ts`, and `src/runtime/execute-shell-action.ts`.
- Keep normal JSON output on `stdout` untouched.

### File-Level Changes

- `src/cli/parser.ts`
  - Recognize `--debug` as a flag instead of a key-value option.
- `src/cli/helpers.ts`
  - Treat boolean options correctly when validating required string options.
- `src/cli/main.ts`
  - Enable or disable debug logging before command dispatch.
- `src/cli/logger.ts`
  - Provide a minimal debug logger.
- `src/cli/commands/help.ts`
  - Document `--debug` in usage text.
- `src/runtime/watch.ts`
  - Log collection loading, per-entity processing, rule matches, and persistence.
- `src/runtime/process-tracked-entity.ts`
  - Log adapter fetch lifecycle.
- `src/runtime/execute-shell-action.ts`
  - Log shell command execution before spawn.
- Tests
  - Add parser coverage for `--debug`.
  - Add logger coverage for enabled vs disabled behavior.
  - Add runtime coverage proving debug logs are silent unless enabled.

### Debug Log Coverage

When `--debug` is enabled, emit logs for the following milestones:

- CLI startup:
  - When the CLI starts handling a command.
  - Whether debug logging is enabled.
  - Which top-level command is being dispatched.
- Watch run:
  - When `watch` starts and finishes.
  - How many tracked entities, states, locations, geofences, rules, and actions were loaded.
  - Which tracked entity is being processed.
  - Whether processing succeeded or failed for each tracked entity.
  - How the tracked entity state changed, including previous and next state summaries.
  - How many rules matched for that tracked entity.
  - Which rule conditions were evaluated and whether each one triggered.
  - How many actions were selected for execution.
  - Which shell action is about to run.
  - Whether each triggered action succeeded or failed.
  - When tracked entity state is being saved.
- Tracked entity processing:
  - When the latest location fetch starts.
  - When the latest location fetch completes.
- Shell action execution:
  - Which shell is being spawned.
  - Which action id is being executed.
  - The shell action result, including success, exit code, and error if present.
  - Shell command output is not captured into the logger; it continues to flow through the spawned process stdio.

### Verification

- Confirm `pnpm typecheck` passes.
- Confirm `pnpm build` passes.
- Confirm debug logs appear only when `--debug` is present.
- Confirm stdout JSON remains unchanged when debug logging is enabled.
