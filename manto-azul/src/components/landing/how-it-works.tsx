import { ImagePlus, Palette, Send } from "lucide-react";
import { SectionHeading } from "./section-heading";

const STEPS = [
  {
    icon: Palette,
    title: "Escolha o estilo",
    text: "Três estilos pensados para a data: clássico, delicado ou afetuoso. Você vê como fica antes de decidir.",
  },
  {
    icon: ImagePlus,
    title: "Personalize com fotos e mensagem",
    text: "Adicione até 5 fotos e escreva do seu jeito — ou comece por uma das nossas sugestões de mensagem.",
  },
  {
    icon: Send,
    title: "Receba seu link e compartilhe",
    text: "Sua homenagem ganha um link exclusivo, pronto para enviar pelo WhatsApp, Instagram ou onde preferir.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="scroll-mt-20 bg-white py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Como funciona"
          title="Três passos para emocionar"
          description="Sem cadastro complicado e sem instalar nada. Tudo pelo celular, em poucos minutos."
        />
        <ol className="mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="relative rounded-3xl border border-navy-900/8 bg-cream-50 p-7 sm:p-8">
              <span className="absolute right-6 top-5 font-serif text-6xl font-semibold text-navy-900/[0.06]" aria-hidden="true">
                {i + 1}
              </span>
              <span className="flex size-12 items-center justify-center rounded-2xl bg-navy-900 text-gold-300">
                <step.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Passo {i + 1}</p>
              <h3 className="mt-2 font-serif text-2xl font-semibold text-navy-900">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-ink-600">{step.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
