import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getDemoTribute } from "@/data/demo-tribute";
import { templateList } from "@/lib/templates";
import { PhoneFrame } from "@/components/tribute/device-frames";
import { TributeRenderer } from "@/components/tribute/tribute-renderer";
import { SectionHeading } from "./section-heading";

export function Examples() {
  return (
    <section id="exemplos" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading
          eyebrow="Exemplos"
          title="Veja como sua homenagem pode ficar"
          description="A mesma homenagem em três estilos. Toque em um deles para abrir a experiência completa."
        />
      </div>
      <ul className="mx-auto mt-14 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-4 pb-6 sm:px-6 lg:grid lg:grid-cols-3 lg:overflow-visible">
        {templateList.map((template) => (
          <li key={template.id} className="w-[82%] max-w-[340px] shrink-0 snap-center sm:w-[340px] lg:w-auto lg:max-w-none">
            <PhoneFrame screenClassName="h-[480px]" className="max-w-[340px]" label={`Exemplo no estilo ${template.name}`}>
              <TributeRenderer tribute={getDemoTribute(template.id)} mode="mockup" />
            </PhoneFrame>
            <div className="mt-6 text-center">
              <h3 className="font-serif text-2xl font-semibold text-navy-900">{template.name}</h3>
              <p className="mx-auto mt-1 max-w-xs text-sm text-ink-600">{template.description}</p>
              <Link
                href={`/exemplo?estilo=${template.id}`}
                className="mt-3 inline-flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-medium text-marian-600 hover:bg-marian-50"
              >
                Abrir exemplo <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
