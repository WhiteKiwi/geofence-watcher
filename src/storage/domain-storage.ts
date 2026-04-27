import { homedir } from "node:os";
import { join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import type {
  Action,
  Geofence,
  GeofenceRule,
  Location,
  TrackedEntityState,
  TrackedEntity,
} from "../domain/index.js";
import { migrateBeaconTrackedEntity } from "../domain/tracked-entity.js";
import { JsonFileCollection } from "./json-file-collection.js";

export type DomainStorage = {
  trackedEntities: JsonFileCollection<TrackedEntity>;
  trackedEntityStates: JsonFileCollection<TrackedEntityState>;
  actions: JsonFileCollection<Action>;
  locations: JsonFileCollection<Location>;
  geofences: JsonFileCollection<Geofence>;
  rules: JsonFileCollection<GeofenceRule>;
};

export type DomainStorageOptions = {
  dataDirectoryUrl?: URL;
};

const defaultDataDirectoryUrl = buildDefaultDataDirectoryUrl();

export function createDomainStorage(
  options: DomainStorageOptions = {},
): DomainStorage {
  const dataDirectoryUrl = options.dataDirectoryUrl ?? defaultDataDirectoryUrl;

  return {
    trackedEntities: createCollection<TrackedEntity>(
      dataDirectoryUrl,
      "tracked-entities.json",
      { normalize: normalizeTrackedEntities },
    ),
    trackedEntityStates: createCollection<TrackedEntityState>(
      dataDirectoryUrl,
      "tracked-entity-states.json",
    ),
    actions: createCollection<Action>(dataDirectoryUrl, "actions.json"),
    locations: createCollection<Location>(dataDirectoryUrl, "locations.json"),
    geofences: createCollection<Geofence>(dataDirectoryUrl, "geofences.json"),
    rules: createCollection<GeofenceRule>(dataDirectoryUrl, "rules.json"),
  };
}

function createCollection<T extends { id: string }>(
  dataDirectoryUrl: URL,
  fileName: string,
  options: {
    normalize?: (items: unknown[]) => { items: T[]; changed: boolean };
  } = {},
): JsonFileCollection<T> {
  return new JsonFileCollection<T>(fileURLToPath(new URL(fileName, dataDirectoryUrl)), options);
}

function buildDefaultDataDirectoryUrl(): URL {
  const xdgDataHome = process.env.XDG_DATA_HOME ?? `${homedir()}/.local/share`;
  const dataDirectoryPath = join(xdgDataHome, "geofence-watcher", ".data");

  return pathToFileURL(`${dataDirectoryPath}/`);
}

function normalizeTrackedEntities(
  items: unknown[],
): { items: TrackedEntity[]; changed: boolean } {
  let changed = false;
  const nextItems = items.map((item) => {
    if (hasLegacyBeaconApiKey(item)) {
      changed = true;
    }

    return migrateBeaconTrackedEntity(item);
  });

  return {
    items: nextItems,
    changed,
  };
}

function hasLegacyBeaconApiKey(item: unknown): boolean {
  if (item === null || typeof item !== "object") {
    return false;
  }

  const trackedEntity = item as Record<string, unknown>;
  const value = trackedEntity.value;

  if (value === null || typeof value !== "object") {
    return false;
  }

  return Object.prototype.hasOwnProperty.call(value, "apiKey");
}
