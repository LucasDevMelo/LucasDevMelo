import { browserStorage } from "@/lib/storage/browser-storage";
import { generateTributeSlug } from "@/lib/slug";
import { createId } from "@/lib/utils";
import type { NewTribute, Tribute } from "@/types/tribute";
import type { TributeRepository } from "./tribute-repository";

const KEY = "tributes";

type Store = Record<string, Tribute>;

export class LocalTributeRepository implements TributeRepository {
  private readAll(): Store {
    return browserStorage.read<Store>(KEY, {});
  }

  private writeAll(store: Store) {
    browserStorage.write(KEY, store);
  }

  async create(input: NewTribute): Promise<Tribute> {
    const store = this.readAll();
    const now = new Date().toISOString();
    let slug = generateTributeSlug(input.recipientName);
    while (Object.values(store).some((t) => t.slug === slug)) {
      slug = generateTributeSlug(input.recipientName);
    }
    const tribute: Tribute = {
      ...input,
      id: createId(),
      slug,
      paid: input.paid ?? false,
      createdAt: now,
      updatedAt: now,
      schemaVersion: 1,
    };
    this.writeAll({ ...store, [tribute.id]: tribute });
    return tribute;
  }

  async update(id: string, patch: Partial<Omit<Tribute, "id" | "createdAt">>): Promise<Tribute> {
    const store = this.readAll();
    const current = store[id];
    if (!current) throw new Error("Homenagem não encontrada.");
    const updated: Tribute = { ...current, ...patch, id, updatedAt: new Date().toISOString() };
    this.writeAll({ ...store, [id]: updated });
    return updated;
  }

  async getById(id: string): Promise<Tribute | null> {
    return this.readAll()[id] ?? null;
  }

  async getBySlug(slug: string): Promise<Tribute | null> {
    return Object.values(this.readAll()).find((t) => t.slug === slug) ?? null;
  }

  async list(): Promise<Tribute[]> {
    return Object.values(this.readAll()).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async delete(id: string): Promise<void> {
    const store = this.readAll();
    delete store[id];
    this.writeAll(store);
  }
}
