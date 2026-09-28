import { Clock, Heart, MessageCircle, Smartphone, Sparkles } from "lucide-react";
import { SectionHeading } from "./section-heading";

const BENEFITS = [
  { icon: Clock, title: "Pronta em poucos minutos", text: "Um passo a passo simples, do nome à mensagem final." },
  { icon: Sparkles, title: "Personalizada", text: "Nome, apelido, fotos, mensagem e estilo escolhidos por você." },
  { icon: MessageCircle, title: "Compartilhável pelo WhatsApp", text: "Um link bonito para enviar na conversa da família." },
  { icon: Smartphone, title: "Funciona no celular", text: "Pensada primeiro para a tela do celular, sem instalar nada." },
  { icon: Heart, title: "Feita para aquela pessoa", text: "Não é um cartão genérico: é uma página que só existe para ela." },
];

export function Benefits() {
  return (
    <section className="bg-navy-900 py-20 text-cream-50 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          tone="light"
          eyebrow="Por que presentear assim"
          title="Um presente simples que fica guardado no coração"
        />
        <ul className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {BENEFITS.map((b) => (
            <li key={b.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <b.icon className="size-6 text-gold-300" aria-hidden="true" />
              <h3 className="mt-5 font-serif text-xl font-semibold">{b.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-cream-100/70">{b.text}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
