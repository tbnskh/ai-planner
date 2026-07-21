'use client'

import { useCallback, useEffect, useMemo, useSyncExternalStore } from 'react'

import * as taskOps from '../tasks'
import type { ParsedTask, Task } from '../types'
import {
  getServerSnapshot,
  getSnapshot,
  hydrate,
  subscribe,
  update,
} from './taskStore'

export interface UseTasksResult {
  today: Task[]
  inbox: Task[]
  /** false до першого читання localStorage — рендеримо скелетон, а не empty state */
  hydrated: boolean
  addParsedTasks: (parsed: ParsedTask[]) => void
  toggleDone: (id: string) => void
  removeTask: (id: string) => void
}

export function useTasks(): UseTasksResult {
  const { tasks, hydrated } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  )

  // Читаємо localStorage лише після монтування: перший клієнтський рендер
  // має збігатися з серверним, інакше React повідомить про hydration mismatch.
  useEffect(hydrate, [])

  const addParsedTasks = useCallback((parsed: ParsedTask[]) => {
    // Локальна дата користувача вирішує, що піде в «Сьогодні», а що в «Інші дні».
    const today = taskOps.todayISODate()
    update((current) => taskOps.addTasks(current, parsed, today))
  }, [])

  const toggleDone = useCallback((id: string) => {
    update((current) => taskOps.toggleDone(current, id))
  }, [])

  const removeTask = useCallback((id: string) => {
    update((current) => taskOps.removeTask(current, id))
  }, [])

  const today = useMemo(() => taskOps.selectToday(tasks), [tasks])
  const inbox = useMemo(() => taskOps.selectInbox(tasks), [tasks])

  return {
    today,
    inbox,
    hydrated,
    addParsedTasks,
    toggleDone,
    removeTask,
  }
}
