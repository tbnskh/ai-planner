'use client'

import { useCallback, useRef, useState } from 'react'

import { useTasks } from '@/lib/store/useTasks'
import type { ParsedTask } from '@/lib/types'

import { CaptureBox } from './CaptureBox'
import { EmptyState } from './EmptyState'
import { Yoomi } from './mascot/Yoomi'
import { TaskItem } from './TaskItem'
import { TaskSection } from './TaskSection'

export function PlannerScreen() {
  const { today, inbox, hydrated, addParsedTasks, toggleDone, removeTask } =
    useTasks()

  const isEmpty = hydrated && today.length === 0 && inbox.length === 0

  // Коротка радість, коли AI щойно розклав задачі (стан результату).
  const [happy, setHappy] = useState(false)
  const happyTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleParsed = useCallback(
    (parsed: ParsedTask[]) => {
      addParsedTasks(parsed)
      setHappy(true)
      if (happyTimer.current) clearTimeout(happyTimer.current)
      happyTimer.current = setTimeout(() => setHappy(false), 1600)
    },
    [addParsedTasks],
  )

  return (
    // h-dvh + внутрішній скрол: хедер угорі, поле вводу прибите до низу завжди,
    // а список задач скролиться між ними. min-h-0 — щоб flex-дитина реально скролила.
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-5 pb-6 pt-8">
      <div className="flex items-center justify-center gap-2">
        {/* Компаньйон у хедері — коли на екрані вже є задачі (Yoomi «відступає») */}
        {!isEmpty && (
          <Yoomi expression={happy ? 'happy' : 'calm'} className="h-8 w-8 shrink-0" />
        )}
        <h1 className="text-center text-2xl font-bold tracking-tight">Yoomi</h1>
      </div>

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto py-8">
        {/* Порожній екран — Yoomi велика, кличе почати (за специфікацією) */}
        {isEmpty && (
          <div className="flex flex-col items-center gap-3 pb-2">
            <Yoomi expression="calm" className="h-28 w-28" />
            <p className="text-sm text-muted">Що в голові? Я поруч.</p>
          </div>
        )}

        <TaskSection
          title="Сьогодні"
          hydrated={hydrated}
          isEmpty={today.length === 0}
          emptyState={<EmptyState>Поки нічого. Скажи, що зробити сьогодні.</EmptyState>}
        >
          {today.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleDone={toggleDone}
              onRemove={removeTask}
            />
          ))}
        </TaskSection>

        <TaskSection
          title="Інші дні"
          hydrated={hydrated}
          isEmpty={inbox.length === 0}
          emptyState={<EmptyState>Поки порожньо. Вивали думки нижче ↓</EmptyState>}
        >
          {inbox.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              onToggleDone={toggleDone}
              onRemove={removeTask}
            />
          ))}
        </TaskSection>
      </div>

      <div className="shrink-0 pt-2">
        <CaptureBox onParsed={handleParsed} />
      </div>
    </div>
  )
}
