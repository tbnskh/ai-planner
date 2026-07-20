'use client'

import type { Task, TaskPriority } from '@/lib/types'

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'Важливо',
  medium: 'Звичайно',
  low: 'Колись',
}

const PRIORITY_DOT: Record<TaskPriority, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-zinc-300 dark:bg-zinc-600',
}

interface TaskItemProps {
  task: Task
  onToggleDone?: (id: string) => void
  onMoveToToday?: (id: string) => void
  onRemove: (id: string) => void
}

export function TaskItem({
  task,
  onToggleDone,
  onMoveToToday,
  onRemove,
}: TaskItemProps) {
  const isDone = task.status === 'done'

  return (
    <li className="group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900">
      {onToggleDone && (
        <button
          onClick={() => onToggleDone(task.id)}
          aria-label={isDone ? 'Позначити невиконаною' : 'Позначити виконаною'}
          className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
            isDone
              ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'
              : 'border-zinc-300 hover:border-zinc-500 dark:border-zinc-700 dark:hover:border-zinc-500'
          }`}
        >
          {isDone && (
            <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-current stroke-2">
              <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </button>
      )}

      <div className="min-w-0 flex-1">
        <p
          className={`text-sm leading-snug ${
            isDone ? 'text-zinc-400 line-through dark:text-zinc-600' : ''
          }`}
        >
          {task.title}
        </p>

        {task.notes && !isDone && (
          <p className="mt-1 text-xs leading-snug text-zinc-500">{task.notes}</p>
        )}

        {!isDone && (
          <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-zinc-500">
            <span className="inline-flex items-center gap-1.5">
              <span className={`size-1.5 rounded-full ${PRIORITY_DOT[task.priority]}`} />
              {PRIORITY_LABEL[task.priority]}
            </span>
            {task.estimatedMinutes && <span>{formatMinutes(task.estimatedMinutes)}</span>}
            {task.dueDate && <span>до {formatDate(task.dueDate)}</span>}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100">
        {onMoveToToday && (
          <button
            onClick={() => onMoveToToday(task.id)}
            className="rounded-md px-2 py-1 text-xs font-medium text-zinc-600 hover:bg-zinc-200 dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            → Сьогодні
          </button>
        )}
        <button
          onClick={() => onRemove(task.id)}
          aria-label="Видалити задачу"
          className="rounded-md px-2 py-1 text-xs text-zinc-400 hover:bg-zinc-200 hover:text-red-600 dark:hover:bg-zinc-800"
        >
          ✕
        </button>
      </div>
    </li>
  )
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} хв`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} год` : `${hours} год ${rest} хв`
}

function formatDate(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`)
  return Number.isNaN(date.getTime())
    ? isoDate
    : new Intl.DateTimeFormat('uk-UA', { day: 'numeric', month: 'long' }).format(date)
}
