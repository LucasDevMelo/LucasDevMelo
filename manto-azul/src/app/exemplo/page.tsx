import { ArrowRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageViewTracker } from "@/components/layout/page-view-tracker";
import { TributeRenderer } from "@/components/tribute/tribute-renderer";
import { getDemoTribute } from "@/data/demo-tribute";
import { TEMPLATE_IDS, type TemplateId } from "@/types/tribute";

export const metadata: Metadata = {
  title: "Exemplo de homenagem",
  description: "Veja um exemplo fictício de homenagem digital para o Dia de Nossa Senhora Aparecida.",
};

export default async function ExamplePage({ searchParams }: PageProps<"/exemplo">) {
  const { estilo } = await searchParams;
  const template = TEMPLATE_IDS.includes(estilo as TemplateId) ? (estilo as TemplateId) : undefined;

  return (
    <main>
      <PageViewTracker event="tribute_viewed" props={{ demo: true, template: template ?? "classico-mariano" }} />
      <TributeRenderer key={template} tribute={getDemoTribute(template)} mode="page" />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
        <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/10 bg-navy-950/90 py-1.5 pl-4 pr-1.5 text-sm text-cream-50 shadow-lifted backdrop-blur-md">
          <span className="hidden min-[380px]:inline">Exemplo fictício</span>
          <Link
            href="/criar"
            className="inline-flex h-10 items-center gap-1.5 rounded-full bg-gold-500 px-4 font-medium text-navy-950 hover:bg-gold-300"
          >
            Criar a minha <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </main>
  );
}
