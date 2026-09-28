"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, CheckCircle2, CloudOff, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Logo } from "@/components/brand/logo";
import { LocalDemoNotice } from "@/components/layout/local-demo-notice";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { formatPrice } from "@/lib/format";
import { track } from "@/lib/analytics";
import { draftRepository } from "@/lib/repositories";
import { StorageQuotaError } from "@/lib/storage/browser-storage";
import { cn } from "@/lib/utils";
import { tributeContentSchema, type TributeFormValues } from "@/lib/validation/tribute-schema";
import { defaultTributeValues } from "./default-values";
import { DetailsStep } from "./steps/details-step";
import { MessageStep } from "./steps/message-step";
import { PhotosStep } from "./steps/photos-step";
import { PreviewStep } from "./steps/preview-step";
import { RecipientStep } from "./steps/recipient-step";
import { TemplateStep } from "./steps/template-step";
import { WizardProgress } from "./wizard-progress";
import { WIZARD_STEPS } from "./wizard-steps";

type SaveState = "idle" | "saved" | "error";

const PREVIEW_STEP = WIZARD_STEPS.length - 1;

function loadInitial() {
  const draft = draftRepository.load();
  return {
    hadDraft: !!draft,
    values: { ...defaultTributeValues, ...draft?.values },
    step: Math.min(draft?.step ?? 0, PREVIEW_STEP),
  };
}

export function CreateWizard() {
  const router = useRouter();
  const [initial] = useState(loadInitial);
  const [step, setStep] = useState(initial.step);
  const [maxReached, setMaxReached] = useState(initial.step);
  const [saveState, setSaveState] = useState<SaveState>(initial.hadDraft ? "saved" : "idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const stepRef = useRef(step);

  const methods = useForm<TributeFormValues>({
    resolver: zodResolver(tributeContentSchema),
    defaultValues: initial.values,
    mode: "onChange",
  });
  const { getValues, trigger, subscribe } = methods;

  const persist = useCallback((): string | null => {
    try {
      draftRepository.save({ values: getValues(), step: stepRef.current });
      setSaveState("saved");
      setSaveError(null);
      return null;
    } catch (error) {
      const msg =
        error instanceof StorageQuotaError
          ? "O espaço do navegador acabou e não conseguimos salvar essa foto. Tente remover alguma foto ou usar imagens menores."
          : "Não foi possível salvar o rascunho neste navegador.";
      setSaveState("error");
      setSaveError(msg);
      return msg;
    }
  }, [getValues]);

  // Analytics: creation started (once per new draft).
  useEffect(() => {
    if (!initial.hadDraft) track("create_started");
  }, [initial.hadDraft]);

  // Autosave (debounced) on every change.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let lastTemplate = getValues("template");
    const unsubscribe = subscribe({
      formState: { values: true },
      callback: ({ values }) => {
        if (values.template && values.template !== lastTemplate) {
          lastTemplate = values.template;
          track("template_selected", { template: values.template });
        }
        clearTimeout(timer);
        timer = setTimeout(persist, 400);
      },
    });
    return () => {
      clearTimeout(timer);
      unsubscribe();
    };
  }, [subscribe, getValues, persist]);

  const goTo = useCallback(
    (next: number) => {
      stepRef.current = next;
      setStep(next);
      setMaxReached((m) => Math.max(m, next));
      persist();
      if (next === PREVIEW_STEP) track("preview_viewed", { template: getValues("template") });
      window.scrollTo({ top: 0, behavior: "smooth" });
      requestAnimationFrame(() => headingRef.current?.focus({ preventScroll: true }));
    },
    [persist, getValues],
  );

  async function next() {
    const fields = WIZARD_STEPS[step].fields;
    const valid = fields.length ? await trigger(fields, { shouldFocus: true }) : true;
    if (valid) goTo(step + 1);
  }

  async function finish() {
    const valid = await trigger();
    if (!valid) {
      const errors = methods.formState.errors;
      const firstInvalid = WIZARD_STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
      if (firstInvalid >= 0) goTo(firstInvalid);
      return;
    }
    setSubmitting(true);
    if (persist()) {
      setSubmitting(false);
      return;
    }
    router.push("/checkout");
  }

  function restart() {
    draftRepository.clear();
    methods.reset(defaultTributeValues);
    stepRef.current = 0;
    setStep(0);
    setMaxReached(0);
    setSaveState("idle");
    setSaveError(null);
    track("create_started", { restarted: true });
    window.scrollTo({ top: 0 });
  }

  const meta = WIZARD_STEPS[step];
  const isPreview = step === PREVIEW_STEP;

  return (
    <FormProvider {...methods}>
      <div className="min-h-svh bg-cream-50">
        <header className="sticky top-0 z-30 border-b border-navy-900/5 bg-cream-50/90 backdrop-blur-md">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-3 px-4 sm:px-6">
            <Logo className="[&_span]:text-xl" />
            <div className="flex items-center gap-1 sm:gap-3">
              <span className="hidden items-center gap-1.5 text-xs text-ink-400 sm:flex" aria-live="polite">
                {saveState === "saved" && (
                  <>
                    <CheckCircle2 className="size-3.5 text-green-700" aria-hidden="true" /> Rascunho salvo
                  </>
                )}
                {saveState === "error" && (
                  <>
                    <CloudOff className="size-3.5 text-red-700" aria-hidden="true" /> Não salvo
                  </>
                )}
              </span>
              <ConfirmDialog
                trigger={
                  <Button variant="ghost" size="sm" className="text-ink-600">
                    <RotateCcw aria-hidden="true" /> Começar novamente
                  </Button>
                }
                title="Começar do zero?"
                description="Tudo o que você preencheu, incluindo as fotos, será apagado deste navegador. Essa ação não pode ser desfeita."
                confirmLabel="Apagar e recomeçar"
                onConfirm={restart}
              />
            </div>
          </div>
        </header>

        <main className={cn("mx-auto px-4 pt-6 sm:px-6 sm:pt-10", isPreview ? "max-w-5xl pb-48" : "max-w-2xl pb-36")}>
          <div className={cn(isPreview && "mx-auto max-w-2xl")}>
            <WizardProgress current={step} maxReached={maxReached} onJump={goTo} />
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.section
              key={meta.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              aria-labelledby="step-title"
              className="mt-8 sm:mt-10"
            >
              <div className={cn("mb-8", isPreview && "text-center")}>
                <h1
                  id="step-title"
                  ref={headingRef}
                  tabIndex={-1}
                  className="font-serif text-[2.1rem] font-semibold leading-tight text-navy-900 outline-none sm:text-5xl"
                >
                  {meta.title}
                </h1>
                <p className="mt-2 text-ink-600 sm:text-lg">{meta.description}</p>
              </div>

              {saveError && step !== 2 && (
                <p role="alert" className="mb-6 rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">
                  {saveError}
                </p>
              )}

              <form
                noValidate
                onSubmit={(e) => {
                  e.preventDefault();
                  if (isPreview) finish();
                  else next();
                }}
              >
                {step === 0 && <RecipientStep />}
                {step === 1 && <TemplateStep />}
                {step === 2 && <PhotosStep persistNow={persist} />}
                {step === 3 && <MessageStep />}
                {step === 4 && <DetailsStep />}
                {step === 5 && <PreviewStep />}

                {isPreview && (
                  <LocalDemoNotice className="mx-auto mt-8 max-w-2xl" />
                )}

                <div className="fixed inset-x-0 bottom-0 z-20 border-t border-navy-900/8 bg-white/95 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-md">
                  <div
                    className={cn(
                      "mx-auto flex items-center gap-3 px-4 sm:px-6",
                      isPreview ? "max-w-2xl flex-col-reverse sm:flex-row" : "max-w-2xl",
                    )}
                  >
                    {step > 0 && (
                      <Button
                        variant="outline"
                        size="lg"
                        onClick={() => goTo(step - 1)}
                        className={cn(isPreview ? "w-full sm:w-auto" : "px-5")}
                        aria-label={isPreview ? undefined : "Voltar"}
                      >
                        <ArrowLeft />
                        <span className={cn(!isPreview && "sr-only sm:not-sr-only")}>
                          {isPreview ? "Voltar e editar" : "Voltar"}
                        </span>
                      </Button>
                    )}
                    <Button
                      type="submit"
                      size="lg"
                      className={cn(isPreview ? "w-full sm:flex-1" : "flex-1")}
                      disabled={submitting}
                    >
                      {isPreview ? `Finalizar homenagem · ${formatPrice()}` : "Continuar"}
                      <ArrowRight />
                    </Button>
                  </div>
                </div>
              </form>
            </motion.section>
          </AnimatePresence>
        </main>
      </div>
    </FormProvider>
  );
}
