import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

import { sanitizeParsedTasks } from '@/lib/schemas'
import { todayISODate } from '@/lib/tasks'
import type {
  ParseErrorCode,
  ParseErrorResponse,
  ParseSuccessResponse,
} from '@/lib/types'

export const runtime = 'nodejs'

const MODEL = 'claude-haiku-4-5'
const MAX_INPUT_LENGTH = 5000

/**
 * Structured outputs: модель фізично не може повернути нічого, крім
 * валідного JSON за цією схемою — жодних ```json, жодних преамбул.
 * Кореневий елемент має бути об'єктом, тому масив загорнуто в { tasks }.
 */
const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    tasks: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string', description: 'Коротке формулювання задачі, дієслівна фраза' },
          priority: { type: 'string', enum: ['high', 'medium', 'low'] },
          notes: { type: 'string', description: 'Уточнення з тексту, якщо воно є' },
          estimatedMinutes: { type: 'integer', description: 'Оцінка часу у хвилинах' },
          dueDate: { type: 'string', description: 'Дедлайн у форматі YYYY-MM-DD' },
        },
        required: ['title', 'priority'],
        additionalProperties: false,
      },
    },
  },
  required: ['tasks'],
  additionalProperties: false,
} as const

interface DateContext {
  today: string
  weekday: string
}

/**
 * Дата й день тижня надходять від клієнта (локальний час користувача).
 * Сервер Vercel працює в UTC, тож обчислення дати на сервері давало зсув на день
 * у формулюваннях на кшталт «сьогодні» / «до п'ятниці». Якщо клієнт нічого не
 * передав — м'який fallback на серверну дату.
 */
function resolveDateContext(raw: unknown): DateContext {
  const source = (raw ?? {}) as { today?: unknown; weekday?: unknown }
  const isIsoDate = typeof source.today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(source.today)

  if (isIsoDate && typeof source.weekday === 'string' && source.weekday.length > 0) {
    return { today: source.today as string, weekday: source.weekday }
  }

  const now = new Date()
  return {
    today: todayISODate(now),
    weekday: new Intl.DateTimeFormat('uk-UA', { weekday: 'long' }).format(now),
  }
}

function systemPrompt({ today, weekday }: DateContext): string {
  return `Ти — асистент планувальника задач. Користувач вивалює потік думок, а ти перетворюєш його на структурований список задач.

Сьогодні ${weekday}, ${today}.

Правила:
- Виділяй кожну окрему дію як окрему задачу. Одне речення може містити кілька задач.
- Заголовок — коротка дієслівна фраза до 80 символів («Записатися до стоматолога», а не «мені треба нарешті записатися до стоматолога бо вже пів року тягну»).
- Відповідай ТІЄЮ Ж мовою, якою написаний вхідний текст.
- priority: high — є дедлайн, наслідки зволікання або явна терміновість; low — «колись», «як буде час»; medium — усе інше. Якщо сумніваєшся, став medium.
- estimatedMinutes став лише тоді, коли з тексту справді можна оцінити тривалість. Не вигадуй.
- notes додавай лише якщо в тексті є конкретика, яка не влізла в заголовок.
- dueDate виводь із відносних формулювань відносно сьогоднішньої дати (${today}). Формат строго YYYY-MM-DD. Якщо дедлайну немає — не додавай поле.
- Якщо користувач каже зробити щось «сьогодні» — постав dueDate рівно сьогоднішній даті (${today}). «завтра» — наступний день, і так далі.
- Не додавай задач, яких немає в тексті. Не об'єднуй різні дії в одну.
- Якщо в тексті немає жодної дії — поверни порожній масив.`
}

function errorResponse(
  code: ParseErrorCode,
  message: string,
  httpStatus: number,
): NextResponse<ParseErrorResponse> {
  return NextResponse.json({ error: code, message }, { status: httpStatus })
}

export async function POST(
  request: Request,
): Promise<NextResponse<ParseSuccessResponse | ParseErrorResponse>> {
  // Спершу валідуємо запит — це дешево й детерміновано, і не залежить від конфігурації.
  let body: { text?: unknown; today?: unknown; weekday?: unknown }
  try {
    body = await request.json()
  } catch {
    return errorResponse('EMPTY_INPUT', 'Некоректний запит.', 400)
  }

  const text = body?.text
  if (typeof text !== 'string' || text.trim().length === 0) {
    return errorResponse('EMPTY_INPUT', 'Текст порожній.', 400)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return errorResponse('CONFIG', 'ANTHROPIC_API_KEY не налаштовано на сервері.', 500)
  }

  const dateContext = resolveDateContext(body)
  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: systemPrompt(dateContext),
      output_config: { format: { type: 'json_schema', schema: OUTPUT_SCHEMA } },
      messages: [{ role: 'user', content: text.slice(0, MAX_INPUT_LENGTH) }],
    })

    const textBlock = response.content.find((block) => block.type === 'text')
    if (!textBlock) {
      return NextResponse.json({ tasks: [] })
    }

    // Structured outputs гарантує валідний JSON, але парсинг усе одно в try/catch:
    // відповідь могла обірватися на max_tokens.
    let payload: unknown
    try {
      payload = JSON.parse(textBlock.text)
    } catch {
      return errorResponse('UPSTREAM', 'Не вдалося прочитати відповідь моделі.', 502)
    }

    const tasks = sanitizeParsedTasks(
      (payload as { tasks?: unknown } | null)?.tasks,
    )

    return NextResponse.json({ tasks })
  } catch (error) {
    if (error instanceof Anthropic.RateLimitError) {
      return errorResponse('RATE_LIMIT', 'Забагато запитів. Спробуй за хвилину.', 429)
    }
    if (error instanceof Anthropic.AuthenticationError) {
      return errorResponse('CONFIG', 'Невалідний API-ключ.', 500)
    }
    if (error instanceof Anthropic.APIError) {
      return errorResponse('UPSTREAM', 'AI-сервіс тимчасово недоступний.', 502)
    }
    return errorResponse('UNKNOWN', 'Несподівана помилка.', 500)
  }
}
