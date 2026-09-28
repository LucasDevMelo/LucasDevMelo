import { productConfig } from "@/config/product";

export function formatPrice(cents: number = productConfig.priceInCents): string {
  return new Intl.NumberFormat(productConfig.locale, {
    style: "currency",
    currency: productConfig.currency,
  })
    .format(cents / 100)
    .replace(/ /g, " ");
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat(productConfig.locale, {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(iso));
}
