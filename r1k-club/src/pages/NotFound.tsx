import { ButtonLink, Section } from '@/components/ui'

export function NotFound() {
  return (
    <Section className="max-w-lg py-32 text-center">
      <p aria-hidden="true" className="font-display text-7xl font-black text-gold-foil">
        404
      </p>
      <h1 className="mt-6 font-display text-2xl">Essa página não existe.</h1>
      <p className="mt-3 text-sm text-white/40">
        Diferente do seu número de membro, que ainda pode existir.
      </p>
      <div className="mt-10 flex justify-center gap-3">
        <ButtonLink to="/">Início</ButtonLink>
        <ButtonLink to="/ranking" variant="ghost">
          Ranking
        </ButtonLink>
      </div>
    </Section>
  )
}
