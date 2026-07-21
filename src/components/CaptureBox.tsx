'use client'

import { useRef, useState } from 'react'

import { ParseError, parseTasks } from '@/lib/api/parseTasks'
import { useSpeechRecognition } from '@/lib/speech/useSpeechRecognition'
import type { ParsedTask } from '@/lib/types'

import { Button } from './ui/Button'
import { MicButton } from './ui/MicButton'
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

  // Текст, що вже був у полі на момент старту запису — голос доповнює, не затирає.
  const baseTextRef = useRef('')

  const speech = useSpeechRecognition({
    onResult: (transcript) => {
      const base = baseTextRef.current
      setText(base ? `${base} ${transcript}` : transcript)
    },
  })

  const isLoading = state.kind === 'loading'
  const canSubmit = text.trim().length > 0 && !isLoading

  function toggleRecording() {
    if (speech.listening) {
      speech.stop()
      return
    }
    baseTextRef.current = text.trimEnd()
    speech.start()
  }

  async function handleSubmit() {
    if (!canSubmit) return
    if (speech.listening) speech.stop()
    setState({ kind: 'loading' })

    try {
      const tasks = await parseTasks(text)

      if (tasks.length === 0) {
        setState({ kind: 'no-tasks' })
        return
      }

      onParsed(tasks)
      setText('')
      baseTextRef.current = ''
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
      <label htmlFor="capture" className="block px-1 text-sm font-medium text-muted">
        Що в голові?
      </label>

      <div className="relative">
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
          rows={3}
          placeholder="Вивантаж все, що крутиться в голові. Yoomi організує"
          className="w-full resize-none rounded-2xl border border-border bg-surface p-4 pr-16 text-sm leading-relaxed text-foreground outline-none transition-colors placeholder:text-muted focus:border-accent disabled:opacity-60"
        />

        {speech.supported && (
          <MicButton
            listening={speech.listening}
            disabled={isLoading}
            onClick={toggleRecording}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          />
        )}
      </div>

      {speech.listening && (
        <p className="flex items-center gap-2 px-1 text-sm text-red-400">
          <span className="inline-block size-2 animate-pulse rounded-full bg-red-500" />
          Слухаю…
        </p>
      )}

      {speech.error === 'not-allowed' && (
        <p className="px-1 text-sm text-amber-400">
          Доступ до мікрофона заборонено. Дозволь його в налаштуваннях браузера —
          або просто друкуй текстом.
        </p>
      )}

      {state.kind === 'error' && (
        <p className="px-1 text-sm text-red-400">
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
        <p className="px-1 text-sm text-amber-400">
          Не вдалося виділити жодної задачі. Спробуй описати конкретніше — що саме
          треба зробити.
        </p>
      )}

      <Button onClick={handleSubmit} disabled={!canSubmit} className="w-full">
        {isLoading ? (
          <>
            <Spinner />
            Yoomi організує…
          </>
        ) : (
          'Розбити на задачі'
        )}
      </Button>

      {speech.supported && (
        <p className="px-1 text-center text-xs text-muted/70">
          Голос розпізнається засобами браузера
        </p>
      )}
    </section>
  )
}
