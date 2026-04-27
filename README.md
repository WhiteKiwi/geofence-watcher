# geofence-watcher

`geofence-watcher` is a command-line tool that watches tracked locations, evaluates geofence rules, and runs actions when a transition occurs.

## What It Does

- Stores tracked entities, states, locations, geofences, rules, and actions locally.
- Supports Beacon as the initial tracked entity source.
- Supports circular geofences and shell actions.
- Evaluates `enter` and `exit` transitions with hysteresis to reduce boundary chatter.

## Quick Start

- Install dependencies: `pnpm install`
- Run in development: `pnpm dev`
- Build: `pnpm build`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`

## Command Groups

- `tracked-entities`
- `tracked-entity-states`
- `locations`
- `geofences`
- `rules`
- `actions`
- `watch`
- `install-cron`

## Documentation

- Requirements and domain model: [SPEC.md](/Users/whitekiwi/workspaces/geofence-watcher/SPEC.md)
- Implementation plan and runtime flow: [IMPLEMENTATION.md](/Users/whitekiwi/workspaces/geofence-watcher/IMPLEMENTATION.md)
