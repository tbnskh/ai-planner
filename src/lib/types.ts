/**
 * Головний контракт даних застосунку.
 * Усі інші модулі спираються на ці типи — змінювати їх обережно.
 */

export type TaskStatus = 'inbox' | 'today' | 'done'

export type TaskPriority = 'high' | 'medium' | 'low'

export interface Task {
  id: string
  title: string
  notes?: string
  status: TaskStatus
  priority: TaskPriority
  estimatedMinutes?: number
  /** ISO-дата YYYY-MM-DD — на який день заплановано */
  scheduledDate?: string
  /** ISO-дата YYYY-MM-DD — дедлайн */
  dueDate?: string
  /** ISO 8601 timestamp */
  createdAt: string
  /** ISO 8601 timestamp */
  completedAt?: string
}

/**
 * Те, що повертає AI. Без id / status / createdAt —
 * ідентичність і життєвий цикл задачі належать застосунку, не моделі.
 */
export interface ParsedTask {
  title: string
  priority: TaskPriority
  notes?: string
  estimatedMinutes?: number
  dueDate?: string
}

/** Коди помилок /api/parse — UI показує різний текст для кожного. */
export type ParseErrorCode =
  | 'EMPTY_INPUT'
  | 'CONFIG'
  | 'RATE_LIMIT'
  | 'UPSTREAM'
  | 'NETWORK'
  | 'UNKNOWN'

export interface ParseSuccessResponse {
  tasks: ParsedTask[]
}

export interface ParseErrorResponse {
  error: ParseErrorCode
  message: string
}
