import { z } from "zod";

export const ShellActionValue = z.object({
  command: z.string(),
});

export type ShellActionValue = z.infer<typeof ShellActionValue>;

export const ShellAction = z.object({
  id: z.string(),
  type: z.literal("shell"),
  value: ShellActionValue,
});

export type ShellAction = z.infer<typeof ShellAction>;

export const Action = ShellAction;

export type Action = z.infer<typeof Action>;
