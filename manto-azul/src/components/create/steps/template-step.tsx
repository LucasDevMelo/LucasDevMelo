"use client";

import { Check } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError } from "@/components/ui/input";
import { TemplateOrnament } from "@/components/tribute/template-ornament";
import { templateList } from "@/lib/templates";
import { cn } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";

export function TemplateStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TributeFormValues>();
  const selected = useWatch({ control, name: "template" });
  const name = useWatch({ control, name: "recipientName" }) || "Maria";

  return (
    <fieldset>
      <legend className="sr-only">Estilo da homenagem</legend>
      <div className="grid gap-4 sm:grid-cols-3">
        {templateList.map((template) => {
          const isSelected = selected === template.id;
          return (
            <label key={template.id} className="relative block">
              <input type="radio" value={template.id} className="peer sr-only" {...register("template")} />
              <span
                className={cn(
                  "block cursor-pointer overflow-hidden rounded-3xl border-2 bg-white transition peer-focus-visible:ring-4 peer-focus-visible:ring-marian-500/30",
                  isSelected ? "border-navy-900 shadow-lifted" : "border-transparent shadow-soft hover:border-navy-900/20",
                )}
              >
                <span
                  className="@container relative flex aspect-[5/4] flex-col items-center justify-center overflow-hidden bg-[var(--t-bg)] px-4 text-center text-[var(--t-ink)] sm:aspect-[4/5]"
                  style={template.vars}
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{ background: "radial-gradient(circle at 50% 35%, var(--t-glow) 0%, transparent 60%)" }}
                  />
                  <TemplateOrnament ornament={template.ornament} className="relative !w-16" />
                  <span className="relative mt-3 text-[9px] font-semibold uppercase tracking-[0.25em] text-[var(--t-accent)]">
                    Uma homenagem para
                  </span>
                  <span className="relative mt-1 max-w-full truncate font-serif text-3xl font-semibold">{name}</span>
                </span>
                <span className="flex items-start justify-between gap-3 p-4">
                  <span>
                    <span className="block font-serif text-xl font-semibold text-navy-900">{template.name}</span>
                    <span className="mt-1 block text-sm leading-snug text-ink-600">{template.description}</span>
                    <span className="mt-3 flex gap-1.5" aria-hidden="true">
                      {template.swatches.map((c) => (
                        <span key={c} className="size-4 rounded-full border border-black/10" style={{ background: c }} />
                      ))}
                    </span>
                  </span>
                  <span
                    className={cn(
                      "flex size-7 shrink-0 items-center justify-center rounded-full border-2 transition",
                      isSelected ? "border-navy-900 bg-navy-900 text-white" : "border-navy-900/20",
                    )}
                    aria-hidden="true"
                  >
                    {isSelected && <Check className="size-4" />}
                  </span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      <FieldError id="template-error" message={errors.template?.message} />
    </fieldset>
  );
}
