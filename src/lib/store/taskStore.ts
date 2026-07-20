import { loadTasks, saveTasks } from '../storage'
import type { Task } from '../types'

/**
 * Зовнішнє сховище задач поза React.
 *
 * localStorage — це саме «external system» у термінах React, тому стан живе тут,
 * а компоненти підписуються через useSyncExternalStore. Це дає окремий серверний
 * знімок (порожній список), тож гідрація ніколи не розходиться з розміткою сервера.
 */

export interface TaskStoreState {
  tasks: Task[]
  hydrated: boolean
}

/** Стабільне посилання: useSyncExternalStore порівнює знімки за ідентичністю. */
const SERVER_STATE: TaskStoreState = { tasks: [], hydrated: false }

let state: TaskStoreState = SERVER_STATE
const listeners = new Set<() => void>()

function emit(): void {
  for (const listener of listeners) listener()
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function getSnapshot(): TaskStoreState {
  return state
}

export function getServerSnapshot(): TaskStoreState {
  return SERVER_STATE
}

/** Викликається один раз після монтування. Повторні виклики — no-op. */
export function hydrate(): void {
  if (state.hydrated) return
  state = { tasks: loadTasks(), hydrated: true }
  emit()
}

export function update(updater: (tasks: Task[]) => Task[]): void {
  // Захист від дії користувача, що встигла випередити гідрацію:
  // інакше запис перетер би збережені задачі порожнім списком.
  hydrate()

  const tasks = updater(state.tasks)
  state = { tasks, hydrated: true }
  saveTasks(tasks)
  emit()
}
