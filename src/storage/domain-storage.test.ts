import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { test } from "node:test";

import { createDomainStorage } from "./domain-storage.js";

test("createDomainStorage migrates legacy beacon apiKey values on read", async () => {
  const dataDirectoryPath = await mkdtemp(join(tmpdir(), "geofence-watcher-"));
  const trackedEntitiesPath = join(dataDirectoryPath, "tracked-entities.json");

  await writeFile(
    trackedEntitiesPath,
    `${JSON.stringify([
      {
        id: "beacon-1",
        name: "Beacon",
        type: "beacon",
        value: {
          apiKey: "legacy-secret",
          apiUrl: "https://example.com/latest",
          id: "device-1",
        },
      },
    ], null, 2)}\n`,
    "utf8",
  );

  const storage = createDomainStorage({
    dataDirectoryUrl: pathToFileURL(`${dataDirectoryPath}/`),
  });

  const trackedEntities = await storage.trackedEntities.list();

  assert.equal(trackedEntities.length, 1);
  assert.equal(trackedEntities[0]?.value.apiSecret, "legacy-secret");
  assert.equal("apiKey" in trackedEntities[0]!.value, false);

  const rewritten = JSON.parse(await readFile(trackedEntitiesPath, "utf8")) as Array<{
    value: Record<string, unknown>;
  }>;

  assert.equal(rewritten[0]?.value.apiSecret, "legacy-secret");
  assert.equal("apiKey" in rewritten[0]!.value, false);
});
