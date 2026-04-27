# SPEC.md

## Purpose

`geofence-watcher` detects when tracked entities move into or out of configured geofences and runs actions in response.

## Problem Statement

The project needs a small command-line tool that:

- stores tracked entities, locations, geofences, rules, and actions locally
- fetches the latest position for each tracked entity
- evaluates geofence transitions
- runs actions when a rule matches

## Goals

- Provide a CLI for managing all domain data.
- Support one tracked entity source type initially: `beacon`.
- Support one geofence shape initially: `circle`.
- Support one action type initially: `shell`.
- Detect `enter` and `exit` transitions reliably.
- Persist data locally so the tool can be run by cron or `launchd`.

## Non-Goals

- No web UI.
- No multi-user or remote backend support.
- No spatial shapes other than circles.
- No action types other than shell commands.
- No tracked entity sources other than Beacon for now.

## Domain Model

### Tracked Entity

- `id`: Unique tracked entity identifier.
- `name`: Human-readable name.
- `type`: Source type. Currently `beacon`.
- `value`: Type-specific configuration.

For `type: beacon`:

- `value.apiSecret`: Beacon server API secret.
- `value.apiUrl`: Beacon server API URL.
- `value.id`: Beacon server id used to fetch the latest location.

### Tracked Entity State

- `id`: Unique tracked entity state identifier. Same as `trackedEntityId`.
- `trackedEntityId`: Tracked entity id this state belongs to.
- `coordinates.latitude`: Last observed latitude.
- `coordinates.longitude`: Last observed longitude.
- `observedAt`: ISO 8601 timestamp from the source.
- `updatedAt`: ISO 8601 timestamp when `geofence-watcher` saved the state.

### Action

- `id`: Unique action identifier.
- `type`: Action type. Currently `shell`.
- `value`: Type-specific configuration.

For `type: shell`:

- `value.command`: Shell command to run.

### Location

- `id`: Unique location identifier.
- `name`: Human-readable name.
- `coordinates.latitude`: Latitude.
- `coordinates.longitude`: Longitude.

### Geofence

- `id`: Unique geofence identifier.
- `name`: Human-readable name.
- `type`: Geofence shape type. Currently `circle`.
- `value`: Type-specific configuration.

For `type: circle`:

- `value.centerLocationId`: Location id used as the center point.
- `value.radiusMeters`: Circle radius in meters.

### Geofence Rule

- `geofenceId`: Geofence id.
- `actionId`: Action id to run.
- `trigger.eventType`: Transition type. Allowed values: `enter`, `exit`.

## CLI Requirements

The tool must expose these command groups:

- `tracked-entities`
- `tracked-entity-states`
- `locations`
- `geofences`
- `rules`
- `actions`
- `watch`
- `install-cron`

### Tracked Entities

- List tracked entities.
- Add a Beacon-backed tracked entity.
- Delete a tracked entity.

### Tracked Entity States

- List stored tracked entity states.

### Actions

- List actions.
- Add a shell action.
- Run a saved action.
- Delete an action.

### Locations

- List locations.
- Add a location.
- Delete a location.

### Geofences

- List geofences.
- Add a circle geofence.
- Delete a geofence.

### Rules

- List rules.
- Add a geofence rule.
- Delete a geofence rule.

### Runtime

- `watch` must fetch the latest tracked entity locations, evaluate rules, execute matching actions, and persist the new state.
- `install-cron` must install a scheduled job that runs `watch` on the requested interval.

## Behavioral Requirements

- A rule only evaluates when tracked entity coordinates change.
- `enter` should fire when a tracked entity moves from outside a geofence to inside it.
- `exit` should fire when a tracked entity moves from inside a geofence to outside it.
- Missing geofences or missing center locations are runtime errors.
- Unsupported geofence types are runtime errors.
- Unsupported tracked entity types are runtime errors.

## Persistence Requirements

- Data is stored locally as JSON collections.
- The default data directory is under `XDG_DATA_HOME/geofence-watcher/.data`.
- If `XDG_DATA_HOME` is unset, the tool should fall back to the user home directory data location.

## Acceptance Criteria

- A user can manage all domain objects from the CLI.
- A `watch` run processes every stored tracked entity.
- Matching rules trigger the correct actions.
- Hysteresis prevents rapid boundary flapping from repeatedly firing rules.
- The tool works with local persisted data only.

## Debug Logging Addendum

This task adds a small debug logger to the CLI.

### Problem Statement

The CLI needs diagnostic logging that is silent by default and only appears when the user passes `--debug`.

### Goals

- Add a reusable logger for diagnostic messages.
- Keep normal command output unchanged.
- Emit debug logs only when `--debug` is present.
- Ensure debug output does not corrupt JSON written to `stdout`.

### Scope

- Parse `--debug` as a global CLI flag.
- Add a logger helper that writes debug messages to `stderr`.
- Add debug logs to the watch/runtime path where they help explain progress.
- Mention `--debug` in help text.

### Non-Goals

- No file-based logging.
- No log rotation or persistence.
- No full logging framework.

### Acceptance Criteria

- Running any command without `--debug` produces no debug logs.
- Running with `--debug` prints diagnostic logs.
- JSON output remains on `stdout` and stays valid.
- The logger is reusable by multiple runtime modules.
