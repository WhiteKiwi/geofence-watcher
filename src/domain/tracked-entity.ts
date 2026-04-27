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
