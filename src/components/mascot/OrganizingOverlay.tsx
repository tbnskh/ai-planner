'use client'

import { Yoomi } from './Yoomi'

type Phase = 'organizing' | 'done'

interface OrganizingOverlayProps {
  phase: Phase
}

/**
 * Повноекранний стан обробки: Yoomi «організовує» хаос, потім пружно
 * збирається у форму («Готово»). Уся анімація — CSS transform і вимикається
 * під prefers-reduced-motion (класи в globals.css), тож лишається статичний Yoomi.
 */
export function OrganizingOverlay({ phase }: OrganizingOverlayProps) {
  const isDone = phase === 'done'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-8 bg-background/95 px-8 backdrop-blur-sm"
      role="status"
      aria-live="polite"
    >
      <div className="relative flex h-52 w-52 items-center justify-center">
        {!isDone && <Chaos />}
        <div className={isDone ? 'yoomi-pop' : 'yoomi-wobble'}>
          <Yoomi
            expression={isDone ? 'happy' : 'organizing'}
            className="h-40 w-40"
          />
        </div>
      </div>

      <div className="w-full max-w-xs space-y-4 text-center">
        <p className="text-sm font-medium text-foreground">
          {isDone ? 'Готово! Ось твій план' : 'Yoomi організовує…'}
        </p>

        {!isDone && (
          <div className="h-1.5 overflow-hidden rounded-full bg-surface">
            <div className="yoomi-progress-fill h-full w-1/3 rounded-full bg-accent" />
          </div>
        )}
      </div>
    </div>
  )
}

/** Легкий «хаос» — кілька кольорових частинок, що кружляють навколо Yoomi. */
function Chaos() {
  const particles = [
    { color: '#4f46e5', top: '2%', left: '46%' },
    { color: '#db2777', top: '26%', left: '88%' },
    { color: '#ea580c', top: '78%', left: '82%' },
    { color: '#7c3aed', top: '90%', left: '40%' },
    { color: '#2563eb', top: '70%', left: '4%' },
    { color: '#fbbf24', top: '20%', left: '6%' },
  ]

  return (
    <div className="yoomi-orbit absolute inset-0" aria-hidden>
      {particles.map((p) => (
        <span
          key={`${p.top}-${p.left}`}
          className="absolute size-3 rounded-[4px]"
          style={{ top: p.top, left: p.left, backgroundColor: p.color }}
        />
      ))}
    </div>
  )
}
