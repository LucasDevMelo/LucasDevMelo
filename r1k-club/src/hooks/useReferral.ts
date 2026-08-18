import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { track } from '@/lib/analytics'

const KEY = 'r1k:ref'

/**
 * Guarda o codigo de indicacao (secao 10). Precisa sobreviver ao redirect do
 * Stripe, entao fica no localStorage e nao so na URL.
 */
export function useReferral(): string | null {
  const [params] = useSearchParams()
  const [ref, setRef] = useState<string | null>(() => readRef())

  useEffect(() => {
    const incoming = params.get('ref')
    if (!incoming) return

    const clean = incoming.trim().slice(0, 40)
    if (!clean || clean === ref) return

    try {
      localStorage.setItem(KEY, clean)
    } catch {
      /* modo privado */
    }
    setRef(clean)
    track('referral_clicked', { ref: clean })
  }, [params, ref])

  return ref
}

export function readRef(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

export function clearRef(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* ignore */
  }
}
