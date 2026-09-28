import { browserStorage } from "@/lib/storage/browser-storage";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";

export interface TributeDraft {
  values: Partial<TributeFormValues>;
  step: number;
  /** Set once checkout creates a pending tribute, to avoid duplicates on retry. */
  pendingTributeId?: string;
  updatedAt: string;
}

/**
 * Stores the in-progress tribute while the person uses the wizard.
 * In production this can stay local (drafts are private) or move to the database.
 */
export interface DraftRepository {
  load(): TributeDraft | null;
  save(draft: Omit<TributeDraft, "updatedAt">): void;
  clear(): void;
}

const KEY = "draft";

export class LocalDraftRepository implements DraftRepository {
  load(): TributeDraft | null {
    return browserStorage.read<TributeDraft | null>(KEY, null);
  }

  save(draft: Omit<TributeDraft, "updatedAt">): void {
    browserStorage.write<TributeDraft>(KEY, { ...draft, updatedAt: new Date().toISOString() });
  }

  clear(): void {
    browserStorage.remove(KEY);
  }
}
