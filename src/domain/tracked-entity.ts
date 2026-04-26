import { z } from "zod";

export const BeaconTrackedEntityValue = z.object({
  apiKey: z.string(),
  apiUrl: z.string(),
  id: z.string(),
});

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
