import type { DomainStorage } from "../storage/index.js";
import { processTrackedEntity, type ProcessTrackedEntityResult } from "./process-tracked-entity.js";
import {
  evaluateGeofenceRules,
  selectActionsToExecute,
  type GeofenceRuleMatch,
} from "./evaluate-geofence-rules.js";
import { executeShellAction, type ExecuteShellActionResult } from "./execute-shell-action.js";
import { debug } from "../cli/logger.js";

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
  const watchStartedAt = new Date().toISOString();
  debug("watch: started", {
    watchStartedAt,
  });
  const [trackedEntities, trackedEntityStates, locations, geofences, rules, actions] = await Promise.all([
    storage.trackedEntities.list(),
    storage.trackedEntityStates.list(),
    storage.locations.list(),
    storage.geofences.list(),
    storage.rules.list(),
    storage.actions.list(),
  ]);
  debug("watch: loaded collections", {
    trackedEntities: trackedEntities.length,
    trackedEntityStates: trackedEntityStates.length,
    locations: locations.length,
    geofences: geofences.length,
    rules: rules.length,
    actions: actions.length,
  });

  const trackedEntityStatesById = new Map(
    trackedEntityStates.map((trackedEntityState) => [trackedEntityState.id, trackedEntityState]),
  );
  const locationsById = new Map(locations.map((location) => [location.id, location]));
  const geofencesById = new Map(geofences.map((geofence) => [geofence.id, geofence]));
  const result: WatchEntityResult[] = [];

  for (const trackedEntity of trackedEntities) {
    try {
      debug("watch: processing tracked entity", {
        trackedEntityId: trackedEntity.id,
      });
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
      debug("watch: selected actions", {
        trackedEntityId: trackedEntity.id,
        matchedRules: evaluation.matchedRules,
        selectedActions: actionsToExecute.map((action) => action.id),
      });
      const executedActions: ExecuteShellActionResult[] = [];

      for (const action of actionsToExecute) {
        if (action.type !== "shell") {
          continue;
        }

        const executedAction = await executeShellAction(action);
        debug("watch: action execution result", {
          trackedEntityId: trackedEntity.id,
          actionId: action.id,
          result: executedAction,
        });
        executedActions.push(executedAction);
      }

      debug("watch: saving tracked entity state", {
        trackedEntityId: trackedEntityResult.trackedEntityId,
        previousState: trackedEntityResult.previousState,
        nextState: trackedEntityResult.nextState,
        stateDiff: trackedEntityResult.stateDiff,
      });
      await storage.trackedEntityStates.upsert(trackedEntityResult.nextState);

      result.push({
        trackedEntityId: trackedEntityResult.trackedEntityId,
        status: "ok",
        stateSaved: true,
        stateDiff: trackedEntityResult.stateDiff,
        matchedRules: evaluation.matchedRules,
        executedActions,
      });
      debug("watch: processed tracked entity successfully", {
        trackedEntityId: trackedEntity.id,
      });
    } catch (error) {
      debug("watch: processed tracked entity with error", {
        trackedEntityId: trackedEntity.id,
        error: error instanceof Error ? error.message : String(error),
      });
      result.push({
        trackedEntityId: trackedEntity.id,
        status: "error",
        stateSaved: false,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  debug("watch: finished", {
    watchStartedAt,
    processedTrackedEntities: result.length,
  });

  return {
    processedTrackedEntities: result,
  };
}
