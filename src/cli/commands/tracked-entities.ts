import type { TrackedEntity } from "../../domain/index.js";
import type { DomainStorage } from "../../storage/index.js";
import { deleteById, isHelpCommand, printJson, requiredOption } from "../helpers.js";
import { printCommandHelp } from "./help.js";
import type { ParsedCommand } from "../parser.js";

export async function handleTrackedEntities(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  if (command.command === undefined || isHelpCommand(command.command)) {
    printCommandHelp("tracked-entities");
    return;
  }

  switch (command.command) {
    case "list":
      printJson(await storage.trackedEntities.list());
      return;
    case "add-beacon": {
      const trackedEntity: TrackedEntity = {
        id: requiredOption(command.options, "id"),
        name: requiredOption(command.options, "name"),
        type: "beacon",
        value: {
          apiUrl: requiredOption(command.options, "api-url"),
          apiSecret: requiredOption(command.options, "api-secret"),
          id: requiredOption(command.options, "beacon-id"),
        },
      };

      await storage.trackedEntities.add(trackedEntity);
      printJson(trackedEntity);
      return;
    }
    case "delete":
      await deleteById(storage.trackedEntities, command.args[0]);
      return;
    default:
      throw new Error(`Unknown tracked-entities command: ${command.command ?? ""}`);
  }
}
