import assert from "node:assert/strict";
import { test } from "node:test";

import { handleActions } from "./actions.js";
import type { DomainStorage } from "../../storage/index.js";

test("handleActions prints help for help commands", async () => {
  const storage = {
    actions: emptyCollection(),
    trackedEntities: emptyCollection(),
    trackedEntityStates: emptyCollection(),
    locations: emptyCollection(),
    geofences: emptyCollection(),
    rules: emptyCollection(),
  } as unknown as DomainStorage;

  const originalLog = console.log;
  const output: string[] = [];

  console.log = (...args: any[]) => {
    output.push(args.join(" "));
  };

  try {
    await handleActions(
      {
        resource: "actions",
        command: undefined,
        args: [],
        options: {},
      },
      storage,
    );

    await handleActions(
      {
        resource: "actions",
        command: "help",
        args: [],
        options: {},
      },
      storage,
    );

    assert.equal(output.length, 2);
    assert.match(output[0], /geofence-watcher actions list/);
    assert.match(output[1], /geofence-watcher actions list/);
  } finally {
    console.log = originalLog;
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
