import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCommand } from "./parser.js";

test("parseCommand maps help forms to the help command", () => {
  assert.equal(parseCommand(["actions", "help"]).command, "help");
  assert.equal(parseCommand(["actions", "-h"]).command, "help");
  assert.equal(parseCommand(["actions", "--help"]).command, "help");
  assert.equal(parseCommand(["watch", "-h"]).command, "help");
});
