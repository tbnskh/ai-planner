'use client'

import type { ReactNode } from 'react'

interface TaskSectionProps {
  title: string
  count?: ReactNode
  hydrated: boolean
  isEmpty: boolean
  emptyState: ReactNode
  children: ReactNode
}

export function TaskSection({
  title,
  count,
  hydrated,
  isEmpty,
  emptyState,
  children,
}: TaskSectionProps) {
  return (
    <section className="space-y-1">
      <header className="flex items-baseline justify-between px-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {hydrated && count}
      </header>

      {/* Поки не прочитали localStorage — скелетон.
          Інакше на кожному завантаженні блимає «порожньо», навіть якщо задачі є. */}
      {!hydrated ? (
        <TaskSkeleton />
      ) : isEmpty ? (
        emptyState
      ) : (
        <ul>{children}</ul>
      )}
    </section>
  )
}

function TaskSkeleton() {
  return (
    <div className="space-y-2 px-3 py-2.5" aria-hidden>
      {[70, 45].map((width) => (
        <div
          key={width}
          style={{ width: `${width}%` }}
          className="h-4 animate-pulse rounded bg-zinc-100 dark:bg-zinc-900"
        />
      ))}
    </div>
  )
}
