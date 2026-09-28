/**
 * Composition root for persistence.
 * To migrate to Supabase, swap the implementations below — UI code stays the same.
 */
import { LocalDraftRepository, type DraftRepository } from "./draft-repository";
import { LocalTributeRepository } from "./local-tribute-repository";
import type { TributeRepository } from "./tribute-repository";

// TODO(supabase): replace with `new SupabaseTributeRepository(supabaseClient)`.
export const tributeRepository: TributeRepository = new LocalTributeRepository();

export const draftRepository: DraftRepository = new LocalDraftRepository();

export type { TributeRepository } from "./tribute-repository";
export type { DraftRepository, TributeDraft } from "./draft-repository";
