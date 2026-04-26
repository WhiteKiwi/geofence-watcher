import type { Geofence } from "../../domain/index.js";
import type { DomainStorage } from "../../storage/index.js";
import { deleteById, printJson, requiredNumberOption, requiredOption } from "../helpers.js";
import type { ParsedCommand } from "../parser.js";

export async function handleGeofences(
  command: ParsedCommand,
  storage: DomainStorage,
): Promise<void> {
  switch (command.command) {
    case "list":
      printJson(await storage.geofences.list());
      return;
    case "add-circle": {
      const geofence: Geofence = {
        id: requiredOption(command.options, "id"),
        name: requiredOption(command.options, "name"),
        type: "circle",
        value: {
          centerLocationId: requiredOption(command.options, "center-location-id"),
          radiusMeters: requiredNumberOption(command.options, "radius-meters"),
        },
      };

      await storage.geofences.add(geofence);
      printJson(geofence);
      return;
    }
    case "delete":
      await deleteById(storage.geofences, command.args[0]);
      return;
    default:
      throw new Error(`Unknown geofences command: ${command.command ?? ""}`);
  }
}
