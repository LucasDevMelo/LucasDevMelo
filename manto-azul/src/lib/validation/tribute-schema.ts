import { z } from "zod";
import { productConfig } from "@/config/product";
import { RELATIONSHIPS, TEMPLATE_IDS } from "@/types/tribute";

const cfg = productConfig;

const photoSchema = z.object({
  id: z.string(),
  src: z.string().min(1),
  width: z.number().positive(),
  height: z.number().positive(),
  size: z.number().nonnegative(),
  alt: z.string().optional(),
});

export const recipientSchema = z
  .object({
    recipientName: z
      .string()
      .trim()
      .min(1, { error: "Conte pra gente o nome da pessoa presenteada." })
      .max(cfg.maxNameLength, { error: `Use no máximo ${cfg.maxNameLength} caracteres.` }),
    recipientNickname: z
      .string()
      .trim()
      .max(cfg.maxNameLength, { error: `Use no máximo ${cfg.maxNameLength} caracteres.` })
      .optional(),
    relationship: z.enum(RELATIONSHIPS, { error: "Escolha o relacionamento com essa pessoa." }),
    customRelationship: z
      .string()
      .trim()
      .max(cfg.maxNameLength, { error: `Use no máximo ${cfg.maxNameLength} caracteres.` })
      .optional(),
  });

export const templateSchema = z.object({
  template: z.enum(TEMPLATE_IDS, { error: "Escolha um estilo para a homenagem." }),
});

export const photosSchema = z.object({
  photos: z
    .array(photoSchema)
    .max(cfg.maxPhotos, { error: `Você pode adicionar no máximo ${cfg.maxPhotos} fotos.` }),
});

export const messageSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, { error: "Escreva um título para a homenagem." })
    .max(cfg.maxTitleLength, { error: `O título pode ter no máximo ${cfg.maxTitleLength} caracteres.` }),
  message: z
    .string()
    .trim()
    .min(1, { error: "Escreva uma mensagem do coração — ela é a alma da homenagem." })
    .max(cfg.maxMessageLength, {
      error: `A mensagem pode ter no máximo ${cfg.maxMessageLength} caracteres.`,
    }),
  senderName: z
    .string()
    .trim()
    .min(1, { error: "Diga quem está enviando a homenagem." })
    .max(cfg.maxSenderLength, { error: `Use no máximo ${cfg.maxSenderLength} caracteres.` }),
});

export const settingsSchema = z.object({
  settings: z.object({
    openingAnimation: z.boolean(),
    decorations: z.boolean(),
    visualEffect: z.boolean(),
    music: z.object({ enabled: z.literal(false), trackId: z.null() }),
  }),
});

export const tributeContentSchema = recipientSchema
  .extend(templateSchema.shape)
  .extend(photosSchema.shape)
  .extend(messageSchema.shape)
  .extend(settingsSchema.shape);

export type TributeFormValues = z.infer<typeof tributeContentSchema>;
