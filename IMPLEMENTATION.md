# geofence-watcher implementation

## Data Storage

Domain data is stored as JSON files under `$XDG_DATA_HOME/geofence-watcher/.data`.
If `XDG_DATA_HOME` is not set, use `~/.local/share/geofence-watcher/.data`.

### Domain Data Files

- `Tracked Entity`: `.data/tracked-entities.json`
- `Tracked Entity State`: `.data/tracked-entity-states.json`
- `Action`: `.data/actions.json`
- `Location`: `.data/locations.json`
- `Geofence`: `.data/geofences.json`
- `Geofence Rule`: `.data/rules.json`

`Tracked Entity State` is runtime state, not user-authored configuration. `watch`
updates one state record per tracked entity after fetching the latest source
location, using the tracked entity id as the state id.

## Watch Flow

`watch` processes tracked entities one by one. For each tracked entity, it
loads the previous tracked entity state, fetches the latest location from the
source adapter, evaluates geofence rules using the diff between previous and
current state, runs the action attached to each matched rule, and then persists
the new tracked entity state.

```text
watch
  |
  v
load domain data
  |-- tracked entities
  |-- tracked entity states
  |-- locations
  |-- geofences
  |-- rules
  |-- actions
  |
  v
for each tracked entity
  |
  +--> select adapter by type
  |
  +--> load previous tracked entity state
  |
  +--> fetch latest source location
  |
  +--> compare previous state with latest location
  |
  +--> evaluate related geofence rules
  |
  +--> run actions attached to matched rules
  |
  +--> upsert tracked entity state
  |
  v
collect per-entity results
  |
  v
print runtime result
```

Expected behavior:

- `watch` should continue to the next tracked entity when one adapter fetch
  fails.
- `watch` should evaluate enter/exit transitions from the difference between
  the previous tracked entity state and the latest fetched location.
- `Geofence Rule` should carry the `actionId` of the action to run when the
  rule fires.
- `Tracked Entity State` is updated with one record per tracked entity, using
  the tracked entity id as the state id.
- Action execution and rule evaluation are runtime concerns, while tracked
  entities, locations, geofences, and rules remain user-authored configuration.

## Scheduled Execution

`install-cron` installs a macOS `launchd` job by generating a plist under
`~/Library/LaunchAgents` and registering it so `geofence-watcher watch` runs
every 5 minutes. The command path is resolved at install time and written into
the plist as an absolute executable path so `launchd` does not depend on shell
alias or PATH lookup behavior. Standard output and standard error are discarded
to `/dev/null`.
