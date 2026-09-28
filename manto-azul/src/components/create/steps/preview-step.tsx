"use client";

import { Monitor, Smartphone } from "lucide-react";
import { useState } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import { BrowserFrame, PhoneFrame } from "@/components/tribute/device-frames";
import { TributeRenderer } from "@/components/tribute/tribute-renderer";
import { productConfig } from "@/config/product";
import { cn } from "@/lib/utils";
import type { TributeFormValues } from "@/lib/validation/tribute-schema";
import type { TributeContent } from "@/types/tribute";

type Device = "mobile" | "desktop";

export function PreviewStep() {
  const { control } = useFormContext<TributeFormValues>();
  const values = useWatch({ control }) as TributeContent;
  const [device, setDevice] = useState<Device>("mobile");

  const renderer = <TributeRenderer tribute={values} mode="embedded" />;

  return (
    <div>
      <div className="flex justify-center">
        <div role="tablist" aria-label="Tipo de tela" className="inline-flex rounded-full bg-navy-900/6 p-1">
          {(
            [
              { id: "mobile", label: "Celular", icon: Smartphone },
              { id: "desktop", label: "Computador", icon: Monitor },
            ] as const
          ).map((opt) => (
            <button
              key={opt.id}
              type="button"
              role="tab"
              aria-selected={device === opt.id}
              onClick={() => setDevice(opt.id)}
              className={cn(
                "flex h-10 items-center gap-2 rounded-full px-5 text-sm font-medium transition",
                device === opt.id ? "bg-white text-navy-900 shadow-soft" : "text-ink-600 hover:text-navy-900",
              )}
            >
              <opt.icon className="size-4" aria-hidden="true" />
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {values.settings?.openingAnimation && (
        <p className="mx-auto mt-4 max-w-md text-center text-sm text-ink-600">
          Ao abrir o link, a pessoa verá primeiro uma tela de abertura com o botão “Abrir homenagem”.
        </p>
      )}

      <div className="mt-6">
        {device === "mobile" ? (
          <PhoneFrame>{renderer}</PhoneFrame>
        ) : (
          <BrowserFrame url={`${productConfig.siteUrl.replace(/^https?:\/\//, "")}/homenagem/…`}>{renderer}</BrowserFrame>
        )}
      </div>
    </div>
  );
}
