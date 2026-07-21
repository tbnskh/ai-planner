import type { ParsedTask, Task, TaskPriority } from './types'

/**
 * Чисті функції над задачами: жодного стану, жодних сайд-ефектів.
 * Усе тут можна покрити тестами без React і без браузера.
 *
 * Модель виконаності: задача виконана ⇔ виставлено completedAt. Статус
 * ('today' | 'inbox') — це лише секція, і він не змінюється від виконання.
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

export function isDone(task: Task): boolean {
  return task.completedAt != null
}

/**
 * Розподіл за датою: задача з сьогоднішнім дедлайном одразу йде в «Сьогодні»,
 * решта — в «Інші дні». `today` передається ззовні (локальна дата користувача),
 * щоб не залежати від UTC-годинника сервера.
 */
export function createTask(parsed: ParsedTask, today: string): Task {
  const isToday = parsed.dueDate === today

  return {
    ...parsed,
    id: createId(),
    status: isToday ? 'today' : 'inbox',
    scheduledDate: isToday ? today : undefined,
    createdAt: new Date().toISOString(),
  }
}

export function addTasks(tasks: Task[], parsed: ParsedTask[], today: string): Task[] {
  return [...parsed.map((item) => createTask(item, today)), ...tasks]
}

export function moveToToday(tasks: Task[], id: string, today: string): Task[] {
  return tasks.map((task) =>
    task.id === id ? { ...task, status: 'today', scheduledDate: today } : task,
  )
}

/** Виконано ↔ не виконано, на місці — секція задачі не змінюється. */
export function toggleDone(tasks: Task[], id: string): Task[] {
  return tasks.map((task) => {
    if (task.id !== id) return task

    return isDone(task)
      ? { ...task, completedAt: undefined }
      : { ...task, completedAt: new Date().toISOString() }
  })
}

export function removeTask(tasks: Task[], id: string): Task[] {
  return tasks.filter((task) => task.id !== id)
}

/** Невиконані вгорі за пріоритетом, виконані внизу в порядку завершення. */
function bySectionOrder(a: Task, b: Task): number {
  const aDone = isDone(a)
  const bDone = isDone(b)
  if (aDone !== bDone) return aDone ? 1 : -1
  if (aDone) return a.completedAt!.localeCompare(b.completedAt!)

  const byPriority = PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]
  return byPriority !== 0 ? byPriority : a.createdAt.localeCompare(b.createdAt)
}

export function selectToday(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.status === 'today').sort(bySectionOrder)
}

export function selectInbox(tasks: Task[]): Task[] {
  return tasks.filter((task) => task.status === 'inbox').sort(bySectionOrder)
}

/** Локальна дата, не UTC: о 23:00 у Києві це має бути сьогодні, а не завтра. */
export function todayISODate(date = new Date()): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}
