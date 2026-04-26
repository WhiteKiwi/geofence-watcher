import { z } from "zod";

import { Coordinates } from "../../domain/index.js";

export const BeaconLatestLocationResponse = z.object({
  id: z.string(),
  latitude: z.number(),
  longitude: z.number(),
  timestamp: z.string(),
});

export type BeaconLatestLocationResponse = z.infer<
  typeof BeaconLatestLocationResponse
>;

export const BeaconLatestLocation = z.object({
  id: z.string(),
  coordinates: Coordinates,
  observedAt: z.string(),
});

export type BeaconLatestLocation = z.infer<typeof BeaconLatestLocation>;
