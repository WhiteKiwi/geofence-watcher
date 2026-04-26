import type { TrackedEntity, TrackedEntityState } from "../domain/index.js";
import type { BeaconLatestLocation } from "../adapters/index.js";
import { buildTrackedEntityState } from "./build-tracked-entity-state.js";
import { diffTrackedEntityState, type TrackedEntityStateDiff } from "./diff-tracked-entity-state.js";
import { selectTrackedEntityAdapter } from "./select-tracked-entity-adapter.js";

export type ProcessTrackedEntityResult = {
  trackedEntityId: string;
  previousState: TrackedEntityState | undefined;
  latestLocation: BeaconLatestLocation;
  nextState: TrackedEntityState;
  stateDiff: TrackedEntityStateDiff;
};

export async function processTrackedEntity(
  trackedEntity: TrackedEntity,
  previousState: TrackedEntityState | undefined,
  now: () => string,
): Promise<ProcessTrackedEntityResult> {
  const fetchLatestLocation = selectTrackedEntityAdapter(trackedEntity);
  const latestLocation = await fetchLatestLocation();
  const nextState = buildTrackedEntityState(
    trackedEntity.id,
    latestLocation,
    now(),
  );
  const stateDiff = diffTrackedEntityState(previousState, nextState);

  return {
    trackedEntityId: trackedEntity.id,
    previousState,
    latestLocation,
    nextState,
    stateDiff,
  };
}
