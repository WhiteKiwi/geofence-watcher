import assert from "node:assert/strict";
import { test } from "node:test";

import { diffTrackedEntityState } from "./diff-tracked-entity-state.js";
import type { TrackedEntityState } from "../domain/index.js";

test("diffTrackedEntityState detects coordinate and timestamp changes", () => {
  const previousState: TrackedEntityState = {
    id: "entity-1",
    trackedEntityId: "entity-1",
    coordinates: {
      latitude: 37,
      longitude: 127,
    },
    observedAt: "2026-04-26T00:00:00.000Z",
    updatedAt: "2026-04-26T00:00:00.000Z",
  };
  const nextState: TrackedEntityState = {
    ...previousState,
    coordinates: {
      latitude: 37.001,
      longitude: 127,
    },
    observedAt: "2026-04-26T00:05:00.000Z",
    updatedAt: "2026-04-26T00:05:00.000Z",
  };

  const diff = diffTrackedEntityState(previousState, nextState);

  assert.equal(diff.previousState, previousState);
  assert.equal(diff.nextState, nextState);
  assert.equal(diff.coordinatesChanged, true);
  assert.equal(diff.observedAtChanged, true);
  assert.equal(diff.hasLocationChange, true);
});
