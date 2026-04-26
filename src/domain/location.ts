import { z } from "zod";

import { Coordinates } from "./coordinates.js";

export const Location = z.object({
  id: z.string(),
  name: z.string(),
  coordinates: Coordinates,
});

export type Location = z.infer<typeof Location>;
