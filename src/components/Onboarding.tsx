'use client'

import { Yoomi } from './mascot/Yoomi'
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
        <Yoomi expression="calm" className="h-56 w-56" />
      </div>

      <Button onClick={onStart} className="w-full py-4 text-base">
        Розвантаж голову
      </Button>
    </div>
  )
}
