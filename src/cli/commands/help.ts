export function printHelp(): void {
  console.log(`Usage:
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
  geofence-watcher rules add --geofence-id <geofenceId> --action-id <actionId> --event-type <enter|exit> --hysteresis-meters <meters>
  geofence-watcher rules delete <id>

  geofence-watcher actions list
  geofence-watcher actions add-shell --id <id> --command <command>
  geofence-watcher actions run <id>
  geofence-watcher actions delete <id>

  geofence-watcher watch
  geofence-watcher install-cron --every 5m`);
}
