import Link from "next/link";
import { MantleMark } from "@/components/brand/ornaments";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center px-6 text-center">
      <MantleMark className="size-14 text-marian-600" />
      <h1 className="mt-6 font-serif text-4xl font-semibold text-navy-900">Página não encontrada</h1>
      <p className="mt-3 max-w-md text-ink-600">O endereço que você acessou não existe ou foi alterado.</p>
      <Button asChild size="lg" className="mt-8">
        <Link href="/">Voltar ao início</Link>
      </Button>
    </main>
  );
}
