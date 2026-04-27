import { z } from "zod";

const BeaconTrackedEntityValueInput = z
  .object({
    apiSecret: z.string(),
    apiUrl: z.string(),
    id: z.string(),
  });

export const BeaconTrackedEntityValue = BeaconTrackedEntityValueInput;

export type BeaconTrackedEntityValue = z.infer<typeof BeaconTrackedEntityValue>;

export const BeaconTrackedEntity = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("beacon"),
  value: BeaconTrackedEntityValue,
});

export type BeaconTrackedEntity = z.infer<typeof BeaconTrackedEntity>;

export const TrackedEntity = BeaconTrackedEntity;

export type TrackedEntity = z.infer<typeof TrackedEntity>;

export function migrateBeaconTrackedEntity(item: unknown): BeaconTrackedEntity {
  if (item === null || typeof item !== "object") {
    return BeaconTrackedEntity.parse(item);
  }

  const trackedEntity = item as Record<string, unknown>;
  const value = trackedEntity.value;

  if (value === null || typeof value !== "object") {
    return BeaconTrackedEntity.parse(item);
  }

  const valueRecord = value as Record<string, unknown>;
  const apiSecret = valueRecord.apiSecret ?? valueRecord.apiKey;
  if (typeof apiSecret !== "string") {
    return BeaconTrackedEntity.parse(item);
  }

  const normalizedValue = {
    ...valueRecord,
    apiSecret,
  };

  delete (normalizedValue as Record<string, unknown>).apiKey;

  return BeaconTrackedEntity.parse({
    ...trackedEntity,
    value: normalizedValue,
  });
}
