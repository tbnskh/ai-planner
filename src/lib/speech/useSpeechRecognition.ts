'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react'

/**
 * Тонка обгортка над Web Speech API.
 *
 * Розпізнавання відбувається засобами браузера (Chrome — сервери Google,
 * Safari — Apple), тобто аудіо залишає пристрій. UI попереджає про це окремо.
 *
 * Хук нічого не знає про поле вводу: він лише віддає розпізнаний текст через
 * onResult. Композицію «базовий текст + голос» робить компонент.
 */

export type SpeechErrorKind = 'not-allowed' | 'no-speech' | 'generic'

interface UseSpeechRecognitionOptions {
  lang?: string
  /** Отримує накопичений транскрипт (фінальний + проміжний) цієї сесії. */
  onResult: (transcript: string) => void
}

interface UseSpeechRecognitionResult {
  /** false, якщо браузер не має Web Speech API — тоді кнопку мікрофона ховаємо. */
  supported: boolean
  listening: boolean
  error: SpeechErrorKind | null
  start: () => void
  stop: () => void
}

// Web Speech API ще не в стандартних lib.dom-типах — описуємо мінімум, що нам треба.
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((event: SpeechRecognitionEventLike) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
}

interface SpeechRecognitionEventLike {
  resultIndex: number
  results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean }>
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getRecognitionCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

// Підтримка — зовнішня константа середовища. useSyncExternalStore дає окремий
// серверний знімок (false), тож перший клієнтський рендер збігається з сервером.
const noopSubscribe = () => () => {}
const getSupportedSnapshot = () => getRecognitionCtor() !== null
const getSupportedServerSnapshot = () => false

export function useSpeechRecognition({
  lang = 'uk-UA',
  onResult,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionResult {
  const supported = useSyncExternalStore(
    noopSubscribe,
    getSupportedSnapshot,
    getSupportedServerSnapshot,
  )
  const [listening, setListening] = useState(false)
  const [error, setError] = useState<SpeechErrorKind | null>(null)

  const recognitionRef = useRef<SpeechRecognitionLike | null>(null)
  // Тримаємо onResult у ref, щоб не перестворювати recognition на кожен рендер.
  const onResultRef = useRef(onResult)
  const finalRef = useRef('')

  useEffect(() => {
    onResultRef.current = onResult
  }, [onResult])

  const stop = useCallback(() => {
    recognitionRef.current?.stop()
  }, [])

  const start = useCallback(() => {
    const Ctor = getRecognitionCtor()
    if (!Ctor) return

    // Захист від подвійного старту (напр. швидкий подвійний тап).
    if (recognitionRef.current) {
      recognitionRef.current.abort()
      recognitionRef.current = null
    }

    const recognition = new Ctor()
    recognition.lang = lang
    recognition.continuous = true
    recognition.interimResults = true
    finalRef.current = ''
    setError(null)

    recognition.onresult = (event) => {
      let interim = ''
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const result = event.results[i]
        const chunk = result[0].transcript
        if (result.isFinal) {
          finalRef.current += chunk
        } else {
          interim += chunk
        }
      }
      onResultRef.current((finalRef.current + interim).trimStart())
    }

    recognition.onerror = (event) => {
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setError('not-allowed')
      } else if (event.error === 'no-speech') {
        setError('no-speech')
      } else if (event.error !== 'aborted') {
        setError('generic')
      }
    }

    recognition.onend = () => {
      setListening(false)
      recognitionRef.current = null
    }

    recognitionRef.current = recognition
    try {
      recognition.start()
      setListening(true)
    } catch {
      // start() кидає, якщо викликати двічі поспіль — стан просто лишається off.
      recognitionRef.current = null
    }
  }, [lang])

  // Прибираємо розпізнавання при розмонтуванні, щоб мікрофон не лишався активним.
  useEffect(() => {
    return () => {
      recognitionRef.current?.abort()
      recognitionRef.current = null
    }
  }, [])

  return { supported, listening, error, start, stop }
}
