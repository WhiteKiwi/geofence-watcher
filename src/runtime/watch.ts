import type { DomainStorage } from "../storage/index.js";
import { processTrackedEntity, type ProcessTrackedEntityResult } from "./process-tracked-entity.js";
import {
  evaluateGeofenceRules,
  selectActionsToExecute,
  type GeofenceRuleMatch,
} from "./evaluate-geofence-rules.js";
import { executeShellAction, type ExecuteShellActionResult } from "./execute-shell-action.js";

export type WatchEntityResult =
  | {
      trackedEntityId: string;
      status: "ok";
      stateSaved: boolean;
      stateDiff: ProcessTrackedEntityResult["stateDiff"];
      matchedRules: GeofenceRuleMatch[];
      executedActions: ExecuteShellActionResult[];
    }
  | {
      trackedEntityId: string;
      status: "error";
      stateSaved: false;
      error: string;
    };

export type WatchResult = {
  processedTrackedEntities: WatchEntityResult[];
};

export async function runWatch(storage: DomainStorage): Promise<WatchResult> {
  const [trackedEntities, trackedEntityStates, locations, geofences, rules, actions] = await Promise.all([
    storage.trackedEntities.list(),
    storage.trackedEntityStates.list(),
    storage.locations.list(),
    storage.geofences.list(),
    storage.rules.list(),
    storage.actions.list(),
  ]);

  const trackedEntityStatesById = new Map(
    trackedEntityStates.map((trackedEntityState) => [trackedEntityState.id, trackedEntityState]),
  );
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  const geofencesById = new Map(geofences.map((geofence) => [geofence.id, geofence]));
  const result: WatchEntityResult[] = [];

  for (const trackedEntity of trackedEntities) {
    try {
      const trackedEntityResult = await processTrackedEntity(
        trackedEntity,
        trackedEntityStatesById.get(trackedEntity.id),
        () => new Date().toISOString(),
      );
      const evaluation = evaluateGeofenceRules(
        trackedEntityResult.previousState,
        trackedEntityResult.nextState.coordinates,
        trackedEntityResult.stateDiff,
        locationsById,
        geofencesById,
        rules,
      );
      const actionsToExecute = selectActionsToExecute(
        actions,
        evaluation.matchedRules,
      );
      const executedActions: ExecuteShellActionResult[] = [];

      for (const action of actionsToExecute) {
        if (action.type !== "shell") {
          continue;
        }

        executedActions.push(await executeShellAction(action));
      }

      await storage.trackedEntityStates.upsert(trackedEntityResult.nextState);

      result.push({
        trackedEntityId: trackedEntityResult.trackedEntityId,
        status: "ok",
        stateSaved: true,
        stateDiff: trackedEntityResult.stateDiff,
        matchedRules: evaluation.matchedRules,
        executedActions,
      });
    } catch (error) {
      result.push({
        trackedEntityId: trackedEntity.id,
        status: "error",
        stateSaved: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return {
    processedTrackedEntities: result,
  };
}
