import assert from "node:assert/strict";
import { test } from "node:test";

import { parseCommand } from "./parser.js";

test("parseCommand maps help forms to the help command", () => {
  assert.equal(parseCommand(["actions", "help"]).command, "help");
  assert.equal(parseCommand(["actions", "-h"]).command, "help");
  assert.equal(parseCommand(["actions", "--help"]).command, "help");
  assert.equal(parseCommand(["watch", "-h"]).command, "help");
});

test("parseCommand treats --debug as a flag", () => {
  const parsed = parseCommand(["watch", "--debug"]);

  assert.equal(parsed.resource, "watch");
  assert.equal(parsed.command, undefined);
  assert.equal(parsed.options.debug, true);
});

test("parseCommand allows leading --debug before the command", () => {
  const parsed = parseCommand(["--debug", "watch"]);

  assert.equal(parsed.resource, "watch");
  assert.equal(parsed.command, undefined);
  assert.equal(parsed.options.debug, true);
});
