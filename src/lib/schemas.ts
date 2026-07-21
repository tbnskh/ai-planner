import { z } from 'zod'

import type { ParsedTask, Task } from './types'

const priority = z.enum(['high', 'medium', 'low'])
// Приймаємо legacy 'done' зі старих збережень, далі нормалізуємо його нижче.
const storedStatus = z.enum(['inbox', 'today', 'done'])
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/)

/**
 * Схема однієї задачі від AI.
 * Модель вже обмежена structured outputs на рівні API, але це другий рубіж:
 * ловить порожні заголовки, від'ємні оцінки часу та зіпсовані дати.
 */
export const parsedTaskSchema = z.object({
  title: z.string().trim().min(1).max(200),
  priority: priority.catch('medium'),
  notes: z.string().trim().min(1).max(1000).optional(),
  estimatedMinutes: z.number().int().positive().max(24 * 60).optional(),
  dueDate: isoDate.optional(),
})

/** Некоректні елементи відкидаємо, а не валимо весь запит. */
export function sanitizeParsedTasks(input: unknown): ParsedTask[] {
  if (!Array.isArray(input)) return []

  return input.flatMap((item) => {
    const result = parsedTaskSchema.safeParse(item)
    return result.success ? [result.data] : []
  })
}

const storedTaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  status: storedStatus,
  priority,
  estimatedMinutes: z.number().optional(),
  scheduledDate: z.string().optional(),
  dueDate: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
})

const storageSchema = z.object({
  version: z.literal(1),
  tasks: z.array(storedTaskSchema),
})

type StoredTask = z.infer<typeof storedTaskSchema>

/**
 * Legacy-міграція: раніше 'done' був статусом, і виконана задача жила в «Сьогодні».
 * Тепер виконаність — це completedAt, а статус лише секція. Старе 'done'
 * перетворюємо на today + completedAt, щоб збережені задачі не зникли.
 */
function normalizeStoredTask(task: StoredTask): Task {
  if (task.status === 'done') {
    return {
      ...task,
      status: 'today',
      completedAt: task.completedAt ?? new Date().toISOString(),
    }
  }
  return { ...task, status: task.status }
}

/**
 * localStorage — недовірене джерело: користувач міг його відредагувати,
 * а стара версія застосунку могла записати інший формат.
 */
export function parseStoredTasks(raw: string): Task[] | null {
  try {
    const result = storageSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data.tasks.map(normalizeStoredTask) : null
  } catch {
    return null
  }
}
