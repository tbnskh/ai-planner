import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'ghost'

const BASE =
  'inline-flex items-center justify-center gap-2 px-5 py-3 text-sm font-semibold transition-colors disabled:cursor-not-allowed'

const VARIANTS: Record<Variant, string> = {
  primary: 'rounded-full bg-accent text-white hover:bg-accent-hover disabled:opacity-40',
  ghost:
    'rounded-lg text-muted hover:bg-surface-hover hover:text-foreground disabled:opacity-40',
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return <button className={`${BASE} ${VARIANTS[variant]} ${className}`} {...props} />
}
