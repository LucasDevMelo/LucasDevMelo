"use client";

import { Music, Sparkles, Stars, Wand2 } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { cn } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";

type ToggleKey = "openingAnimation" | "decorations" | "visualEffect";

const OPTIONS: { key: ToggleKey; icon: typeof Sparkles; title: string; text: string }[] = [
  {
    key: "openingAnimation",
    icon: Wand2,
    title: "Animação suave ao abrir",
    text: "A pessoa vê uma tela de abertura e o conteúdo surge com delicadeza.",
  },
  {
    key: "decorations",
    icon: Stars,
    title: "Pequenos elementos decorativos",
    text: "Estrelinhas e pontos de luz discretos ao redor da homenagem.",
  },
  {
    key: "visualEffect",
    icon: Sparkles,
    title: "Efeito visual discreto",
    text: "Um brilho suave no nome e na luz de fundo.",
  },
];

export function DetailsStep() {
  const { control, setValue } = useFormContext<TributeFormValues>();
  const settings = useWatch({ control, name: "settings" });

  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => {
        const checked = settings?.[opt.key] ?? true;
        const id = `toggle-${opt.key}`;
        return (
          <div key={opt.key} className="flex items-center gap-4 rounded-3xl border border-navy-900/10 bg-white p-5">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-marian-50 text-marian-600">
              <opt.icon className="size-5" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p id={`${id}-label`} className="font-medium text-navy-900">
                {opt.title}
              </p>
              <p id={`${id}-desc`} className="mt-0.5 text-sm text-ink-600">
                {opt.text}
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={checked}
              aria-labelledby={`${id}-label`}
              aria-describedby={`${id}-desc`}
              onClick={() => setValue(`settings.${opt.key}`, !checked, { shouldDirty: true })}
              className={cn(
                "relative h-8 w-14 shrink-0 rounded-full transition-colors",
                checked ? "bg-navy-900" : "bg-navy-900/15",
              )}
            >
              <span
                className={cn(
                  "absolute top-1 size-6 rounded-full bg-white shadow transition-transform",
                  checked ? "translate-x-7" : "translate-x-1",
                )}
              />
            </button>
          </div>
        );
      })}

      <div className="flex items-center gap-4 rounded-3xl border border-dashed border-navy-900/15 bg-cream-100/60 p-5">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-white text-ink-400">
          <Music className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-navy-900">
            Música de fundo <span className="ml-1 rounded-full bg-gold-100 px-2 py-0.5 text-xs text-gold-600">Em breve</span>
          </p>
          <p className="mt-0.5 text-sm text-ink-600">
            Estamos selecionando trilhas instrumentais com licença de uso adequada.
          </p>
        </div>
      </div>
    </div>
  );
}
