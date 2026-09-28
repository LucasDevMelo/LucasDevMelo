import { Check } from "lucide-react";
import Link from "next/link";
import { Sparkle } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";
import { formatPrice } from "@/lib/format";
import { SectionHeading } from "./section-heading";

const INCLUDED = [
  "Página personalizada",
  `Até ${productConfig.maxPhotos} fotos`,
  "Mensagem personalizada",
  "Animações suaves",
  "Link exclusivo",
  "Compartilhamento fácil",
];

export function Pricing() {
  const price = formatPrice();
  return (
    <section id="precos" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="Preço" title="Um valor simples, sem surpresas" />
        <div className="relative mx-auto mt-14 max-w-md overflow-hidden rounded-[32px] bg-navy-900 p-8 text-cream-50 shadow-lifted sm:p-10">
          <div
            aria-hidden="true"
            className="absolute -right-24 -top-24 size-72 rounded-full bg-[radial-gradient(circle,#d9b86c55_0%,transparent_65%)]"
          />
          <p className="flex items-center gap-2 text-sm font-medium text-gold-300">
            <Sparkle className="size-3.5" aria-hidden="true" />
            {productConfig.offerName}
          </p>
          <p className="mt-5 flex items-baseline gap-2">
            <span className="font-serif text-6xl font-semibold tracking-tight">{price}</span>
          </p>
          <p className="mt-1 text-sm text-cream-100/70">{productConfig.paymentLabel} · sem assinatura</p>
          <ul className="mt-8 space-y-3.5">
            {INCLUDED.map((item) => (
              <li key={item} className="flex items-center gap-3">
                <span className="flex size-6 items-center justify-center rounded-full bg-gold-500/20">
                  <Check className="size-3.5 text-gold-300" aria-hidden="true" />
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button asChild variant="gold" size="lg" className="mt-10 w-full">
            <Link href="/criar">Criar homenagem por {price}</Link>
          </Button>
          <p className="mt-4 text-center text-xs text-cream-100/60">
            Você vê a pré-visualização completa antes de pagar.
          </p>
        </div>
      </div>
    </section>
  );
}
