import { z } from 'zod'

import type { ParsedTask, Task } from './types'

const priority = z.enum(['high', 'medium', 'low'])
const status = z.enum(['inbox', 'today', 'done'])
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

const taskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  notes: z.string().optional(),
  status,
  priority,
  estimatedMinutes: z.number().optional(),
  scheduledDate: z.string().optional(),
  dueDate: z.string().optional(),
  createdAt: z.string(),
  completedAt: z.string().optional(),
})

const storageSchema = z.object({
  version: z.literal(1),
  tasks: z.array(taskSchema),
})

/**
 * localStorage — недовірене джерело: користувач міг його відредагувати,
 * а стара версія застосунку могла записати інший формат.
 */
export function parseStoredTasks(raw: string): Task[] | null {
  try {
    const result = storageSchema.safeParse(JSON.parse(raw))
    return result.success ? result.data.tasks : null
  } catch {
    return null
  }
}
