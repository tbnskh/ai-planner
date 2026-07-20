import type { ParsedTask, Task, TaskPriority } from './types'

/**
 * Чисті функції над задачами: жодного стану, жодних сайд-ефектів.
 * Усе тут можна покрити тестами без React і без браузера.
 */

const PRIORITY_ORDER: Record<TaskPriority, number> = {
  high: 0,
  medium: 1,
  low: 2,
}

function createId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
}

export function createTask(parsed: ParsedTask): Task {
  return {
    ...parsed,
    id: createId(),
    status: 'inbox',
    createdAt: new Date().toISOString(),
  }
}

export function addTasks(tasks: Task[], parsed: ParsedTask[]): Task[] {
  return [...parsed.map(createTask), ...tasks]
}

export function moveToToday(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? {
          ...task,
          status: 'today',
          scheduledDate: todayISODate(),
          completedAt: undefined,
        }
      : task,
  )
}

export function moveToInbox(tasks: Task[], id: string): Task[] {
  return tasks.map((task) =>
    task.id === id
      ? { ...task, status: 'inbox', scheduledDate: undefined, completedAt: undefined }
      : task,
  )
}

/** Виконано ↔ не виконано. Знята галочка повертає задачу в «Сьогодні». */
export function toggleDone(tasks: Task[], id: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task

    return task.status === 'done'
      ? { ...task, status: 'today', completedAt: undefined }
      : { ...task, status: 'done', completedAt: new Date().toISOString() }
  })
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

/** Невиконані вгорі за пріоритетом, виконані внизу в порядку завершення. */
export function selectToday(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === 'today' || task.status === 'done')
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'done' ? 1 : -1
      if (a.status === 'done') return a.completedAt!.localeCompare(b.completedAt!)

      const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
      return byPriority !== 0 ? byPriority : a.createdAt.localeCompare(b.createdAt)
    })
}

/** Найновіші зверху — щойно розібрані задачі одразу видно. */
export function selectInbox(tasks: Task[]): Task[] {
  return tasks
    .filter((task) => task.status === 'inbox')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Локальна дата, не UTC: о 23:00 у Києві це має бути сьогодні, а не завтра. */
export function todayISODate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
