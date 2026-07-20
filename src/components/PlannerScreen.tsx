'use client'

import { useTasks } from '@/lib/store/useTasks'

import { CaptureBox } from './CaptureBox'
import { EmptyState } from './EmptyState'
import { TaskItem } from './TaskItem'
import { TaskSection } from './TaskSection'

export function PlannerScreen() {
  const {
    today,
    inbox,
    hydrated,
    addParsedTasks,
    moveToToday,
    toggleDone,
    removeTask,
  } = useTasks()

  const doneCount = today.filter((task) => task.status === 'done').length

  return (
    <main className="mx-auto w-full max-w-2xl space-y-10 px-6 py-12 sm:py-16">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">AI Planner</h1>
        <p className="text-sm text-zinc-500">
          Вивантаж думки — отримай план на сьогодні.
        </p>
      </header>

      <CaptureBox onParsed={addParsedTasks} />

      <TaskSection
        title="Сьогодні"
        hydrated={hydrated}
        isEmpty={today.length === 0}
        count={
          today.length > 0 && (
            <span className="text-xs text-zinc-500">
              {doneCount} з {today.length}
            </span>
          )
        }
        emptyState={
          <EmptyState>
            На сьогодні нічого не заплановано.
            <br />
            Візьми щось із Інбоксу нижче ↓
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
        title="Інбокс"
        hydrated={hydrated}
        isEmpty={inbox.length === 0}
        count={inbox.length > 0 && <span className="text-xs text-zinc-500">{inbox.length}</span>}
        emptyState={
          <EmptyState>
            Інбокс порожній.
            <br />
            Вивали все, що в голові, у поле вгорі ↑
          </EmptyState>
        }
      >
        {inbox.map((task) => (
          <TaskItem
            key={task.id}
            task={task}
            onMoveToToday={moveToToday}
            onRemove={removeTask}
          />
        ))}
      </TaskSection>
    </main>
  )
}
