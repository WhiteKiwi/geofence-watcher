import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

export type Identifiable = {
  id: string;
};

export class JsonFileCollection<T extends Identifiable> {
  constructor(private readonly filePath: string) {}

  async list(): Promise<T[]> {
    return this.readAll();
  }

  async get(id: string): Promise<T | undefined> {
    const items = await this.readAll();

    return items.find((item) => item.id === id);
  }

  async add(item: T): Promise<void> {
    const items = await this.readAll();

    if (items.some((existingItem) => existingItem.id === item.id)) {
      throw new Error(`Item already exists: ${item.id}`);
    }

    await this.writeAll([...items, item]);
  }

  async upsert(item: T): Promise<void> {
    const items = await this.readAll();
    const index = items.findIndex((existingItem) => existingItem.id === item.id);

    if (index === -1) {
      await this.writeAll([...items, item]);
      return;
    }

    const nextItems = [...items];
    nextItems[index] = item;
    await this.writeAll(nextItems);
  }

  async delete(id: string): Promise<boolean> {
    const items = await this.readAll();
    const nextItems = items.filter((item) => item.id !== id);

    if (nextItems.length === items.length) {
      return false;
    }

    await this.writeAll(nextItems);
    return true;
  }

  async replaceAll(items: T[]): Promise<void> {
    await this.writeAll(items);
  }

  private async readAll(): Promise<T[]> {
    try {
      const content = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(content) as unknown;

      if (!Array.isArray(parsed)) {
        throw new Error(`Expected JSON array: ${this.filePath}`);
      }

      return parsed as T[];
    } catch (error) {
      if (isNodeError(error) && error.code === "ENOENT") {
        return [];
      }

      throw error;
    }
  }

  private async writeAll(items: T[]): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    const temporaryFilePath = `${this.filePath}.tmp`;
    const content = `${JSON.stringify(items, null, 2)}\n`;

    await writeFile(temporaryFilePath, content, "utf8");
    await rename(temporaryFilePath, this.filePath);
  }
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
