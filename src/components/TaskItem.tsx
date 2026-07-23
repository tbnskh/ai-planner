'use client'

import { cardColor } from '@/lib/cardColor'
import { isDone as taskIsDone } from '@/lib/tasks'
import type { Task, TaskPriority } from '@/lib/types'

const PRIORITY_LABEL: Record<TaskPriority, string> = {
  high: 'Важливо',
  medium: 'Звичайно',
  low: 'Колись',
}

interface TaskItemProps {
  task: Task
  onToggleDone: (id: string) => void
  onRemove: (id: string) => void
}

export function TaskItem({ task, onToggleDone, onRemove }: TaskItemProps) {
  const isDone = taskIsDone(task)
  const meta = cardMeta(task)

  const primaryLabel = isDone ? 'Позначити невиконаною' : 'Виконано'

  return (
    <li>
      <div
        style={{ backgroundColor: cardColor(task.id) }}
        className={`rounded-3xl px-4 py-3.5 text-white transition-opacity ${
          isDone ? 'opacity-55' : ''
        }`}
      >
        <div className="flex items-start justify-between gap-3">
          <span className="text-xs font-medium text-white/85">
            {meta.date ? (
              <>
                {meta.date} <span className="text-white/70">{meta.weekday}</span>
              </>
            ) : (
              PRIORITY_LABEL[task.priority]
            )}
          </span>

          <button
            type="button"
            onClick={() => onRemove(task.id)}
            aria-label="Видалити задачу"
            className="-m-1 flex size-7 items-center justify-center rounded-full text-white/50 transition-colors hover:bg-white/15 hover:text-white"
          >
            <svg viewBox="0 0 20 20" className="size-4 stroke-current stroke-2" aria-hidden>
              <path d="M5 5l10 10M15 5L5 15" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-1.5 flex items-center gap-3">
          <button
            type="button"
            onClick={() => onToggleDone(task.id)}
            aria-label={primaryLabel}
            className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
              isDone
                ? 'border-white bg-white text-black'
                : 'border-white/70 hover:border-white hover:bg-white/15'
            }`}
          >
            {isDone && (
              <svg viewBox="0 0 12 12" className="size-3 fill-none stroke-current stroke-2" aria-hidden>
                <path d="M2.5 6.5l2.5 2.5 4.5-5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>

          <p
            className={`min-w-0 flex-1 text-[15px] font-semibold leading-snug ${
              isDone ? 'line-through' : ''
            }`}
          >
            {task.title}
          </p>
        </div>

        {task.notes && !isDone && (
          <p className="mt-1.5 pl-9 text-xs leading-snug text-white/75">{task.notes}</p>
        )}

        {task.estimatedMinutes && !isDone && (
          <p className="mt-1 pl-9 text-xs text-white/70">{formatMinutes(task.estimatedMinutes)}</p>
        )}
      </div>
    </li>
  )
}

interface CardMeta {
  date: string | null
  weekday: string | null
}

function cardMeta(task: Task): CardMeta {
  const iso = task.scheduledDate ?? task.dueDate
  if (!iso) return { date: null, weekday: null }

  const parsed = new Date(`${iso}T00:00:00`)
  if (Number.isNaN(parsed.getTime())) return { date: null, weekday: null }

  const day = String(parsed.getDate()).padStart(2, '0')
  const month = String(parsed.getMonth() + 1).padStart(2, '0')
  const weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'long' }).format(parsed)

  return {
    date: `${day}.${month}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
  }
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} хв`
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return rest === 0 ? `${hours} год` : `${hours} год ${rest} хв`
}
