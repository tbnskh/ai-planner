import type { CSSProperties } from 'react'

export type YoomiExpression = 'calm' | 'happy' | 'organizing'

interface YoomiProps {
  expression?: YoomiExpression
  className?: string
  style?: CSSProperties
}

/**
 * Yoomi — желейний маскот продукту. Флет 2D, рожевий градієнт, великі очі,
 * глянець, рум'янець (за специфікацією маскота — форму й характер не міняємо,
 * лише перемикаємо вираз).
 *
 * expression:
 *  - calm  — спокійна, привітна (стартовий і порожній екрани)
 *  - happy — задоволена, усмішка + іскри (стан результату)
 */
const LABELS: Record<YoomiExpression, string> = {
  calm: 'Yoomi',
  happy: 'Yoomi усміхається',
  organizing: 'Yoomi організовує',
}

export function Yoomi({ expression = 'calm', className, style }: YoomiProps) {
  const isHappy = expression === 'happy'
  const isOrganizing = expression === 'organizing'
  const label = LABELS[expression]

  return (
    <svg
      viewBox="0 0 220 220"
      className={className}
      style={style}
      role="img"
      aria-label={label}
    >
      <defs>
        <radialGradient id="yoomi-body" cx="42%" cy="34%" r="78%">
          <stop offset="0%" stopColor="#ff74b3" />
          <stop offset="60%" stopColor="#ef4b95" />
          <stop offset="100%" stopColor="#d92b7d" />
        </radialGradient>
      </defs>

      {isHappy && <Sparkles />}

      {/* Тіло — куполоподібна желейка з м'яко-хвилястим низом */}
      <path
        fill="url(#yoomi-body)"
        d="M110 44c48 0 72 42 72 88 0 26-20 40-44 42-12 1-18 8-28 8s-16-7-28-8c-24-2-44-16-44-42 0-46 24-88 72-88z"
      />

      {/* Глянцевий відблиск */}
      <ellipse
        cx="82"
        cy="82"
        rx="26"
        ry="16"
        fill="#ffffff"
        opacity="0.22"
        transform="rotate(-22 82 82)"
      />

      {/* Рум'янець */}
      <ellipse cx="64" cy="140" rx="12" ry="7.5" fill="#ff7ab0" opacity={isHappy ? 0.75 : 0.55} />
      <ellipse cx="156" cy="140" rx="12" ry="7.5" fill="#ff7ab0" opacity={isHappy ? 0.75 : 0.55} />

      {/* Очі */}
      <Eye cx={88} organizing={isOrganizing} />
      <Eye cx={132} organizing={isOrganizing} />

      {/* Рот */}
      {isOrganizing ? (
        // Стурбоване «о»
        <ellipse cx="110" cy="146" rx="5" ry="6" fill="#1a1016" />
      ) : isHappy ? (
        <path
          d="M92 138q18 22 36 0"
          fill="none"
          stroke="#1a1016"
          strokeWidth="4"
          strokeLinecap="round"
        />
      ) : (
        <path
          d="M102 143q8 7 16 0"
          fill="none"
          stroke="#1a1016"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
      )}
    </svg>
  )
}

function Eye({ cx, organizing }: { cx: number; organizing: boolean }) {
  if (organizing) {
    // Великі стурбовані очі; зіниці «бігають» (клас анімується в globals.css).
    return (
      <>
        <ellipse cx={cx} cy={112} rx={18} ry={22} fill="#ffffff" />
        <circle className="yoomi-dart" cx={cx} cy={112} r={8} fill="#1a1016" />
        <circle cx={cx + 3} cy={108} r={2.6} fill="#ffffff" />
      </>
    )
  }

  return (
    <>
      <ellipse cx={cx} cy={113} rx={16} ry={19} fill="#ffffff" />
      {/* Зіниця трохи вгору — Yoomi «дивиться» на користувача */}
      <circle cx={cx + 2} cy={107} r={8.5} fill="#1a1016" />
      <circle cx={cx + 5} cy={103} r={2.8} fill="#ffffff" />
    </>
  )
}

function Sparkles() {
  return (
    <g fill="#fbbf24">
      <Sparkle x={44} y={58} scale={1.1} />
      <Sparkle x={182} y={70} scale={0.85} />
      <Sparkle x={190} y={128} scale={0.65} />
    </g>
  )
}

function Sparkle({ x, y, scale }: { x: number; y: number; scale: number }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${scale})`}
      d="M0 -9C1.6 -2.6 2.6 -1.6 9 0C2.6 1.6 1.6 2.6 0 9C-1.6 2.6 -2.6 1.6 -9 0C-2.6 -1.6 -1.6 -2.6 0 -9Z"
    />
  )
}
