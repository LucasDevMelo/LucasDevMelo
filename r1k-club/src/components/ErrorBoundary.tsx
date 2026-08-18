import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State {
  error: Error | null
}

/** Uma tela branca no meio do checkout custa R$1.000. */
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('ErrorBoundary', error, info.componentStack)
  }

  render() {
    if (!this.state.error) return this.props.children

    return (
      <div className="grid min-h-dvh place-items-center px-5 text-center">
        <div>
          <p className="font-display text-3xl text-gold-100">Algo quebrou.</p>
          <p className="mt-3 text-sm text-white/45">
            Se você estava no meio de um pagamento, ele não foi perdido.
          </p>
          <button
            onClick={() => window.location.assign('/')}
            className="focus-gold mt-8 rounded-full bg-gold-sheen px-7 py-3 text-xs font-bold uppercase tracking-[0.16em] text-ink-950"
          >
            Voltar ao início
          </button>
        </div>
      </div>
    )
  }
}
