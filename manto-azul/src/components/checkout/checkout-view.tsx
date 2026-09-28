"use client";

import { ArrowLeft, FlaskConical, Loader2, Lock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { MantleMark } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";
import { productConfig } from "@/config/product";
import { track } from "@/lib/analytics";
import { formatPrice } from "@/lib/format";
import { paymentService } from "@/lib/payments";
import { draftRepository, tributeRepository } from "@/lib/repositories";
import { StorageQuotaError } from "@/lib/storage/browser-storage";
import { tributeContentSchema } from "@/lib/validation/tribute-schema";
import type { Tribute, TributeContent } from "@/types/tribute";
import { CheckoutSummary } from "./checkout-summary";

function loadCheckout() {
  const draft = draftRepository.load();
  if (!draft) return { draft: null, content: null };
  const parsed = tributeContentSchema.safeParse(draft.values);
  return { draft, content: parsed.success ? (parsed.data as TributeContent) : null };
}

export function CheckoutView() {
  const router = useRouter();
  const [{ draft, content }] = useState(loadCheckout);
  const [status, setStatus] = useState<"idle" | "processing" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (content) track("checkout_started", { template: content.template, photos: content.photos.length });
  }, [content]);

  if (!draft || !content) {
    return (
      <div className="flex min-h-svh flex-col items-center justify-center bg-cream-50 px-6 text-center">
        <MantleMark className="size-14 text-marian-600" />
        <h1 className="mt-6 font-serif text-4xl font-semibold text-navy-900">
          {draft ? "Falta pouco para finalizar" : "Nenhuma homenagem em andamento"}
        </h1>
        <p className="mt-3 max-w-md text-ink-600">
          {draft
            ? "Alguns campos da sua homenagem ainda precisam ser preenchidos antes do pagamento."
            : "Crie sua homenagem primeiro — depois você volta aqui para finalizar."}
        </p>
        <Button asChild size="lg" className="mt-8">
          <Link href="/criar">{draft ? "Continuar editando" : "Criar homenagem"}</Link>
        </Button>
      </div>
    );
  }

  async function pay() {
    if (!draft || !content) return;
    setStatus("processing");
    setError(null);
    try {
      // 1. Create (or reuse) a pending tribute — mirrors the real Mercado Pago flow.
      let tribute: Tribute | null = draft.pendingTributeId
        ? await tributeRepository.getById(draft.pendingTributeId)
        : null;
      if (tribute && !tribute.paid) {
        tribute = await tributeRepository.update(tribute.id, content);
      } else {
        tribute = await tributeRepository.create({ ...content, paid: false });
      }
      try {
        draftRepository.save({ values: draft.values, step: draft.step, pendingTributeId: tribute.id });
      } catch {
        // Draft is only a convenience here; the tribute itself is already saved.
      }

      // 2. Payment (simulated in V1).
      const result = await paymentService.startPayment({
        tributeId: tribute.id,
        amountInCents: productConfig.priceInCents,
        description: `${productConfig.offerName} para ${content.recipientName}`,
      });
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      if (result.status !== "approved") throw new Error("Pagamento não aprovado.");

      track("purchase_completed", {
        template: content.template,
        photos: content.photos.length,
        value: productConfig.priceInCents / 100,
      });
      draftRepository.clear();
      router.replace(`/sucesso/${tribute.slug}`);
    } catch (e) {
      setStatus("error");
      setError(
        e instanceof StorageQuotaError
          ? "O espaço do navegador acabou. Remova algumas fotos da homenagem ou apague homenagens antigas nos dados do navegador e tente novamente."
          : "Algo deu errado ao finalizar. Tente novamente em instantes.",
      );
    }
  }

  const price = formatPrice();

  return (
    <div className="min-h-svh bg-cream-50">
      <header className="border-b border-navy-900/5">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-4 sm:px-6">
          <Logo className="[&_span]:text-xl" />
          <span className="flex items-center gap-1.5 text-xs text-ink-600">
            <Lock className="size-3.5" aria-hidden="true" /> Checkout
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-14">
        <Link
          href="/criar"
          className="inline-flex items-center gap-1.5 rounded-full py-2 pr-3 text-sm text-ink-600 hover:text-navy-900"
        >
          <ArrowLeft className="size-4" aria-hidden="true" /> Voltar para a homenagem
        </Link>
        <h1 className="mt-4 font-serif text-4xl font-semibold text-navy-900 sm:text-5xl">Finalizar homenagem</h1>
        <p className="mt-2 text-ink-600">Confira o resumo e conclua para receber o link da homenagem.</p>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_300px] md:items-start">
          <CheckoutSummary tribute={content} />

          <div className="space-y-4 md:sticky md:top-6">
            {paymentService.isSimulated && (
              <div role="note" className="rounded-3xl border-2 border-dashed border-gold-500 bg-gold-100 p-5 text-navy-900">
                <p className="flex items-center gap-2 font-semibold">
                  <FlaskConical className="size-5 text-gold-600" aria-hidden="true" />
                  Ambiente local — nenhum pagamento será realizado.
                </p>
                <p className="mt-2 text-sm text-ink-600">
                  Este checkout é apenas uma simulação para testar o fluxo. Nenhum dado de pagamento é solicitado ou
                  enviado.
                </p>
              </div>
            )}

            <Button size="lg" className="w-full" onClick={pay} disabled={status === "processing"}>
              {status === "processing" ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" /> Processando…
                </>
              ) : paymentService.isSimulated ? (
                `Simular pagamento de ${price}`
              ) : (
                `Pagar ${price}`
              )}
            </Button>
            <p className="sr-only" aria-live="polite">
              {status === "processing" ? "Processando pagamento simulado" : ""}
            </p>
            {error && (
              <p role="alert" className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                {error}
              </p>
            )}
            <p className="text-center text-xs text-ink-400">{productConfig.paymentLabel} · sem assinatura</p>
          </div>
        </div>
      </main>
    </div>
  );
}
