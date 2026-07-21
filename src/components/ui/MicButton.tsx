'use client'

interface MicButtonProps {
  listening: boolean
  disabled?: boolean
  onClick: () => void
  className?: string
}

export function MicButton({
  listening,
  disabled,
  onClick,
  className = '',
}: MicButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={listening}
      aria-label={listening ? 'Зупинити запис' : 'Ввести голосом'}
      // 44px — мінімальна зручна зона тапу під палець на мобільному.
      className={`flex size-11 items-center justify-center rounded-full text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        listening
          ? 'animate-pulse bg-red-500 hover:bg-red-600'
          : 'bg-accent hover:bg-accent-hover'
      } ${className}`}
    >
      {listening ? <StopIcon /> : <MicIcon />}
    </button>
  )
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5 fill-none stroke-current stroke-2" aria-hidden>
      <rect x="9" y="3" width="6" height="11" rx="3" strokeLinejoin="round" />
      <path d="M5 11a7 7 0 0 0 14 0" strokeLinecap="round" />
      <path d="M12 18v3" strokeLinecap="round" />
    </svg>
  )
}

function StopIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 fill-current" aria-hidden>
      <rect x="6" y="6" width="12" height="12" rx="2" />
    </svg>
  )
}
