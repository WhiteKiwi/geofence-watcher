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
): JsonFileCollection<T> {
  return new JsonFileCollection<T>(fileURLToPath(new URL(fileName, dataDirectoryUrl)));
}

function buildDefaultDataDirectoryUrl(): URL {
  const xdgDataHome = process.env.XDG_DATA_HOME ?? `${homedir()}/.local/share`;
  const dataDirectoryPath = join(xdgDataHome, "geofence-watcher", ".data");

  return pathToFileURL(`${dataDirectoryPath}/`);
}
