'use client'

import { useState } from 'react'

import { Onboarding } from './Onboarding'
import { PlannerScreen } from './PlannerScreen'

export function AppShell() {
  // Простий варіант: онбординг показується при кожному вході (без «лише раз»).
  const [started, setStarted] = useState(false)

  return started ? (
    <PlannerScreen />
  ) : (
    <Onboarding onStart={() => setStarted(true)} />
  )
}
