import type { Options } from "./parser.js";

export function requiredOption(options: Options, name: string): string {
  const value = options[name];

  if (!value) {
    throw new Error(`Missing required option: --${name}`);
  }

  return value;
}

export function requiredNumberOption(options: Options, name: string): number {
  const value = Number(requiredOption(options, name));

  if (!Number.isFinite(value)) {
    throw new Error(`Invalid number option: --${name}`);
  }

  return value;
}

export function requiredEventType(options: Options): "enter" | "exit" {
  const eventType = requiredOption(options, "event-type");

  if (eventType !== "enter" && eventType !== "exit") {
    throw new Error("--event-type must be enter or exit");
  }

  return eventType;
}

export async function deleteById(
  collection: { delete(id: string): Promise<boolean> },
  id: string | undefined,
): Promise<void> {
  if (!id) {
    throw new Error("Missing id");
  }

  printJson({
    id,
    deleted: await collection.delete(id),
  });
}

export function printJson(value: unknown): void {
  console.log(JSON.stringify(value, null, 2));
}
