import type {
  Action,
  Coordinates,
  Geofence,
  GeofenceRule,
  Location,
  TrackedEntityState,
} from "../domain/index.js";
import { debug } from "../cli/logger.js";
import { distanceMeters } from "./distance.js";
import type { TrackedEntityStateDiff } from "./diff-tracked-entity-state.js";

export type GeofenceRuleMatch = {
  ruleId: string;
  geofenceId: string;
  actionId: string;
  eventType: GeofenceRule["trigger"]["eventType"];
  triggered: boolean;
  previousDistanceMeters: number | null;
  currentDistanceMeters: number;
};

export type EvaluateGeofenceRulesResult = {
  matchedRules: GeofenceRuleMatch[];
};

export function evaluateGeofenceRules(
  previousState: TrackedEntityState | undefined,
  nextStateCoordinates: Coordinates,
  stateDiff: TrackedEntityStateDiff,
  locationsById: Map<string, Location>,
  geofencesById: Map<string, Geofence>,
  rules: GeofenceRule[],
): EvaluateGeofenceRulesResult {
  if (previousState === undefined || !stateDiff.coordinatesChanged) {
    debug("evaluate-geofence-rules: skipped", {
      reason: previousState === undefined ? "missing-previous-state" : "coordinates-unchanged",
    });
    return {
      matchedRules: [],
    };
  }

  const matchedRules: GeofenceRuleMatch[] = [];

  for (const rule of rules) {
    const geofence = geofencesById.get(rule.geofenceId);

    if (geofence === undefined) {
      throw new Error(`Missing geofence: ${rule.geofenceId}`);
    }

    switch (geofence.type) {
      case "circle": {
        const centerLocation = locationsById.get(geofence.value.centerLocationId);

        if (centerLocation === undefined) {
          throw new Error(`Missing center location: ${geofence.value.centerLocationId}`);
        }

        const previousDistanceMeters = distanceMeters(
          previousState.coordinates,
          centerLocation.coordinates,
        );
        const currentDistanceMeters = distanceMeters(
          nextStateCoordinates,
          centerLocation.coordinates,
        );
        const triggered = isRuleTriggered(
          rule.trigger.eventType,
          previousDistanceMeters,
          currentDistanceMeters,
          geofence.value.radiusMeters,
        );
        debug("evaluate-geofence-rules: evaluated rule", {
          ruleId: rule.id,
          geofenceId: rule.geofenceId,
          actionId: rule.actionId,
          eventType: rule.trigger.eventType,
          previousDistanceMeters,
          currentDistanceMeters,
          radiusMeters: geofence.value.radiusMeters,
          triggered,
        });

        if (triggered) {
          matchedRules.push({
            ruleId: rule.id,
            geofenceId: rule.geofenceId,
            actionId: rule.actionId,
            eventType: rule.trigger.eventType,
            triggered,
            previousDistanceMeters,
            currentDistanceMeters,
          });
        }
        break;
      }
      default:
        throw new Error(`Unsupported geofence type: ${(geofence as { type: string }).type}`);
    }
  }

  debug("evaluate-geofence-rules: matched rules", {
    matchedRules,
  });

  return {
    matchedRules,
  };
}

export function selectActionsToExecute(
  actions: Action[],
  matchedRules: GeofenceRuleMatch[],
): Action[] {
  if (matchedRules.length === 0) {
    return [];
  }

  const matchedActionIds = new Set(matchedRules.map((rule) => rule.actionId));

  return actions.filter((action) => matchedActionIds.has(action.id));
}

function isRuleTriggered(
  eventType: GeofenceRule["trigger"]["eventType"],
  previousDistanceMeters: number,
  currentDistanceMeters: number,
  radiusMeters: number,
): boolean {
  switch (eventType) {
    case "enter":
      return previousDistanceMeters > radiusMeters && currentDistanceMeters <= radiusMeters;
    case "exit":
      return previousDistanceMeters <= radiusMeters && currentDistanceMeters > radiusMeters;
    default:
      return false;
  }
}
