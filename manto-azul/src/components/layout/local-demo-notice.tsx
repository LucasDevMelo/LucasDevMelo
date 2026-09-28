import { Info } from "lucide-react";
import { productConfig } from "@/config/product";
import { cn } from "@/lib/utils";

/** Honest notice shown while the product runs in local demo mode. */
export function LocalDemoNotice({ className, children }: { className?: string; children?: React.ReactNode }) {
  if (!productConfig.isLocalDemo) return null;
  return (
    <div
      role="note"
      className={cn(
        "flex items-start gap-2.5 rounded-2xl border border-gold-500/40 bg-gold-100/70 px-4 py-3 text-sm text-navy-900",
        className,
      )}
    >
      <Info className="mt-0.5 size-4 shrink-0 text-gold-600" aria-hidden="true" />
      <p>
        {children ?? (
          <>
            <strong className="font-semibold">Versão de demonstração local.</strong> Suas fotos e mensagens ficam
            salvas apenas neste navegador e nenhum pagamento real é realizado.
          </>
        )}
      </p>
    </div>
  );
}
