import type { TrackedEntityState } from "../domain/index.js";

export type TrackedEntityStateDiff = {
  previousState: TrackedEntityState | undefined;
  nextState: TrackedEntityState;
  hasLocationChange: boolean;
  coordinatesChanged: boolean;
  observedAtChanged: boolean;
};

export function diffTrackedEntityState(
  previousState: TrackedEntityState | undefined,
  nextState: TrackedEntityState,
): TrackedEntityStateDiff {
  const coordinatesChanged =
    previousState?.coordinates.latitude !== nextState.coordinates.latitude ||
    previousState?.coordinates.longitude !== nextState.coordinates.longitude;
  const observedAtChanged = previousState?.observedAt !== nextState.observedAt;

  return {
    previousState,
    nextState,
    hasLocationChange: previousState === undefined || coordinatesChanged || observedAtChanged,
    coordinatesChanged,
    observedAtChanged,
  };
}
