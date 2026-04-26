import type { DomainStorage } from "../../storage/index.js";
import { printJson } from "../helpers.js";
import type { ParsedCommand } from "../parser.js";

export async function handleTrackedEntityStates(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  switch (command.command) {
    case "list":
      printJson(await storage.trackedEntityStates.list());
      return;
    default:
      throw new Error(
        `Unknown tracked-entity-states command: ${command.command ?? ""}`,
      );
  }
}
