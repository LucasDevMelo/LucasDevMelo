export const RELATIONSHIPS = [
  "mae",
  "pai",
  "avo_f",
  "avo_m",
  "esposa",
  "marido",
  "namorada",
  "namorado",
  "madrinha",
  "padrinho",
  "amiga",
  "amigo",
  "outro",
] as const;

export type Relationship = (typeof RELATIONSHIPS)[number];

export const TEMPLATE_IDS = ["classico-mariano", "luz-e-fe", "gratidao"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export interface TributePhoto {
  id: string;
  /**
   * Local V1: compressed JPEG data URL.
   * Production: public/signed URL from Supabase Storage (see README).
   */
  src: string;
  width: number;
  height: number;
  /** Approximate size in bytes after compression. */
  size: number;
  alt?: string;
}

export interface TributeSettings {
  openingAnimation: boolean;
  decorations: boolean;
  visualEffect: boolean;
  /** Reserved for a future feature: licensed/royalty-free background music. */
  music: { enabled: false; trackId: null };
}

/** Everything the person fills in the wizard. */
export interface TributeContent {
  recipientName: string;
  recipientNickname?: string;
  relationship: Relationship;
  customRelationship?: string;
  template: TemplateId;
  photos: TributePhoto[];
  title: string;
  message: string;
  senderName: string;
  settings: TributeSettings;
}

export interface Tribute extends TributeContent {
  id: string;
  slug: string;
  paid: boolean;
  paidAt?: string;
  paymentId?: string;
  createdAt: string;
  updatedAt: string;
  schemaVersion: 1;
}

export type NewTribute = TributeContent & { paid?: boolean };
