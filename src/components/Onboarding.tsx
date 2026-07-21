'use client'

import { Button } from './ui/Button'

interface OnboardingProps {
  onStart: () => void
}

export function Onboarding({ onStart }: OnboardingProps) {
  return (
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-6 pb-8 pt-16">
      <div className="space-y-2 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Yoomi</h1>
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-muted">
          Your mind in order
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center">
        <Illustration />
      </div>

      <Button onClick={onStart} className="w-full py-4 text-base">
        Розвантаж голову
      </Button>
    </div>
  )
}

/**
 * Плейсхолдер ілюстрації — м'яка кольорова «пляма» у стилі бренду.
 * Маскот Yoomi додамо окремим заходом; тут головне сам екран і флоу.
 */
function Illustration() {
  return (
    <svg
      viewBox="0 0 200 200"
      className="h-56 w-56"
      role="img"
      aria-label="Ілюстрація Yoomi"
    >
      <defs>
        <radialGradient id="yoomi-blob" cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </radialGradient>
      </defs>
      <path
        fill="url(#yoomi-blob)"
        opacity="0.9"
        d="M100 28c30 0 58 20 62 50s-14 60-42 74-66 10-86-14S18 78 40 52 70 28 100 28z"
      />
      <circle cx="82" cy="96" r="12" fill="#fff" />
      <circle cx="118" cy="96" r="12" fill="#fff" />
      <circle cx="85" cy="98" r="5" fill="#1a1a1a" />
      <circle cx="121" cy="98" r="5" fill="#1a1a1a" />
    </svg>
  )
}
