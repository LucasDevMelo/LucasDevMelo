import type { NewTribute, Tribute } from "@/types/tribute";

/**
 * Persistence contract for tributes.
 * UI code depends on this interface, never on a concrete implementation.
 *
 * V1: LocalTributeRepository (localStorage)
 * Production: SupabaseTributeRepository (see README → "Como migrar para Supabase")
 */
export interface TributeRepository {
  create(input: NewTribute): Promise<Tribute>;
  update(id: string, patch: Partial<Omit<Tribute, "id" | "createdAt">>): Promise<Tribute>;
  getById(id: string): Promise<Tribute | null>;
  getBySlug(slug: string): Promise<Tribute | null>;
  list(): Promise<Tribute[]>;
  delete(id: string): Promise<void>;
}
