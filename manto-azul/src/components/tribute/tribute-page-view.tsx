"use client";

import Link from "next/link";
import { useEffect } from "react";
import { MantleMark } from "@/components/brand/ornaments";
import { PageLoading } from "@/components/layout/page-loading";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";
import { useTribute } from "@/hooks/use-tribute";
import { track } from "@/lib/analytics";
import { TributeRenderer } from "./tribute-renderer";

function Message({ title, text, action }: { title: string; text: string; action: { href: string; label: string } }) {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center bg-navy-900 px-6 text-center text-cream-50">
      <MantleMark className="size-14 text-marian-500" />
      <h1 className="mt-6 font-serif text-4xl font-semibold">{title}</h1>
      <p className="mt-3 max-w-md text-cream-100/75">{text}</p>
      <Button asChild variant="gold" size="lg" className="mt-8">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </main>
  );
}

export function TributePageView({ slug }: { slug: string }) {
  const state = useTribute(slug);
  const ready = state.status === "ready" && state.tribute.paid;

  useEffect(() => {
    if (ready) track("tribute_viewed", { template: state.tribute.template });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- track once when it becomes ready
  }, [ready]);

  if (state.status === "loading") return <PageLoading dark label="Abrindo homenagem…" />;

  if (state.status === "not_found") {
    return (
      <Message
        title="Homenagem não encontrada"
        text={
          productConfig.isLocalDemo
            ? "Nesta versão de demonstração, as homenagens ficam salvas apenas no navegador em que foram criadas. Abra o link no mesmo aparelho e navegador."
            : "Verifique se o link está completo ou peça para quem enviou conferir o endereço."
        }
        action={{ href: "/", label: `Conhecer o ${productConfig.productName}` }}
      />
    );
  }

  if (!state.tribute.paid) {
    return (
      <Message
        title="Esta homenagem ainda não foi finalizada"
        text="Assim que o pagamento for concluído, a homenagem fica disponível neste link."
        action={{ href: "/checkout", label: "Finalizar homenagem" }}
      />
    );
  }

  return (
    <main>
      <TributeRenderer tribute={state.tribute} mode="page" />
    </main>
  );
}
