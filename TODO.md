# geofence-watcher watch TODO

## 1. Runtime data loading

- [x] Load tracked entities.
- [x] Load tracked entity states.
- [x] Load locations.
- [x] Load geofences.
- [x] Load rules.
- [x] Pass the loaded runtime data through the watch pipeline.

## 2. Per-entity processing

- [x] Select the adapter for each tracked entity type.
- [x] Fetch the latest location from the adapter.
- [x] Keep processing the next tracked entity if one fetch fails.
- [x] Build the next tracked entity state from the fetched location.
- [x] Compare previous and next state with a dedicated diff object.

## 3. Rule evaluation

- [x] Derive enter/exit transitions from the state diff.
- [x] Match transitions against relevant geofence rules.
- [x] Resolve geofences by location and radius.
- [x] Apply hysteresis when deciding whether a rule fires.
- [x] Attach an action id to each geofence rule.

## 4. Action execution

- [x] Map matched rules to configured actions.
- [x] Execute shell actions for each match.
- [x] Capture action success and failure in the watch result.
- [x] Keep action failures isolated to the current entity when possible.

## 5. State persistence

- [x] Upsert tracked entity state after processing.
- [x] Use the tracked entity id as the state id.
- [x] Persist the updated `observedAt` and `updatedAt` values.

## 6. Result shape

- [x] Expand `WatchResult` to include success and failure details.
- [x] Include per-entity state diffs in the final output.
- [x] Include matched rules and executed actions in the final output.

## 7. Tests

- [x] Add diff unit tests.
- [x] Add watch continuation tests for adapter failure.
- [ ] Add state upsert tests.
- [ ] Add rule matching tests.
- [ ] Add action execution tests.

## 8. Cleanup

- [ ] Remove any temporary debug output.
- [ ] Update docs if the runtime behavior changes.
