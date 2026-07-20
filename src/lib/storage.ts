import { parseStoredTasks } from './schemas'
import type { Task } from './types'

const STORAGE_KEY = 'ai-planner.tasks.v1'
const STORAGE_VERSION = 1

/**
 * Єдина точка доступу до персистентного шару.
 * Коли localStorage заміниться на Supabase — зміниться тільки цей файл.
 */

export function loadTasks(): Task[] {
  if (typeof window === 'undefined') return []

  const raw = window.localStorage.getItem(STORAGE_KEY)
  if (!raw) return []

  return parseStoredTasks(raw) ?? []
}

export function saveTasks(tasks: Task[]): void {
  if (typeof window === 'undefined') return

  try {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ version: STORAGE_VERSION, tasks }),
    )
  } catch {
    // Квота вичерпана або приватний режим — не роняємо застосунок через це.
  }
}
