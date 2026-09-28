import type { ReactNode } from "react";

export function LegalPage({ title, updatedAt, children }: { title: string; updatedAt?: string; children: ReactNode }) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <h1 className="font-serif text-4xl font-semibold text-navy-900 sm:text-5xl">{title}</h1>
      {updatedAt && <p className="mt-3 text-sm text-ink-400">Última atualização: {updatedAt}</p>}
      <div className="mt-10 space-y-6 leading-relaxed text-ink-600 [&_h2]:mt-10 [&_h2]:font-serif [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-navy-900 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">
        {children}
      </div>
    </article>
  );
}
