import type { DomainStorage } from "../../storage/index.js";
import { isHelpCommand, printJson } from "../helpers.js";
import { printCommandHelp } from "./help.js";
import type { ParsedCommand } from "../parser.js";

export async function handleTrackedEntityStates(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  if (command.command === undefined || isHelpCommand(command.command)) {
    printCommandHelp("tracked-entity-states");
    return;
  }

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
