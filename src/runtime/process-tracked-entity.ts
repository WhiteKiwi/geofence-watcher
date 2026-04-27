import type { TrackedEntity, TrackedEntityState } from "../domain/index.js";
import type { BeaconLatestLocation } from "../adapters/index.js";
import { debug } from "../cli/logger.js";
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
  debug("process-tracked-entity: fetching latest location", {
    trackedEntityId: trackedEntity.id,
    previousState,
  });
  const fetchLatestLocation = selectTrackedEntityAdapter(trackedEntity);
  const latestLocation = await fetchLatestLocation();
  debug("process-tracked-entity: fetched latest location", {
    trackedEntityId: trackedEntity.id,
    latestLocation,
  });
  const nextState = buildTrackedEntityState(
    trackedEntity.id,
    latestLocation,
    now(),
  );
  const stateDiff = diffTrackedEntityState(previousState, nextState);
  debug("process-tracked-entity: computed state diff", {
    trackedEntityId: trackedEntity.id,
    stateDiff,
    previousState,
    nextState,
  });

  return {
    trackedEntityId: trackedEntity.id,
    previousState,
    latestLocation,
    nextState,
    stateDiff,
  };
}
