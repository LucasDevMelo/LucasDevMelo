const ALPHABET = "abcdefghjkmnpqrstuvwxyz23456789";

function randomSuffix(length = 6): string {
  const values = new Uint32Array(length);
  crypto.getRandomValues(values);
  return Array.from(values, (v) => ALPHABET[v % ALPHABET.length]).join("");
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
}

/** e.g. "para-maria-k3f9qa". The random part keeps links hard to guess. */
export function generateTributeSlug(recipientName: string): string {
  const base = slugify(recipientName) || "homenagem";
  return `para-${base}-${randomSuffix()}`;
}
