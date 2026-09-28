import { ChevronDown } from "lucide-react";
import { productConfig } from "@/config/product";
import { formatPrice } from "@/lib/format";
import { SectionHeading } from "./section-heading";

const FAQ_ITEMS = [
  {
    q: "Quanto tempo a página fica disponível?",
    a: productConfig.isLocalDemo
      ? "Na versão oficial, o prazo de disponibilidade será informado claramente antes do pagamento. Nesta versão de demonstração, a homenagem fica salva apenas no navegador em que foi criada e permanece lá até que os dados do navegador sejam apagados."
      : "O prazo de disponibilidade é informado antes do pagamento.",
  },
  {
    q: "Posso alterar depois?",
    a: "Antes de finalizar, você revisa tudo na pré-visualização e pode voltar para editar quantas vezes quiser. Depois de finalizada, a homenagem não pode ser editada nesta versão — por isso capriche na revisão!",
  },
  {
    q: "Quantas fotos posso adicionar?",
    a: `Até ${productConfig.maxPhotos} fotos. Elas são otimizadas automaticamente para carregar rápido no celular. As fotos são opcionais.`,
  },
  {
    q: "Como envio para outra pessoa?",
    a: "Ao finalizar, você recebe um link exclusivo. É só tocar em “Compartilhar” ou “Copiar link” e enviar pelo WhatsApp, Instagram, SMS ou e-mail.",
  },
  {
    q: "Preciso instalar algum aplicativo?",
    a: "Não. Tudo funciona direto no navegador do celular ou do computador — para você criar e para a pessoa receber.",
  },
  {
    q: "Quanto custa?",
    a: `${formatPrice()} por homenagem, em ${productConfig.paymentLabel.toLowerCase()}. Não é assinatura e não há cobranças recorrentes.`,
  },
  {
    q: "A homenagem tem vínculo com alguma instituição religiosa?",
    a: `Não. O ${productConfig.productName} é um serviço independente de homenagens digitais personalizadas, criado para ajudar você a expressar carinho e gratidão nesta data especial.`,
  },
];

export function Faq() {
  return (
    <section id="duvidas" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <SectionHeading eyebrow="Dúvidas" title="Perguntas frequentes" />
        <div className="mt-12 divide-y divide-navy-900/10 rounded-3xl border border-navy-900/10 bg-white">
          {FAQ_ITEMS.map((item) => (
            <details key={item.q} className="group px-5 sm:px-7">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left text-[17px] font-medium text-navy-900 [&::-webkit-details-marker]:hidden">
                {item.q}
                <ChevronDown
                  className="size-5 shrink-0 text-gold-600 transition-transform duration-300 group-open:rotate-180"
                  aria-hidden="true"
                />
              </summary>
              <p className="-mt-1 pb-6 leading-relaxed text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
