import type { Location } from "../../domain/index.js";
import type { DomainStorage } from "../../storage/index.js";
import { deleteById, printJson, requiredNumberOption, requiredOption } from "../helpers.js";
import type { ParsedCommand } from "../parser.js";

export async function handleLocations(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  switch (command.command) {
    case "list":
      printJson(await storage.locations.list());
      return;
    case "add": {
      const location: Location = {
        id: requiredOption(command.options, "id"),
        name: requiredOption(command.options, "name"),
        coordinates: {
          latitude: requiredNumberOption(command.options, "latitude"),
          longitude: requiredNumberOption(command.options, "longitude"),
        },
      };

      await storage.locations.add(location);
      printJson(location);
      return;
    }
    case "delete":
      await deleteById(storage.locations, command.args[0]);
      return;
    default:
      throw new Error(`Unknown locations command: ${command.command ?? ""}`);
  }
}
