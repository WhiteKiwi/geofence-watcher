import type { Action } from "../../domain/index.js";
import type { DomainStorage } from "../../storage/index.js";
import { deleteById, printJson, requiredOption } from "../helpers.js";
import type { ParsedCommand } from "../parser.js";
import { executeShellAction } from "../../runtime/execute-shell-action.js";

export async function handleActions(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  switch (command.command) {
    case "list":
      printJson(await storage.actions.list());
      return;
    case "add-shell": {
      const action: Action = {
        id: requiredOption(command.options, "id"),
        type: "shell",
        value: {
          command: requiredOption(command.options, "command"),
        },
      };

      await storage.actions.add(action);
      printJson(action);
      return;
    }
    case "run": {
      const actionId = command.args[0];

      if (!actionId) {
        throw new Error("Missing action id");
      }

      const action = await storage.actions.get(actionId);

      if (!action) {
        throw new Error(`Action not found: ${actionId}`);
      }

      if (action.type !== "shell") {
        throw new Error(`Unsupported action type: ${action.type}`);
      }

      printJson(await executeShellAction(action));
      return;
    }
    case "delete":
      await deleteById(storage.actions, command.args[0]);
      return;
    default:
      throw new Error(`Unknown actions command: ${command.command ?? ""}`);
  }
}
