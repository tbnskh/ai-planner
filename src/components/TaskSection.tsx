'use client'

import type { ReactNode } from 'react'

interface TaskSectionProps {
  title: string
  hydrated: boolean
  isEmpty: boolean
  emptyState: ReactNode
  children: ReactNode
}

export function TaskSection({
  title,
  hydrated,
  isEmpty,
  emptyState,
  children,
}: TaskSectionProps) {
  return (
    <section className="space-y-3">
      <h2 className="px-1 text-base font-semibold">{title}</h2>

      {/* Поки не прочитали localStorage — скелетон.
          Інакше на кожному завантаженні блимає «порожньо», навіть якщо задачі є. */}
      {!hydrated ? (
        <TaskSkeleton />
      ) : isEmpty ? (
        emptyState
      ) : (
        <ul className="space-y-3">{children}</ul>
      )}
    </section>
  )
}

function TaskSkeleton() {
  return (
    <div className="space-y-3" aria-hidden>
      {[0, 1].map((key) => (
        <div key={key} className="h-20 animate-pulse rounded-3xl bg-surface" />
      ))}
    </div>
  )
}
