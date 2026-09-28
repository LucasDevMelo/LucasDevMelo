"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Heart } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Divider, Sparkle } from "@/components/brand/ornaments";
import { productConfig } from "@/config/product";
import { track } from "@/lib/analytics";
import { relationshipPhrase } from "@/lib/relationships";
import { templates } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { TributeContent } from "@/types/tribute";
import { FloatingLights } from "./floating-lights";
import { OpeningVeil } from "./opening-veil";
import { PhotoGallery } from "./photo-gallery";
import { Reveal } from "./reveal";
import { TemplateOrnament } from "./template-ornament";

export type RendererMode = "page" | "embedded" | "mockup";

interface TributeRendererProps {
  tribute: TributeContent;
  /**
   * page: the real, full-screen tribute (with opening veil).
   * embedded: preview inside the wizard (scroll container, no veil).
   * mockup: static marketing preview (non-interactive).
   */
  mode?: RendererMode;
}

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export function TributeRenderer({ tribute, mode = "page" }: TributeRendererProps) {
  const template = templates[tribute.template];
  const { settings } = tribute;
  const isPage = mode === "page";
  const interactive = mode !== "mockup";
  const animate = settings.openingAnimation && mode !== "mockup";

  const [opened, setOpened] = useState(!(isPage && settings.openingAnimation));

  const subtitle = tribute.recipientNickname?.trim()
    ? `“${tribute.recipientNickname.trim()}”`
    : capitalize(relationshipPhrase(tribute.relationship, tribute.customRelationship));

  const heroItem = {
    hidden: { opacity: 0, y: 24 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 1, ease: [0.22, 1, 0.36, 1] as const, delay: 0.15 + i * 0.18 },
    }),
  };
  const heroAnimProps = (i: number) =>
    animate
      ? { variants: heroItem, custom: i, initial: "hidden", animate: opened ? "visible" : "hidden" }
      : {};

  return (
    <div
      className="@container relative isolate min-h-full overflow-hidden bg-[var(--t-bg)] text-[var(--t-ink)]"
      style={template.vars}
      data-template={template.id}
    >
      <AnimatePresence>
        {!opened && (
          <OpeningVeil senderName={tribute.senderName} template={template} onOpen={() => setOpened(true)} />
        )}
      </AnimatePresence>

      {settings.decorations && <FloatingLights fixed={isPage} floating={mode !== "mockup"} />}

      {/* HERO */}
      <section
        className={cn(
          "relative z-10 flex flex-col items-center justify-center px-6 text-center",
          isPage ? "min-h-[100svh] py-20" : mode === "embedded" ? "min-h-[640px] py-16" : "min-h-[520px] py-12",
        )}
      >
        <div
          aria-hidden="true"
          className={cn(
            "absolute left-1/2 top-[38%] -z-10 size-[30rem] -translate-x-1/2 -translate-y-1/2 rounded-full @3xl:size-[44rem]",
            settings.visualEffect && interactive && "animate-glow",
          )}
          style={{
            background: `radial-gradient(circle, var(--t-glow) 0%, transparent 60%)`,
            opacity: settings.visualEffect ? 0.8 : 0.35,
          }}
        />
        <motion.div {...heroAnimProps(0)}>
          <TemplateOrnament ornament={template.ornament} />
        </motion.div>
        <motion.p
          {...heroAnimProps(1)}
          className="mt-8 text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--t-accent)] @md:text-xs"
        >
          Uma homenagem especial para
        </motion.p>
        <motion.h1
          {...heroAnimProps(2)}
          className={cn(
            "mt-4 max-w-full font-serif text-[3.4rem] font-semibold leading-[1.02] tracking-tight [overflow-wrap:anywhere] @md:text-7xl @3xl:text-8xl",
            settings.visualEffect &&
              "bg-[linear-gradient(110deg,var(--t-ink)_35%,var(--t-accent)_50%,var(--t-ink)_65%)] bg-[length:250%_100%] bg-clip-text text-transparent",
            settings.visualEffect && interactive && "animate-shimmer",
          )}
        >
          {tribute.recipientName}
        </motion.h1>
        <motion.p {...heroAnimProps(3)} className="mt-4 font-serif text-2xl italic text-[var(--t-muted)] @md:text-3xl">
          {subtitle}
        </motion.p>
        <motion.div {...heroAnimProps(4)} className="mt-8 flex flex-col items-center gap-3">
          <Divider className="w-48 text-[var(--t-accent)]" />
          <p className="text-sm text-[var(--t-muted)]">
            {productConfig.eventDateLabel} · {productConfig.eventName}
          </p>
        </motion.div>
        {isPage && (
          <ChevronDown
            aria-hidden="true"
            className="absolute bottom-8 left-1/2 size-6 -translate-x-1/2 animate-bounce text-[var(--t-accent)] opacity-70"
          />
        )}
      </section>

      {/* MESSAGE */}
      <section className="relative z-10 px-5 pb-16 @md:px-8 @md:pb-24">
        <Reveal enabled={animate} className="mx-auto max-w-2xl">
          <h2 className="text-balance text-center font-serif text-[2.1rem] font-semibold leading-tight @md:text-5xl">
            {tribute.title}
          </h2>
          <div className="relative mt-10 rounded-[28px] border border-[var(--t-surface-border)] bg-[var(--t-surface)] px-6 pb-9 pt-12 shadow-[0_24px_60px_-36px_rgba(0,0,0,0.45)] backdrop-blur-sm @md:px-12 @md:pb-12 @md:pt-14">
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-0 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-[var(--t-surface-border)] bg-[var(--t-bg)] text-[var(--t-accent)]"
            >
              <Heart className="size-5" fill="currentColor" />
            </span>
            <p className="whitespace-pre-line text-[1.075rem] leading-[1.85] text-[var(--t-ink)] [overflow-wrap:anywhere] @md:text-[1.2rem]">
              {tribute.message}
            </p>
          </div>
        </Reveal>
      </section>

      {/* GALLERY */}
      {tribute.photos.length > 0 && (
        <section className="relative z-10 px-5 pb-20 @md:px-8 @md:pb-28" aria-label="Galeria de fotos">
          <Reveal enabled={animate} className="mb-10 text-center">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[var(--t-accent)] @md:text-xs">
              Momentos guardados no coração
            </p>
          </Reveal>
          <div className="mx-auto max-w-4xl">
            <PhotoGallery
              photos={tribute.photos}
              layout={template.gallery}
              recipientName={tribute.recipientName}
              animate={animate}
              interactive={interactive}
            />
          </div>
        </section>
      )}

      {/* REFLECTION */}
      <section className="relative z-10 overflow-hidden bg-[var(--t-bg-2)] px-6 py-20 text-center @md:py-28">
        <Reveal enabled={animate} className="mx-auto max-w-2xl">
          <Sparkle aria-hidden="true" className="mx-auto size-6 text-[var(--t-accent)]" />
          <blockquote className="mt-6 text-balance font-serif text-[1.85rem] italic leading-snug @md:text-[2.6rem]">
            {template.reflection}
          </blockquote>
          <p className="mx-auto mt-6 max-w-md text-[var(--t-muted)]">
            Neste dia de fé e devoção, celebramos o amor que nos une e a gratidão por quem faz parte da nossa história.
          </p>
        </Reveal>
      </section>

      {/* SIGNATURE */}
      <section className="relative z-10 px-6 py-20 text-center @md:py-24">
        <Reveal enabled={animate}>
          <p className="font-serif text-2xl italic text-[var(--t-muted)]">Com carinho,</p>
          <p className="mt-2 font-serif text-5xl font-semibold [overflow-wrap:anywhere] @md:text-6xl">
            {tribute.senderName}
          </p>
          <Divider className="mx-auto mt-10 w-40 text-[var(--t-accent)]" />
          <p className="mt-6 text-sm font-medium uppercase tracking-[0.22em] text-[var(--t-accent)]">
            {productConfig.eventDateLabel} • {productConfig.eventName}
          </p>
        </Reveal>
      </section>

      {/* DISCREET CTA */}
      <footer
        className={cn(
          "relative z-10 border-t border-[var(--t-surface-border)] px-6 pt-10 text-center",
          isPage ? "pb-24" : "pb-10",
        )}
      >
        {mode === "page" ? (
          <Link
            href="/criar"
            onClick={() => track("create_another_clicked", { source: "tribute_page" })}
            className="text-sm text-[var(--t-muted)] underline decoration-[var(--t-accent)] underline-offset-4 transition hover:text-[var(--t-ink)]"
          >
            Crie uma homenagem para alguém especial
          </Link>
        ) : (
          <span className="text-sm text-[var(--t-muted)] underline decoration-[var(--t-accent)] underline-offset-4">
            Crie uma homenagem para alguém especial
          </span>
        )}
        <p className="mt-3 text-xs text-[var(--t-muted)] opacity-70">Feito com {productConfig.productName}</p>
      </footer>
    </div>
  );
}
