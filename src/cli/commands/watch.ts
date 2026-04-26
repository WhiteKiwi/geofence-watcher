import type { DomainStorage } from "../../storage/index.js";
import { isHelpCommand, printJson } from "../helpers.js";
import { printCommandHelp } from "./help.js";
import type { ParsedCommand } from "../parser.js";
import { runWatch } from "../../runtime/index.js";

export async function handleWatch(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  if (isHelpCommand(command.command)) {
    printCommandHelp("watch");
    return;
  }

  printJson(await runWatch(storage));
}
