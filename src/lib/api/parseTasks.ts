import { sanitizeParsedTasks } from '../schemas'
import { todayISODate } from '../tasks'
import type { ParseErrorCode, ParsedTask } from '../types'

export class ParseError extends Error {
  constructor(readonly code: ParseErrorCode, message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

/** Типізований клієнт /api/parse. Компоненти не знають про fetch. */
export async function parseTasks(text: string): Promise<ParsedTask[]> {
  // Дату й день тижня беремо з локального часу браузера, а не з UTC-сервера,
  // щоб «сьогодні» й відносні дати рахувалися для правильного дня користувача.
  const now = new Date()
  const today = todayISODate(now)
  const weekday = new Intl.DateTimeFormat('uk-UA', { weekday: 'long' }).format(now)

  let response: Response
  try {
    response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, today, weekday }),
    })
  } catch {
    throw new ParseError('NETWORK', 'Немає зв’язку з сервером.')
  }

  const payload: unknown = await response.json().catch(() => null)

  if (!response.ok) {
    const error = payload as { error?: ParseErrorCode; message?: string } | null
    throw new ParseError(
      error?.error ?? 'UNKNOWN',
      error?.message ?? 'Не вдалося розібрати текст.',
    )
  }

  return sanitizeParsedTasks((payload as { tasks?: unknown } | null)?.tasks)
}
