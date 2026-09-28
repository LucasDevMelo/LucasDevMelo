"use client";

import { motion } from "framer-motion";
import { Heart } from "lucide-react";
import { Sparkle } from "@/components/brand/ornaments";
import type { TemplateDefinition } from "@/lib/templates";
import { TemplateOrnament } from "./template-ornament";

interface OpeningVeilProps {
  senderName: string;
  template: TemplateDefinition;
  onOpen: () => void;
}

/** Full-screen "envelope" shown before the tribute is revealed. */
export function OpeningVeil({ senderName, template, onOpen }: OpeningVeilProps) {
  return (
    <motion.div
      className="@container fixed inset-0 z-40 flex flex-col items-center justify-center overflow-hidden bg-[var(--t-bg)] px-6 text-center text-[var(--t-ink)]"
      style={template.vars}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.04, filter: "blur(6px)" }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      role="region"
      aria-label="Abertura da homenagem"
    >
      <div
        aria-hidden="true"
        className="absolute left-1/2 top-1/2 size-[36rem] -translate-x-1/2 -translate-y-1/2 animate-glow rounded-full"
        style={{ background: "radial-gradient(circle, var(--t-glow) 0%, transparent 62%)" }}
      />
      <Sparkle aria-hidden="true" className="absolute left-[14%] top-[18%] size-3 animate-twinkle text-[var(--t-accent)]" />
      <Sparkle aria-hidden="true" className="absolute right-[16%] top-[26%] size-4 animate-twinkle text-[var(--t-accent)] [animation-delay:1s]" />
      <Sparkle aria-hidden="true" className="absolute bottom-[22%] left-[20%] size-3 animate-twinkle text-[var(--t-accent)] [animation-delay:2s]" />

      <motion.div
        className="relative flex max-w-sm flex-col items-center"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
      >
        <TemplateOrnament ornament={template.ornament} />
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.3em] text-[var(--t-accent)]">
          12 de outubro
        </p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight">
          Você recebeu uma homenagem especial
        </h1>
        <p className="mt-4 text-lg text-[var(--t-muted)]">
          Preparada com carinho por <strong className="font-semibold text-[var(--t-ink)]">{senderName}</strong>
        </p>
        <button
          type="button"
          autoFocus
          onClick={onOpen}
          className="mt-10 inline-flex h-14 items-center gap-2 rounded-full bg-[var(--t-accent)] px-8 text-base font-semibold text-[var(--t-bg)] shadow-[0_12px_30px_-10px_var(--t-accent)] transition hover:brightness-110 active:scale-[0.98]"
        >
          <Heart className="size-5" aria-hidden="true" />
          Abrir homenagem
        </button>
      </motion.div>
    </motion.div>
  );
}
