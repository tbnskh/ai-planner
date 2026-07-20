'use client'

import { useState } from 'react'

import { ParseError, parseTasks } from '@/lib/api/parseTasks'
import type { ParsedTask } from '@/lib/types'

import { Button } from './ui/Button'
import { Spinner } from './ui/Spinner'

interface CaptureBoxProps {
  onParsed: (tasks: ParsedTask[]) => void
}

type State =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'no-tasks' }

export function CaptureBox({ onParsed }: CaptureBoxProps) {
  const [text, setText] = useState('')
  const [state, setState] = useState<State>({ kind: 'idle' })

  const isLoading = state.kind === 'loading'
  const canSubmit = text.trim().length > 0 && !isLoading

  async function handleSubmit() {
    if (!canSubmit) return
    setState({ kind: 'loading' })

    try {
      const tasks = await parseTasks(text)

      if (tasks.length === 0) {
        setState({ kind: 'no-tasks' })
        return
      }

      onParsed(tasks)
      setText('')
      setState({ kind: 'idle' })
    } catch (error) {
      setState({
        kind: 'error',
        message:
          error instanceof ParseError ? error.message : 'Щось пішло не так.',
      })
    }
  }

  return (
    <section className="space-y-3">
      <label htmlFor="capture" className="block text-sm font-medium">
        Що в голові?
      </label>

      <textarea
        id="capture"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          // ⌘/Ctrl + Enter — розібрати, не перериваючи набір тексту
          if ((event.metaKey || event.ctrlKey) && event.key === 'Enter') {
            void handleSubmit()
          }
        }}
        disabled={isLoading}
        rows={5}
        placeholder="Вивали все, що крутиться в голові. Одним потоком, без структури — AI розбере."
        className="w-full resize-y rounded-xl border border-zinc-200 bg-white p-4 text-sm leading-relaxed outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-400 disabled:opacity-60 dark:border-zinc-800 dark:bg-zinc-950 dark:focus:border-zinc-600"
      />

      <div className="flex items-center gap-3">
        <Button onClick={handleSubmit} disabled={!canSubmit}>
          {isLoading ? (
            <>
              <Spinner />
              Розбираю…
            </>
          ) : (
            'Розбити на задачі'
          )}
        </Button>

        <span className="text-xs text-zinc-400">⌘ + Enter</span>
      </div>

      {state.kind === 'error' && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {state.message}{' '}
          <button
            onClick={handleSubmit}
            className="font-medium underline underline-offset-2"
          >
            Спробувати ще
          </button>
        </p>
      )}

      {state.kind === 'no-tasks' && (
        <p className="text-sm text-amber-600 dark:text-amber-500">
          Не вдалося виділити жодної задачі. Спробуй описати конкретніше — що саме
          треба зробити.
        </p>
      )}
    </section>
  )
}
