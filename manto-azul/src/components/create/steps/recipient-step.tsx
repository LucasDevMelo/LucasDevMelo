"use client";

import { useFormContext, useWatch } from "react-hook-form";
import { FieldError, FieldHint, Input, Label } from "@/components/ui/input";
import { productConfig } from "@/config/product";
import { relationshipInfo } from "@/lib/relationships";
import { cn } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";
import { RELATIONSHIPS } from "@/types/tribute";

export function RecipientStep() {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<TributeFormValues>();
  const relationship = useWatch({ control, name: "relationship" });

  return (
    <div className="space-y-8">
      <div>
        <Label htmlFor="recipientName">Nome da pessoa presenteada</Label>
        <Input
          id="recipientName"
          autoComplete="off"
          placeholder="Ex.: Maria"
          maxLength={productConfig.maxNameLength}
          aria-invalid={!!errors.recipientName}
          aria-describedby={errors.recipientName ? "recipientName-error" : undefined}
          {...register("recipientName")}
        />
        <FieldError id="recipientName-error" message={errors.recipientName?.message} />
      </div>

      <fieldset>
        <legend className="mb-3 text-[15px] font-medium text-navy-900">Qual é a relação de vocês?</legend>
        <div
          className="grid grid-cols-2 gap-2.5 min-[400px]:grid-cols-3"
          aria-describedby={errors.relationship ? "relationship-error" : undefined}
        >
          {RELATIONSHIPS.map((value) => (
            <label key={value} className="relative">
              <input type="radio" value={value} className="peer sr-only" {...register("relationship")} />
              <span
                className={cn(
                  "flex h-12 cursor-pointer items-center justify-center rounded-2xl border border-navy-900/12 bg-white px-3 text-[15px] text-navy-900 transition",
                  "hover:border-marian-500/50 peer-checked:border-navy-900 peer-checked:bg-navy-900 peer-checked:text-white",
                  "peer-focus-visible:ring-4 peer-focus-visible:ring-marian-500/30",
                )}
              >
                {relationshipInfo[value].label}
              </span>
            </label>
          ))}
        </div>
        <FieldError id="relationship-error" message={errors.relationship?.message} />
      </fieldset>

      {relationship === "outro" && (
        <div>
          <Label htmlFor="customRelationship">Como você descreveria essa pessoa? (opcional)</Label>
          <Input
            id="customRelationship"
            placeholder="Ex.: minha tia querida"
            maxLength={productConfig.maxNameLength}
            aria-invalid={!!errors.customRelationship}
            {...register("customRelationship")}
          />
          <FieldError id="customRelationship-error" message={errors.customRelationship?.message} />
        </div>
      )}

      <div>
        <Label htmlFor="recipientNickname">Como você costuma chamar essa pessoa? (opcional)</Label>
        <Input
          id="recipientNickname"
          placeholder="Ex.: Mãezinha"
          maxLength={productConfig.maxNameLength}
          aria-invalid={!!errors.recipientNickname}
          aria-describedby="recipientNickname-hint"
          {...register("recipientNickname")}
        />
        <FieldHint id="recipientNickname-hint">Aparece logo abaixo do nome, com um toque de carinho.</FieldHint>
        <FieldError id="recipientNickname-error" message={errors.recipientNickname?.message} />
      </div>
    </div>
  );
}
