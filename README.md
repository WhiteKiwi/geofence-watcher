# geofence-watcher

## Role

`geofence-watcher` detects when the current location moves away from or approaches configured points.

## Example Use Cases

- Turn on the air conditioner when approaching home.

## Domain Model

### Tracked Entity

- `id`: Unique tracked entity identifier.
- `name`: Human-readable tracked entity name.
- `type`: Tracked entity source type. Initially supports `beacon`.
- `value`: Type-specific tracked entity configuration.

For `type: beacon`:

- `value.apiKey`: Beacon server API key.
- `value.apiUrl`: Beacon server API URL.
- `value.id`: Beacon server id used to query the current location.
- Requests the current location with `GET {API_URL}` and `Authorization: Bearer {API_KEY}`.

### Tracked Entity State

- `id`: Unique tracked entity state identifier. Same value as `trackedEntityId`.
- `trackedEntityId`: Tracked entity id this state belongs to.
- `coordinates.latitude`: Last observed latitude.
- `coordinates.longitude`: Last observed longitude.
- `observedAt`: ISO 8601 timestamp when the source observed the location.
- `updatedAt`: ISO 8601 timestamp when `geofence-watcher` saved the state.

### Action

- `id`: Unique action identifier.
- `type`: Action type. Initially supports `shell`.
- `value`: Type-specific action configuration.

For `type: shell`:

- `value.command`: Shell command to run.

### Location

- `id`: Unique location identifier.
- `name`: Human-readable location name.
- `coordinates.latitude`: Latitude.
- `coordinates.longitude`: Longitude.

### Geofence

- `id`: Unique geofence identifier.
- `name`: Human-readable geofence name.
- `type`: Geofence shape type. Initially supports `circle`.
- `value`: Type-specific geofence configuration.

For `type: circle`:

- `value.centerLocationId`: Location id used as the center point.
- `value.radiusMeters`: Circle radius in meters.

### Geofence Rule

- `geofenceId`: Managed geofence id.
- `actionId`: Action id to execute when the rule fires.
- `trigger`: Event trigger configuration.
- `trigger.eventType`: Geofence transition to detect. Allowed values are `enter` and `exit`.
- `trigger.hysteresisMeters`: Additional distance buffer to prevent frequent enter/exit events near the boundary.

## CLI

The CLI is exposed through package scripts and should support subcommands through `pnpm`.

### Tracked Entity Commands

- `geofence-watcher tracked-entities list`: List saved tracked entities.
- `geofence-watcher tracked-entities add-beacon --id <id> --name <name> --api-url <apiUrl> --api-key <apiKey> --beacon-id <beaconId>`: Add a Beacon-backed tracked entity.
- `geofence-watcher tracked-entities delete <id>`: Delete a tracked entity.

### Tracked Entity State Commands

- `geofence-watcher tracked-entity-states list`: List saved tracked entity states.

### Action Commands

- `geofence-watcher actions list`: List saved actions.
- `geofence-watcher actions add-shell --id <id> --command <command>`: Add a shell action.
- `geofence-watcher actions run <id>`: Run a saved action by id.
- `geofence-watcher actions delete <id>`: Delete an action.

### Location Commands

- `geofence-watcher locations list`: List saved locations.
- `geofence-watcher locations add --id <id> --name <name> --latitude <latitude> --longitude <longitude>`: Add a location.
- `geofence-watcher locations delete <id>`: Delete a location.

### Geofence Commands

- `geofence-watcher geofences list`: List saved geofences.
- `geofence-watcher geofences add-circle --id <id> --name <name> --center-location-id <locationId> --radius-meters <meters>`: Add a circular geofence.
- `geofence-watcher geofences delete <id>`: Delete a geofence.

### Rule Commands

- `geofence-watcher rules list`: List saved geofence rules.
- `geofence-watcher rules add --geofence-id <geofenceId> --action-id <actionId> --event-type <enter|exit> --hysteresis-meters <meters>`: Add a geofence rule.
- `geofence-watcher rules delete <id>`: Delete a geofence rule.

### Runtime Commands

- `geofence-watcher watch`: Fetch tracked entity locations, save tracked entity state, evaluate geofence rules, run matched actions, and update runtime state.
- `geofence-watcher install-cron --every 5m`: Install a macOS `launchd` job that writes a plist under `~/Library/LaunchAgents`, resolves the `geofence-watcher` executable path at install time, and runs `geofence-watcher watch` on the requested interval.
