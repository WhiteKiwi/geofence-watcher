import { createDomainStorage } from "../storage/index.js";
import { handleActions } from "./commands/actions.js";
import { handleGeofences } from "./commands/geofences.js";
import { handleInstallCron } from "./commands/install-cron.js";
import { printHelp } from "./commands/help.js";
import { handleLocations } from "./commands/locations.js";
import { handleRules } from "./commands/rules.js";
import { handleWatch } from "./commands/watch.js";
import { handleTrackedEntityStates } from "./commands/tracked-entity-states.js";
import { handleTrackedEntities } from "./commands/tracked-entities.js";
import { debug, setDebugEnabled } from "./logger.js";
import { parseCommand } from "./parser.js";

const storage = createDomainStorage();

async function main(): Promise<void> {
  const parsedCommand = parseCommand(process.argv.slice(2));
  setDebugEnabled(parsedCommand.options.debug === true);
  debug("main: dispatching command", {
    resource: parsedCommand.resource,
    command: parsedCommand.command,
    args: parsedCommand.args,
    options: parsedCommand.options,
  });

  switch (parsedCommand.resource) {
    case "tracked-entities":
      await handleTrackedEntities(parsedCommand, storage);
      return;
    case "tracked-entity-states":
      await handleTrackedEntityStates(parsedCommand, storage);
      return;
    case "locations":
      await handleLocations(parsedCommand, storage);
      return;
    case "geofences":
      await handleGeofences(parsedCommand, storage);
      return;
    case "rules":
      await handleRules(parsedCommand, storage);
      return;
    case "actions":
      await handleActions(parsedCommand, storage);
      return;
    case "install-cron":
      await handleInstallCron(parsedCommand, storage);
      return;
    case "watch":
      await handleWatch(parsedCommand, storage);
      return;
    case undefined:
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return;
    default:
      throw new Error(`Unknown command: ${parsedCommand.resource}`);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
