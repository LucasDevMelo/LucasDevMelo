"use client";

import { motion } from "framer-motion";
import { ExternalLink, Heart, Plus } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { MantleMark, Sparkle } from "@/components/brand/ornaments";
import { LocalDemoNotice } from "@/components/layout/local-demo-notice";
import { PageLoading } from "@/components/layout/page-loading";
import { ShareButtons } from "@/components/tribute/share-buttons";
import { Button } from "@/components/ui/button";
import { useTribute } from "@/hooks/use-tribute";
import { track } from "@/lib/analytics";

export function SuccessView({ slug }: { slug: string }) {
  const state = useTribute(slug);

  if (state.status === "loading") return <PageLoading />;

  if (state.status === "not_found" || !state.tribute.paid) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <MantleMark className="size-14 text-marian-600" />
        <h1 className="mt-6 font-serif text-4xl font-semibold text-navy-900">Homenagem não encontrada</h1>
        <p className="mt-3 max-w-md text-ink-600">
          Não encontramos uma homenagem finalizada com este endereço neste navegador.
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/criar">Criar homenagem</Link>
        </Button>
      </div>
    );
  }

  const { tribute } = state;
  const path = `/homenagem/${tribute.slug}`;
  const url = `${window.location.origin}${path}`;

  return (
    <div className="min-h-svh bg-[radial-gradient(ellipse_at_50%_0%,#e3ecf8_0%,#fdfbf7_55%)]">
      <header className="mx-auto flex h-16 max-w-xl items-center px-4 sm:px-6">
        <Logo className="[&_span]:text-xl" />
      </header>
      <main className="mx-auto max-w-xl px-4 pb-16 pt-6 sm:px-6 sm:pt-10">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          <div className="relative mx-auto flex size-20 items-center justify-center rounded-full bg-navy-900 text-gold-300 shadow-lifted">
            <Heart className="size-8" fill="currentColor" aria-hidden="true" />
            <Sparkle className="absolute -right-2 -top-1 size-5 animate-twinkle text-gold-500" aria-hidden="true" />
            <Sparkle className="absolute -left-3 bottom-1 size-3.5 animate-twinkle text-gold-500 [animation-delay:1s]" aria-hidden="true" />
          </div>
          <h1 className="mt-8 font-serif text-[2.6rem] font-semibold leading-tight text-navy-900 sm:text-5xl">
            Sua homenagem está pronta 💙
          </h1>
          <p className="mt-3 text-lg text-ink-600">
            Agora é só enviar o link para <strong className="text-navy-900">{tribute.recipientName}</strong>.
          </p>
        </motion.div>

        <div className="mt-10 rounded-3xl border border-navy-900/10 bg-white p-5 shadow-soft sm:p-7">
          <label htmlFor="tribute-link" className="text-sm font-medium text-navy-900">
            Link da homenagem
          </label>
          <input
            id="tribute-link"
            readOnly
            value={url}
            onFocus={(e) => e.currentTarget.select()}
            className="mt-2 h-12 w-full truncate rounded-2xl border border-navy-900/10 bg-cream-50 px-4 text-sm text-navy-900"
          />
          <Button asChild variant="gold" size="lg" className="mt-4 w-full">
            <Link href={path}>
              <ExternalLink aria-hidden="true" /> Ver homenagem
            </Link>
          </Button>
          <ShareButtons url={url} recipientName={tribute.recipientName} className="mt-3" />
        </div>

        <LocalDemoNotice className="mt-6">
          <strong className="font-semibold">Versão local:</strong> este link abre apenas neste navegador, onde a
          homenagem foi salva. Na versão oficial, ele funcionará em qualquer aparelho.
        </LocalDemoNotice>

        <div className="mt-10 rounded-3xl bg-navy-900 p-7 text-center text-cream-50">
          <Sparkle className="mx-auto size-5 text-gold-300" aria-hidden="true" />
          <h2 className="mt-3 font-serif text-3xl font-semibold">Crie outra para alguém especial</h2>
          <p className="mt-2 text-cream-100/75">Pai, avó, madrinha, um amigo… tem mais alguém que merece esse carinho?</p>
          <Button asChild variant="gold" size="lg" className="mt-6 w-full sm:w-auto">
            <Link href="/criar" onClick={() => track("create_another_clicked", { source: "success" })}>
              <Plus aria-hidden="true" /> Criar outra homenagem
            </Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
