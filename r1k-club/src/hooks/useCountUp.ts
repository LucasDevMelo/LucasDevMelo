import { useEffect, useRef, useState } from 'react'

/** Contagem animada para o momento do "MEMBRO #0042" no onboarding. */
export function useCountUp(target: number, durationMs = 1400, enabled = true): number {
  const [value, setValue] = useState(enabled ? 0 : target)
  const frame = useRef<number>()

  useEffect(() => {
    if (!enabled) {
      setValue(target)
      return
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduce) {
      setValue(target)
      return
    }

    const start = performance.now()

    const tick = (now: number) => {
      const t = Math.min((now - start) / durationMs, 1)
      // easeOutExpo
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t)
      setValue(Math.round(target * eased))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }

    frame.current = requestAnimationFrame(tick)
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current)
    }
  }, [target, durationMs, enabled])

  return value
}
