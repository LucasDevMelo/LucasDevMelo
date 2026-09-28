import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { CrownOrnament } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";

export function FinalCta() {
  return (
    <section className="px-4 pb-20 sm:px-6 sm:pb-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-[36px] bg-gradient-to-br from-marian-100 via-cream-100 to-gold-100 px-6 py-16 text-center sm:px-12 sm:py-20">
        <CrownOrnament className="mx-auto w-20 text-gold-500" />
        <h2 className="mx-auto mt-6 max-w-2xl text-balance font-serif text-4xl font-semibold leading-tight text-navy-900 sm:text-5xl">
          Neste 12 de outubro, diga o que o coração sente.
        </h2>
        <p className="mx-auto mt-4 max-w-lg text-lg text-ink-600">
          Uma lembrança feita por você, para quem sempre esteve ao seu lado.
        </p>
        <Button asChild size="lg" className="mt-9 w-full sm:w-auto">
          <Link href="/criar">
            Começar minha homenagem <ArrowRight />
          </Link>
        </Button>
      </div>
    </section>
  );
}
