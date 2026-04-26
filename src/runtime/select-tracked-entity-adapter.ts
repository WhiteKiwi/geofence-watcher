import type { BeaconLatestLocation } from "../adapters/index.js";
import type { TrackedEntity } from "../domain/index.js";
import { fetchLatestBeaconLocation } from "../adapters/index.js";

export type TrackedEntityAdapterResult = Promise<BeaconLatestLocation>;

export function selectTrackedEntityAdapter(
  trackedEntity: TrackedEntity,
): () => TrackedEntityAdapterResult {
  switch (trackedEntity.type) {
    case "beacon":
      return async () => fetchLatestBeaconLocation(trackedEntity.value);
    default:
      throw new Error(`Unsupported tracked entity type: ${(trackedEntity as { type: string }).type}`);
  }
}
