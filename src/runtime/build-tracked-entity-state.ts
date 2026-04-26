import type {
  TrackedEntityState,
} from "../domain/index.js";
import type { BeaconLatestLocation } from "../adapters/index.js";

export function buildTrackedEntityState(
  trackedEntityId: string,
  latestLocation: BeaconLatestLocation,
  updatedAt: string,
): TrackedEntityState {
  return {
    id: trackedEntityId,
    trackedEntityId,
    coordinates: latestLocation.coordinates,
    observedAt: latestLocation.observedAt,
    updatedAt,
  };
}
