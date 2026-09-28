/* eslint-disable @next/next/no-img-element -- photos are local data URLs / static SVGs; next/image adds no value here */
"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { TemplateDefinition } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { TributePhoto } from "@/types/tribute";
import { Reveal } from "./reveal";

interface PhotoGalleryProps {
  photos: TributePhoto[];
  layout: TemplateDefinition["gallery"];
  recipientName: string;
  animate: boolean;
  interactive: boolean;
}

function gridClass(count: number, layout: PhotoGalleryProps["layout"]) {
  if (count === 1) return "grid-cols-1 max-w-sm mx-auto";
  if (count === 2) return "grid-cols-2 max-w-2xl mx-auto";
  if (layout === "minimal") return "grid-cols-2 @3xl:grid-cols-3";
  return "grid-cols-2 @3xl:grid-cols-3";
}

export function PhotoGallery({ photos, layout, recipientName, animate, interactive }: PhotoGalleryProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const close = useCallback(() => setOpenIndex(null), []);
  const step = useCallback(
    (dir: 1 | -1) => setOpenIndex((i) => (i === null ? i : (i + dir + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (openIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [openIndex, close, step]);

  const altFor = (photo: TributePhoto, index: number) =>
    photo.alt || `Foto ${index + 1} da homenagem para ${recipientName}`;

  return (
    <>
      <div className={cn("grid gap-4 @md:gap-6", gridClass(photos.length, layout))}>
        {photos.map((photo, index) => {
          // In "minimal", the first photo spans the full row, so parity is computed on the rest.
          const gridCount = layout === "minimal" && photos.length > 2 ? photos.length - 1 : photos.length;
          const isOddLast = photos.length > 2 && gridCount % 2 === 1 && index === photos.length - 1;
          return (
            <Reveal
              key={photo.id}
              enabled={animate}
              delay={index * 0.08}
              className={cn(
                isOddLast && "col-span-2 mx-auto w-1/2 @3xl:col-span-1 @3xl:w-full",
                layout === "polaroid" && (index % 2 ? "rotate-[2deg]" : "-rotate-[2deg]"),
                layout === "minimal" && index === 0 && photos.length > 2 && "col-span-2 w-full",
              )}
            >
              <button
                type="button"
                disabled={!interactive}
                onClick={() => setOpenIndex(index)}
                aria-label={`Ampliar foto ${index + 1}`}
                className={cn(
                  "group block w-full overflow-hidden transition-transform duration-300 enabled:hover:-translate-y-1 disabled:cursor-default",
                  layout === "arches" &&
                    "rounded-t-full rounded-b-2xl border-2 border-[var(--t-photo-border)] p-1.5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.6)]",
                  layout === "minimal" && "rounded-3xl bg-white p-1.5 shadow-[0_18px_40px_-22px_rgba(23,39,71,0.45)]",
                  layout === "polaroid" &&
                    "rounded-md bg-[var(--t-photo-border)] p-2.5 pb-8 shadow-[0_18px_36px_-18px_rgba(58,38,24,0.5)]",
                )}
              >
                <img
                  src={photo.src}
                  alt={altFor(photo, index)}
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "w-full object-cover transition-transform duration-700 group-enabled:group-hover:scale-[1.03]",
                    layout === "arches" && "aspect-[4/5] rounded-t-full rounded-b-xl",
                    layout === "minimal" &&
                      (index === 0 && photos.length > 2 ? "aspect-[4/3] rounded-[20px]" : "aspect-square rounded-[20px]"),
                    layout === "polaroid" && "aspect-square rounded-sm",
                  )}
                />
              </button>
            </Reveal>
          );
        })}
      </div>

      <AnimatePresence>
        {openIndex !== null && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Foto ampliada"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={close}
          >
            <img
              src={photos[openIndex].src}
              alt={altFor(photos[openIndex], openIndex)}
              className="max-h-[85svh] max-w-full rounded-xl object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              autoFocus
              onClick={close}
              aria-label="Fechar foto"
              className="absolute right-4 top-4 flex size-12 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
            >
              <X className="size-6" />
            </button>
            {photos.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                  aria-label="Foto anterior"
                  className="absolute left-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronLeft className="size-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                  aria-label="Próxima foto"
                  className="absolute right-3 top-1/2 flex size-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                >
                  <ChevronRight className="size-6" />
                </button>
                <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-sm text-white/80">
                  {openIndex + 1} de {photos.length}
                </p>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
