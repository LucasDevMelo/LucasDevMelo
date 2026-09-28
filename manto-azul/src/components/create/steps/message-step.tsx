"use client";

import { Sparkles } from "lucide-react";
import { useFormContext, useWatch } from "react-hook-form";
import { FieldError, Input, Label, Textarea } from "@/components/ui/input";
import { productConfig } from "@/config/product";
import { messageSuggestions, titleSuggestions } from "@/lib/message-suggestions";
import { cn } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";

export function MessageStep() {
  const {
    register,
    control,
    setValue,
    formState: { errors },
  } = useFormContext<TributeFormValues>();
  const title = useWatch({ control, name: "title" }) ?? "";
  const message = useWatch({ control, name: "message" }) ?? "";
  const max = productConfig.maxMessageLength;
  const nearLimit = message.length > max * 0.9;

  const apply = (field: "title" | "message", value: string) =>
    setValue(field, value, { shouldDirty: true, shouldValidate: true });

  return (
    <div className="space-y-9">
      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          maxLength={productConfig.maxTitleLength}
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "title-error" : undefined}
          {...register("title")}
        />
        <FieldError id="title-error" message={errors.title?.message} />
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Sugestões de título">
          {titleSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => apply("title", s)}
              aria-pressed={title === s}
              className={cn(
                "rounded-full border px-3.5 py-2 text-sm transition",
                title === s
                  ? "border-navy-900 bg-navy-900 text-white"
                  : "border-navy-900/12 bg-white text-navy-900 hover:border-navy-900/30",
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="flex items-end justify-between gap-4">
          <Label htmlFor="message">Mensagem</Label>
          <span
            className={cn("mb-2 text-sm tabular-nums", nearLimit ? "font-medium text-red-700" : "text-ink-400")}
            aria-live="polite"
          >
            {message.length}/{max}
          </span>
        </div>
        <Textarea
          id="message"
          rows={8}
          maxLength={max}
          placeholder="Escreva com o coração…"
          aria-invalid={!!errors.message}
          aria-describedby={errors.message ? "message-error" : undefined}
          {...register("message")}
        />
        <FieldError id="message-error" message={errors.message?.message} />
      </div>

      <div>
        <p className="flex items-center gap-2 text-[15px] font-medium text-navy-900">
          <Sparkles className="size-4 text-gold-600" aria-hidden="true" />
          Precisa de inspiração? Toque para usar
        </p>
        <p className="mt-1 text-sm text-ink-600">A sugestão substitui o texto atual e você pode editar à vontade.</p>
        <ul className="mt-4 grid gap-3">
          {messageSuggestions.map((s) => (
            <li key={s.id}>
              <button
                type="button"
                onClick={() => apply("message", s.text)}
                className="w-full rounded-2xl border border-navy-900/10 bg-white p-4 text-left transition hover:border-gold-500 hover:shadow-soft"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-600">{s.label}</span>
                <span className="mt-1.5 line-clamp-3 block text-[15px] leading-relaxed text-ink-600">{s.text}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <Label htmlFor="senderName">De:</Label>
        <Input
          id="senderName"
          placeholder="Seu nome ou como a pessoa te chama"
          maxLength={productConfig.maxSenderLength}
          autoComplete="given-name"
          aria-invalid={!!errors.senderName}
          aria-describedby={errors.senderName ? "senderName-error" : undefined}
          {...register("senderName")}
        />
        <FieldError id="senderName-error" message={errors.senderName?.message} />
      </div>
    </div>
  );
}
