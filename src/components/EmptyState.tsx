export function EmptyState({ children }: { children: React.ReactNode }) {
  return (
    <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-center text-sm leading-relaxed text-muted">
      {children}
    </p>
  )
}
