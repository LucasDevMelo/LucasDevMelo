import { ArrowRight, Check } from "lucide-react";
import Link from "next/link";
import { Sparkle } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";
import { getDemoTribute } from "@/data/demo-tribute";
import { formatPrice } from "@/lib/format";
import { PhoneFrame } from "@/components/tribute/device-frames";
import { TributeRenderer } from "@/components/tribute/tribute-renderer";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-[46rem] bg-[radial-gradient(ellipse_at_70%_10%,#e3ecf8_0%,transparent_60%),radial-gradient(ellipse_at_10%_40%,#f6edd8_0%,transparent_55%)]"
      />
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-4 pb-20 pt-12 sm:px-6 md:pt-16 lg:grid-cols-[1.1fr_1fr] lg:gap-10 lg:pb-28 lg:pt-20">
        <div className="text-center lg:text-left">
          <p className="inline-flex items-center gap-2 rounded-full border border-gold-500/30 bg-white/70 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.18em] text-gold-600">
            <Sparkle className="size-3" />
            {productConfig.eventDateLabel} · Nossa Senhora Aparecida
          </p>
          <h1 className="mt-6 text-balance font-serif text-[2.75rem] font-semibold leading-[1.05] tracking-tight text-navy-900 sm:text-6xl lg:text-[4.1rem]">
            Transforme fé e carinho em uma homenagem <em className="text-marian-600">inesquecível</em>.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-600 lg:mx-0">
            Crie uma página personalizada, com fotos e uma mensagem do coração, para alguém especial neste Dia de
            Nossa Senhora Aparecida. Fica pronta em minutos e chega pelo WhatsApp.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <Button asChild size="lg" className="w-full sm:w-auto">
              <Link href="/criar">
                Criar minha homenagem
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto">
              <Link href="/exemplo">Ver exemplo</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-ink-600 lg:justify-start">
            {["Pronta em poucos minutos", "Funciona no celular", `${productConfig.paymentLabel} de ${formatPrice()}`].map(
              (item) => (
                <li key={item} className="flex items-center gap-1.5">
                  <Check className="size-4 text-gold-600" aria-hidden="true" />
                  {item}
                </li>
              ),
            )}
          </ul>
        </div>

        <div className="relative mx-auto w-full max-w-[340px]">
          <div
            aria-hidden="true"
            className="absolute -inset-10 -z-10 rounded-full bg-[radial-gradient(circle,#c9a45c33_0%,transparent_65%)]"
          />
          <PhoneFrame screenClassName="h-[600px]" label="Exemplo de homenagem">
            <TributeRenderer tribute={getDemoTribute()} mode="mockup" />
          </PhoneFrame>
          <div className="absolute -left-4 bottom-16 hidden rounded-2xl bg-white px-4 py-3 shadow-lifted sm:block lg:-left-14">
            <p className="text-xs text-ink-400">Nova mensagem</p>
            <p className="text-sm font-medium text-navy-900">“Filha, que presente lindo! 💙”</p>
          </div>
        </div>
      </div>
    </section>
  );
}
