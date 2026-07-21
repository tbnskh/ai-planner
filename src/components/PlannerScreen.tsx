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

  const isFullyEmpty = hydrated && today.length === 0 && inbox.length === 0

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 pb-6 pt-8">
      <h1 className="text-center text-2xl font-bold tracking-tight">Yoomi</h1>

      {isFullyEmpty ? (
        <div className="flex flex-1 flex-col justify-center gap-6">
          <p className="text-center text-sm leading-relaxed text-muted">
            Тут поки порожньо.
            <br />
            Вивантаж усе, що крутиться в голові — Yoomi розкладе на задачі.
          </p>
          <CaptureBox onParsed={addParsedTasks} />
        </div>
      ) : (
        <>
          <div className="flex-1 space-y-8 overflow-y-auto py-8">
            <TaskSection
              title="Сьогодні"
              hydrated={hydrated}
              isEmpty={today.length === 0}
              emptyState={
                <EmptyState>
                  На сьогодні нічого не заплановано.
                  <br />
                  Візьми щось із «Інших днів» нижче ↓
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
                  onMoveToToday={moveToToday}
                  onRemove={removeTask}
                />
              ))}
            </TaskSection>
          </div>

          <div className="pt-2">
            <CaptureBox onParsed={addParsedTasks} />
          </div>
        </>
      )}
    </div>
  )
}
