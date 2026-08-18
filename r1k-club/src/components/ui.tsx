import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type Variant = 'gold' | 'ghost' | 'outline'
type Size = 'sm' | 'md' | 'lg'

const VARIANT: Record<Variant, string> = {
  gold:
    'bg-gold-sheen bg-[length:200%_auto] text-ink-950 font-bold hover:bg-[position:100%_center] shadow-gold',
  ghost: 'bg-white/[0.04] text-gold-50 hover:bg-white/[0.08] hairline',
  outline: 'border border-gold-300/40 text-gold-200 hover:border-gold-300 hover:bg-gold-300/[0.06]',
}

const SIZE: Record<Size, string> = {
  sm: 'h-9 px-4 text-xs',
  md: 'h-11 px-6 text-sm',
  lg: 'h-14 px-8 text-base',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  loading?: boolean
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = 'gold', size = 'md', loading, className = '', children, disabled, ...rest },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={`focus-gold inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-[0.14em] transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-45 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {loading && <Spinner />}
      {children}
    </button>
  )
})

export function ButtonLink({
  to,
  variant = 'gold',
  size = 'md',
  className = '',
  children,
  ...rest
}: {
  to: string
  variant?: Variant
  size?: Size
  className?: string
  children: ReactNode
} & Omit<React.ComponentProps<typeof Link>, 'to' | 'className' | 'children'>) {
  return (
    <Link
      to={to}
      className={`focus-gold inline-flex items-center justify-center gap-2 rounded-full uppercase tracking-[0.14em] transition-all duration-300 ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </Link>
  )
}

export function Spinner({ className = '' }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="carregando"
      className={`inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  )
}

// ---------------------------------------------------------------------------
// Input
// ---------------------------------------------------------------------------
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  hint?: ReactNode
  error?: string | null
  prefix?: string
}

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, hint, error, prefix, className = '', id, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? label
  return (
    <label htmlFor={inputId} className="block">
      <span className="mb-2 block text-[11px] uppercase tracking-[0.22em] text-gold-200/70">
        {label}
      </span>
      <span
        className={`flex items-center overflow-hidden rounded-xl border bg-black/40 transition-colors focus-within:border-gold-300/70 ${
          error ? 'border-red-500/60' : 'border-white/10'
        }`}
      >
        {prefix && (
          <span className="pl-4 font-mono text-sm text-gold-300/60" aria-hidden="true">
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          className={`w-full bg-transparent px-4 py-3.5 text-base text-gold-50 outline-none placeholder:text-white/25 ${
            prefix ? 'pl-1.5' : ''
          } ${className}`}
          {...rest}
        />
      </span>
      {error ? (
        <span className="mt-1.5 block text-xs text-red-400">{error}</span>
      ) : hint ? (
        <span className="mt-1.5 block text-xs text-white/35">{hint}</span>
      ) : null}
    </label>
  )
})

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------
export function Section({
  children,
  className = '',
  id,
}: {
  children: ReactNode
  className?: string
  id?: string
}) {
  return (
    <section id={id} className={`mx-auto w-full max-w-5xl px-5 py-20 sm:px-8 ${className}`}>
      {children}
    </section>
  )
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="mb-4 text-[11px] uppercase tracking-[0.4em] text-gold-300/60">{children}</p>
  )
}

export function Heading({
  children,
  as: Tag = 'h2',
  className = '',
}: {
  children: ReactNode
  as?: 'h1' | 'h2' | 'h3'
  className?: string
}) {
  return (
    <Tag className={`font-display text-3xl leading-tight sm:text-4xl ${className}`}>{children}</Tag>
  )
}

export function Divider() {
  return (
    <div
      aria-hidden="true"
      className="mx-auto h-px w-full max-w-5xl bg-gradient-to-r from-transparent via-gold-300/25 to-transparent"
    />
  )
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.06] ${className}`} />
}

export function EmptyState({
  title,
  as: Tag = 'h2',
  children,
}: {
  title: string
  /** 'h1' quando o vazio e o conteudo principal da pagina. */
  as?: 'h1' | 'h2'
  children?: ReactNode
}) {
  return (
    <div className="surface px-6 py-14 text-center">
      <Tag className="font-display text-2xl text-gold-100">{title}</Tag>
      {children && <div className="mt-3 text-sm text-white/45">{children}</div>}
    </div>
  )
}
