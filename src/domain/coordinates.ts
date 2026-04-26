import { z } from "zod";

export const Coordinates = z.object({
  latitude: z.number(),
  longitude: z.number(),
});

export type Coordinates = z.infer<typeof Coordinates>;
