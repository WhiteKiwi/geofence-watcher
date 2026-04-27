import assert from "node:assert/strict";
import { test } from "node:test";

import { runWatch, type WatchResult } from "./watch.js";
import type { DomainStorage } from "../storage/index.js";
import type { JsonFileCollection } from "../storage/index.js";
import type { Action, Geofence, GeofenceRule, Location, TrackedEntity, TrackedEntityState } from "../domain/index.js";
import { setDebugEnabled } from "../cli/logger.js";

test("runWatch continues when one tracked entity fetch fails", async () => {
  const previousFetch = globalThis.fetch;

  globalThis.fetch = async (input: RequestInfo | URL) => {
    const url = String(input);

    if (url.includes("fail")) {
      throw new Error("fetch failed");
    }

    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        id: "latest-1",
        latitude: 37.1,
        longitude: 127.1,
        timestamp: "2026-04-26T00:10:00.000Z",
      }),
    } as Response;
  };

  const upsertedStates: TrackedEntityState[] = [];
  const storage: DomainStorage = {
    trackedEntities: collectionStub<TrackedEntity>({
      list: async () => trackedEntities,
      get: async () => undefined,
      add: async () => undefined,
      upsert: async () => undefined,
      delete: async () => false,
      replaceAll: async () => undefined,
    }),
    trackedEntityStates: collectionStub<TrackedEntityState>({
      list: async () => Object.values(previousStates).filter(
        (trackedEntityState): trackedEntityState is TrackedEntityState =>
          trackedEntityState !== undefined,
      ),
      get: async (id: string) => previousStates[id],
      add: async (item: TrackedEntityState) => {
        upsertedStates.push(item);
      },
      upsert: async (item: TrackedEntityState) => {
        upsertedStates.push(item);
      },
      delete: async () => false,
      replaceAll: async () => undefined,
    }),
    actions: collectionStub<Action>(emptyCollection()),
    locations: collectionStub<Location>(emptyCollection()),
    geofences: collectionStub<Geofence>(emptyCollection()),
    rules: collectionStub<GeofenceRule>(emptyCollection()),
  };

  const trackedEntities: TrackedEntity[] = [
    {
      id: "success",
      name: "Success Beacon",
      type: "beacon",
      value: {
        apiUrl: "https://example.com/latest",
        apiKey: "key",
        id: "beacon-1",
      },
    },
    {
      id: "failure",
      name: "Failure Beacon",
      type: "beacon",
      value: {
        apiUrl: "https://example.com/fail",
        apiKey: "key",
        id: "beacon-2",
      },
    },
  ];

  const previousStates: Record<string, TrackedEntityState | undefined> = {
    success: {
      id: "success",
      trackedEntityId: "success",
      coordinates: {
        latitude: 37,
        longitude: 127,
      },
      observedAt: "2026-04-26T00:00:00.000Z",
      updatedAt: "2026-04-26T00:00:00.000Z",
    },
    failure: undefined,
  };

  try {
    setDebugEnabled(false);
    const result: WatchResult = await runWatch(storage);

    assert.equal(result.processedTrackedEntities.length, 2);
    assert.equal(result.processedTrackedEntities[0].status, "ok");
    assert.equal(result.processedTrackedEntities[1].status, "error");
    assert.equal(upsertedStates.length, 1);
    assert.equal(upsertedStates[0].id, "success");
  } finally {
    setDebugEnabled(false);
    globalThis.fetch = previousFetch;
  }
});

test("runWatch emits debug logs only when enabled", async () => {
  const previousFetch = globalThis.fetch;
  const originalError = console.error;
  const output: string[] = [];

  globalThis.fetch = async () => {
    return {
      ok: true,
      status: 200,
      statusText: "OK",
      json: async () => ({
        id: "latest-1",
        latitude: 37.1,
        longitude: 127.1,
        timestamp: "2026-04-26T00:10:00.000Z",
      }),
    } as Response;
  };

  console.error = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };

  const storage: DomainStorage = {
    trackedEntities: collectionStub<TrackedEntity>({
      list: async () => trackedEntities,
      get: async () => undefined,
      add: async () => undefined,
      upsert: async () => undefined,
      delete: async () => false,
      replaceAll: async () => undefined,
    }),
    trackedEntityStates: collectionStub<TrackedEntityState>({
      list: async () => [],
      get: async () => undefined,
      add: async () => undefined,
      upsert: async () => undefined,
      delete: async () => false,
      replaceAll: async () => undefined,
    }),
    actions: collectionStub<Action>(emptyCollection()),
    locations: collectionStub<Location>(emptyCollection()),
    geofences: collectionStub<Geofence>(emptyCollection()),
    rules: collectionStub<GeofenceRule>(emptyCollection()),
  };

  const trackedEntities: TrackedEntity[] = [
    {
      id: "entity-1",
      name: "Beacon",
      type: "beacon",
      value: {
        apiUrl: "https://example.com/latest",
        apiKey: "key",
        id: "beacon-1",
      },
    },
  ];

  try {
    setDebugEnabled(false);
    await runWatch(storage);
    assert.equal(output.length, 0);

    setDebugEnabled(true);
    await runWatch(storage);
    assert.ok(output.length > 0);
    assert.match(output.join("\n"), /watch: started/);
    assert.match(output.join("\n"), /watch: processed tracked entity successfully/);
  } finally {
    setDebugEnabled(false);
    console.error = originalError;
    globalThis.fetch = previousFetch;
  }
});

function emptyCollection() {
  return {
    list: async () => [],
    get: async () => undefined,
    add: async () => undefined,
    upsert: async () => undefined,
    delete: async () => false,
    replaceAll: async () => undefined,
  };
}

function collectionStub<T extends { id: string }>(
  methods: {
    list: () => Promise<T[]>;
    get: (id: string) => Promise<T | undefined>;
    add: (item: T) => Promise<void>;
    upsert: (item: T) => Promise<void>;
    delete: (id: string) => Promise<boolean>;
    replaceAll: (items: T[]) => Promise<void>;
  },
): JsonFileCollection<T> {
  return methods as unknown as JsonFileCollection<T>;
}
