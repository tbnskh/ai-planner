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

function systemPrompt(): string {
  return `Ти — асистент планувальника задач. Користувач вивалює потік думок, а ти перетворюєш його на структурований список задач.

Сьогоднішня дата: ${todayISODate()}.

Правила:
- Виділяй кожну окрему дію як окрему задачу. Одне речення може містити кілька задач.
- Заголовок — коротка дієслівна фраза до 80 символів («Записатися до стоматолога», а не «мені треба нарешті записатися до стоматолога бо вже пів року тягну»).
- Відповідай ТІЄЮ Ж мовою, якою написаний вхідний текст.
- priority: high — є дедлайн, наслідки зволікання або явна терміновість; low — «колись», «як буде час»; medium — усе інше. Якщо сумніваєшся, став medium.
- estimatedMinutes став лише тоді, коли з тексту справді можна оцінити тривалість. Не вигадуй.
- notes додавай лише якщо в тексті є конкретика, яка не влізла в заголовок.
- dueDate виводь із відносних формулювань («до п'ятниці», «завтра», «до кінця місяця») відносно сьогоднішньої дати. Формат строго YYYY-MM-DD. Якщо дедлайну немає — не додавай поле.
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
  let text: unknown
  try {
    text = (await request.json())?.text
  } catch {
    return errorResponse('EMPTY_INPUT', 'Некоректний запит.', 400)
  }

  if (typeof text !== 'string' || text.trim().length === 0) {
    return errorResponse('EMPTY_INPUT', 'Текст порожній.', 400)
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return errorResponse('CONFIG', 'ANTHROPIC_API_KEY не налаштовано на сервері.', 500)
  }

  const client = new Anthropic({ apiKey })

  try {
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 8000,
      system: systemPrompt(),
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
