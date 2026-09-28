/* eslint-disable @next/next/no-img-element -- local data URLs */
import { Camera, Heart, Palette, User } from "lucide-react";
import { productConfig } from "@/config/product";
import { formatPrice } from "@/lib/format";
import { relationshipInfo } from "@/lib/relationships";
import { templates } from "@/lib/templates";
import type { TributeContent } from "@/types/tribute";

export function CheckoutSummary({ tribute }: { tribute: TributeContent }) {
  const template = templates[tribute.template];
  const rows = [
    {
      icon: User,
      label: "Presenteado(a)",
      value: `${tribute.recipientName} · ${relationshipInfo[tribute.relationship].label}`,
    },
    { icon: Palette, label: "Estilo", value: template.name },
    {
      icon: Camera,
      label: "Fotos",
      value: tribute.photos.length ? `${tribute.photos.length} de ${productConfig.maxPhotos}` : "Sem fotos",
    },
    { icon: Heart, label: "De", value: tribute.senderName },
  ];

  return (
    <div className="rounded-3xl border border-navy-900/10 bg-white p-6 shadow-soft sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">Seu pedido</p>
          <h2 className="mt-2 font-serif text-2xl font-semibold text-navy-900">{productConfig.offerName}</h2>
        </div>
        <p className="shrink-0 font-medium text-navy-900">{formatPrice()}</p>
      </div>

      <dl className="mt-6 divide-y divide-navy-900/8 border-y border-navy-900/8">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center gap-3 py-3.5">
            <row.icon className="size-4 shrink-0 text-marian-600" aria-hidden="true" />
            <dt className="text-sm text-ink-600">{row.label}</dt>
            <dd className="ml-auto truncate pl-4 text-right text-sm font-medium text-navy-900">{row.value}</dd>
          </div>
        ))}
      </dl>

      {tribute.photos.length > 0 && (
        <div className="mt-5 flex gap-2" aria-hidden="true">
          {tribute.photos.map((p) => (
            <img key={p.id} src={p.src} alt="" className="size-12 rounded-xl object-cover" />
          ))}
        </div>
      )}

      <div className="mt-6 flex items-baseline justify-between">
        <p className="text-lg font-medium text-navy-900">Total</p>
        <p className="font-serif text-4xl font-semibold text-navy-900">{formatPrice()}</p>
      </div>
      <p className="mt-1 text-right text-sm text-ink-600">{productConfig.paymentLabel}</p>
    </div>
  );
}
