type HelpResource =
  | "tracked-entities"
  | "tracked-entity-states"
  | "locations"
  | "geofences"
  | "rules"
  | "actions"
  | "watch"
  | "install-cron";

export function printHelp(): void {
  console.log(`Usage:
  geofence-watcher tracked-entities help
  geofence-watcher tracked-entity-states help
  geofence-watcher locations help
  geofence-watcher geofences help
  geofence-watcher rules help
  geofence-watcher actions help
  geofence-watcher watch --help
  geofence-watcher install-cron --help

  geofence-watcher tracked-entities list
  geofence-watcher tracked-entities add-beacon --id <id> --name <name> --api-url <apiUrl> --api-key <apiKey> --beacon-id <beaconId>
  geofence-watcher tracked-entities delete <id>

  geofence-watcher tracked-entity-states list

  geofence-watcher locations list
  geofence-watcher locations add --id <id> --name <name> --latitude <latitude> --longitude <longitude>
  geofence-watcher locations delete <id>

  geofence-watcher geofences list
  geofence-watcher geofences add-circle --id <id> --name <name> --center-location-id <locationId> --radius-meters <meters>
  geofence-watcher geofences delete <id>

  geofence-watcher rules list
  geofence-watcher rules add --geofence-id <geofenceId> --action-id <actionId> --event-type <enter|exit>
  geofence-watcher rules delete <id>

  geofence-watcher actions list
  geofence-watcher actions add-shell --id <id> --command <command>
  geofence-watcher actions run <id>
  geofence-watcher actions delete <id>

  geofence-watcher watch
  geofence-watcher install-cron --every 5m`);
}

export function printCommandHelp(resource: HelpResource): void {
  switch (resource) {
    case "tracked-entities":
      console.log(`Usage:
  geofence-watcher tracked-entities list
  geofence-watcher tracked-entities add-beacon --id <id> --name <name> --api-url <apiUrl> --api-key <apiKey> --beacon-id <beaconId>
  geofence-watcher tracked-entities delete <id>`);
      return;
    case "tracked-entity-states":
      console.log(`Usage:
  geofence-watcher tracked-entity-states list`);
      return;
    case "locations":
      console.log(`Usage:
  geofence-watcher locations list
  geofence-watcher locations add --id <id> --name <name> --latitude <latitude> --longitude <longitude>
  geofence-watcher locations delete <id>`);
      return;
    case "geofences":
      console.log(`Usage:
  geofence-watcher geofences list
  geofence-watcher geofences add-circle --id <id> --name <name> --center-location-id <locationId> --radius-meters <meters>
  geofence-watcher geofences delete <id>`);
      return;
    case "rules":
      console.log(`Usage:
  geofence-watcher rules list
  geofence-watcher rules add --geofence-id <geofenceId> --action-id <actionId> --event-type <enter|exit>
  geofence-watcher rules delete <id>`);
      return;
    case "actions":
      console.log(`Usage:
  geofence-watcher actions list
  geofence-watcher actions add-shell --id <id> --command <command>
  geofence-watcher actions run <id>
  geofence-watcher actions delete <id>`);
      return;
    case "watch":
      console.log(`Usage:
  geofence-watcher watch`);
      return;
    case "install-cron":
      console.log(`Usage:
  geofence-watcher install-cron --every 5m`);
      return;
  }
}
