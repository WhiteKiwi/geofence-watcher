import { z } from "zod";

export const CircleGeofenceValue = z.object({
  centerLocationId: z.string(),
  radiusMeters: z.number(),
});

export type CircleGeofenceValue = z.infer<typeof CircleGeofenceValue>;

export const CircleGeofence = z.object({
  id: z.string(),
  name: z.string(),
  type: z.literal("circle"),
  value: CircleGeofenceValue,
});

export type CircleGeofence = z.infer<typeof CircleGeofence>;

export const Geofence = CircleGeofence;

export type Geofence = z.infer<typeof Geofence>;
