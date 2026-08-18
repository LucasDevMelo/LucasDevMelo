import { useEffect } from 'react'
import { Navigate, useSearchParams } from 'react-router-dom'
import { useReferral } from '@/hooks/useReferral'
import { track } from '@/lib/analytics'

/**
 * Secao 10 — /join?ref=0042. Registra a indicacao e manda para o checkout.
 * A URL curta e o que a pessoa cola no story.
 */
export function Join() {
  const [params] = useSearchParams()
  const ref = useReferral()

  useEffect(() => {
    if (params.get('ref')) track('referral_signup', { ref: params.get('ref') })
  }, [params])

  const target = ref ? `/checkout?ref=${encodeURIComponent(ref)}` : '/checkout'
  return <Navigate to={target} replace />
}
