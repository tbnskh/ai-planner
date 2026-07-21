'use client'

import { useTasks } from '@/lib/store/useTasks'

import { CaptureBox } from './CaptureBox'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import { TaskSection } from './TaskSection'

export function PlannerScreen() {
  const { today, inbox, hydrated, addParsedTasks, toggleDone, removeTask } =
    useTasks()

  return (
    // h-dvh + внутрішній скрол: хедер угорі, поле вводу прибите до низу завжди,
    // а список задач скролиться між ними. min-h-0 — щоб flex-дитина реально скролила.
    <div className="mx-auto flex h-dvh w-full max-w-md flex-col px-5 pb-6 pt-8">
      <h1 className="text-center text-2xl font-bold tracking-tight">Yoomi</h1>

      <div className="min-h-0 flex-1 space-y-8 overflow-y-auto py-8">
        <TaskSection
          title="Сьогодні"
          hydrated={hydrated}
          isEmpty={today.length === 0}
          emptyState={
            <EmptyState>
              На сьогодні нічого не заплановано.
              <br />
              Скажи, що зробити сьогодні — і воно з’явиться тут.
            </EmptyState>
          }
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
          emptyState={
            <EmptyState>
              Список порожній.
              <br />
              Вивали все, що в голові, у поле нижче ↓
            </EmptyState>
          }
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
        <CaptureBox onParsed={addParsedTasks} />
      </div>
    </div>
  )
}
