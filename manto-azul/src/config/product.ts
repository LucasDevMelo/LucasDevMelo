/**
 * Central product configuration.
 * Change name, price, limits and contact info here — the UI reads everything from this file.
 */
export const productConfig = {
  productName: "Manto Azul",
  tagline: "Homenagens digitais para o Dia de Nossa Senhora Aparecida",
  description:
    "Crie uma página personalizada, com fotos e uma mensagem do coração, para presentear alguém especial no Dia de Nossa Senhora Aparecida.",

  /** Price in cents to avoid floating point issues. */
  priceInCents: 1990,
  currency: "BRL",
  locale: "pt-BR",
  offerName: "Homenagem personalizada",
  paymentLabel: "Pagamento único",

  maxPhotos: 5,
  maxTitleLength: 80,
  maxMessageLength: 900,
  maxNameLength: 40,
  maxSenderLength: 60,

  /** Event date used on tribute pages and landing copy. */
  eventDate: { day: 12, month: 10 },
  eventDateLabel: "12 de outubro",
  eventName: "Dia de Nossa Senhora Aparecida",

  supportEmail: "contato@mantoazul.com.br",
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",

  /**
   * V1 runs 100% in the browser (localStorage + simulated checkout).
   * When true, the UI shows honest notices about local storage and fake payments.
   */
  isLocalDemo: true,
} as const;

export type ProductConfig = typeof productConfig;
