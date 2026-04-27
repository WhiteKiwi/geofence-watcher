import { z } from "zod";

export const GeofenceTriggerEventType = z.enum(["enter", "exit"]);

export type GeofenceTriggerEventType = z.infer<typeof GeofenceTriggerEventType>;

export const GeofenceRuleTrigger = z.object({
  eventType: GeofenceTriggerEventType,
});

export type GeofenceRuleTrigger = z.infer<typeof GeofenceRuleTrigger>;

export const GeofenceRule = z.object({
  id: z.string(),
  geofenceId: z.string(),
  actionId: z.string(),
  trigger: GeofenceRuleTrigger,
});

export type GeofenceRule = z.infer<typeof GeofenceRule>;
