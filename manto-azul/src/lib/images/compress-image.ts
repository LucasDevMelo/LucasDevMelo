export interface CompressedImage {
  dataUrl: string;
  width: number;
  height: number;
  /** Approximate decoded size in bytes. */
  size: number;
}

export interface CompressOptions {
  maxDimension?: number;
  /** Target maximum size in bytes; quality is reduced until it fits. */
  maxBytes?: number;
  initialQuality?: number;
  minQuality?: number;
}

export class ImageProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageProcessingError";
  }
}

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic", "image/heif"];

function dataUrlBytes(dataUrl: string): number {
  const base64 = dataUrl.slice(dataUrl.indexOf(",") + 1);
  return Math.ceil((base64.length * 3) / 4);
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = url;
    await img.decode();
    return img;
  } catch {
    throw new ImageProcessingError(
      "Não conseguimos ler esta imagem. Tente uma foto em JPG ou PNG.",
    );
  } finally {
    URL.revokeObjectURL(url);
  }
}

/**
 * Resizes and re-encodes an image as JPEG entirely in the browser.
 * Keeps photos small enough for localStorage (and fast to load on mobile).
 * Reusable for the future Supabase Storage upload as well.
 */
export async function compressImage(file: File, options: CompressOptions = {}): Promise<CompressedImage> {
  const { maxDimension = 1080, maxBytes = 170_000, initialQuality = 0.8, minQuality = 0.45 } = options;

  if (!file.type.startsWith("image/")) {
    throw new ImageProcessingError("Esse arquivo não parece ser uma imagem.");
  }

  const img = await loadImage(file);
  let scale = Math.min(1, maxDimension / Math.max(img.naturalWidth, img.naturalHeight));

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new ImageProcessingError("Seu navegador não permitiu processar a imagem.");

  for (let attempt = 0; attempt < 4; attempt++) {
    const width = Math.max(1, Math.round(img.naturalWidth * scale));
    const height = Math.max(1, Math.round(img.naturalHeight * scale));
    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = "#ffffff"; // flatten transparent PNGs
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0, width, height);

    let quality = initialQuality;
    let dataUrl = canvas.toDataURL("image/jpeg", quality);
    while (dataUrlBytes(dataUrl) > maxBytes && quality > minQuality) {
      quality = Math.max(minQuality, quality - 0.1);
      dataUrl = canvas.toDataURL("image/jpeg", quality);
    }

    const size = dataUrlBytes(dataUrl);
    if (size <= maxBytes || attempt === 3) {
      return { dataUrl, width, height, size };
    }
    scale *= 0.8;
  }

  throw new ImageProcessingError("Não foi possível comprimir a imagem.");
}
