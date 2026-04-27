import assert from "node:assert/strict";
import { test } from "node:test";

import { debug, setDebugEnabled } from "./logger.js";

test("debug stays silent until enabled", () => {
  const originalError = console.error;
  const output: string[] = [];

  console.error = (...args: unknown[]) => {
    output.push(args.map(String).join(" "));
  };

  try {
    setDebugEnabled(false);
    debug("hidden message");
    assert.equal(output.length, 0);

    setDebugEnabled(true);
    debug("visible message");
    assert.equal(output.length, 1);
    assert.match(output[0], /visible message/);
  } finally {
    setDebugEnabled(false);
    console.error = originalError;
  }
});
