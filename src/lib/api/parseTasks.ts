import { sanitizeParsedTasks } from '../schemas'
import type { ParseErrorCode, ParsedTask } from '../types'

export class ParseError extends Error {
  constructor(readonly code: ParseErrorCode, message: string) {
    super(message)
    this.name = 'ParseError'
  }
}

/** Типізований клієнт /api/parse. Компоненти не знають про fetch. */
export async function parseTasks(text: string): Promise<ParsedTask[]> {
  let response: Response
  try {
    response = await fetch('/api/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
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
