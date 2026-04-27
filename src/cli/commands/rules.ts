import type { GeofenceRule } from "../../domain/index.js";
import type { DomainStorage } from "../../storage/index.js";
import {
  deleteById,
  isHelpCommand,
  printJson,
  requiredEventType,
  requiredOption,
} from "../helpers.js";
import { printCommandHelp } from "./help.js";
import type { ParsedCommand } from "../parser.js";

export async function handleRules(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  if (command.command === undefined || isHelpCommand(command.command)) {
    printCommandHelp("rules");
    return;
  }

  switch (command.command) {
    case "list":
      printJson(await storage.rules.list());
      return;
    case "add": {
      const geofenceId = requiredOption(command.options, "geofence-id");
      const actionId = requiredOption(command.options, "action-id");
      const eventType = requiredEventType(command.options);
      const rule: GeofenceRule = {
        id: `${geofenceId}:${eventType}`,
        geofenceId,
        actionId,
        trigger: {
          eventType,
        },
      };

      await storage.rules.add(rule);
      printJson(rule);
      return;
    }
    case "delete":
      await deleteById(storage.rules, command.args[0]);
      return;
    default:
      throw new Error(`Unknown rules command: ${command.command ?? ""}`);
  }
}
