import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface AuthState {
  session: Session | null
  loading: boolean
}

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>({ session: null, loading: Boolean(supabase) })

  useEffect(() => {
    if (!supabase) return

    supabase.auth.getSession().then(({ data }) => {
      setState({ session: data.session, loading: false })
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setState({ session, loading: false })
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  return state
}

export async function signOut(): Promise<void> {
  await supabase?.auth.signOut()
}
