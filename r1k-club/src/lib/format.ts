const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
})

const BRL_CENTS = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

/** centavos -> "R$ 1.000" (ou com centavos, quando houver) */
export function money(cents: number): string {
  const value = cents / 100
  return Number.isInteger(value) ? BRL.format(value) : BRL_CENTS.format(value)
}

/** 42 -> "#0042" */
export function memberTag(n: number): string {
  return `#${String(n).padStart(4, '0')}`
}

export function shortDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function longDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function ordinalPlace(n: number): string {
  return `${n}º`
}
