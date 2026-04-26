import { z } from "zod";

import { Coordinates } from "./coordinates.js";

export const TrackedEntityState = z.object({
  id: z.string(),
  trackedEntityId: z.string(),
  coordinates: Coordinates,
  observedAt: z.string(),
  updatedAt: z.string(),
});

export type TrackedEntityState = z.infer<typeof TrackedEntityState>;
