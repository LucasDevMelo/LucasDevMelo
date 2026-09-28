import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { productConfig } from "@/config/product";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/5 bg-navy-950 text-cream-100">
      <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo tone="light" />
          <p className="mt-4 text-sm leading-relaxed text-cream-100/70">{productConfig.tagline}.</p>
        </div>
        <nav aria-label="Rodapé" className="grid grid-cols-2 gap-x-12 gap-y-3 text-sm sm:flex sm:gap-8">
          <Link href="/termos" className="text-cream-100/80 hover:text-white">
            Termos de uso
          </Link>
          <Link href="/privacidade" className="text-cream-100/80 hover:text-white">
            Privacidade
          </Link>
          <Link href="/contato" className="text-cream-100/80 hover:text-white">
            Contato
          </Link>
          <Link href="/exemplo" className="text-cream-100/80 hover:text-white">
            Ver exemplo
          </Link>
        </nav>
      </div>
      <div className="border-t border-white/5">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs text-cream-100/50 sm:px-6">
          © {new Date().getFullYear()} {productConfig.productName}. Homenagens digitais personalizadas. Não possuímos
          vínculo com o Santuário Nacional ou com instituições religiosas.
        </p>
      </div>
    </footer>
  );
}
