import { MantleMark } from "@/components/brand/ornaments";

export function PageLoading({ label = "Carregando…", dark = false }: { label?: string; dark?: boolean }) {
  return (
    <div
      role="status"
      className={`flex min-h-svh flex-col items-center justify-center gap-4 ${dark ? "bg-navy-900 text-cream-100" : "bg-cream-50 text-ink-600"}`}
    >
      <MantleMark className="size-12 animate-pulse text-marian-500" />
      <p className="text-sm">{label}</p>
    </div>
  );
}
