import type { DomainStorage } from "../../storage/index.js";
import { printJson } from "../helpers.js";
import type { ParsedCommand } from "../parser.js";
import { runWatch } from "../../runtime/index.js";

export async function handleWatch(
  _command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  printJson(await runWatch(storage));
}
