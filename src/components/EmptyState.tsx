export function EmptyState({ children }: { children: React.ReactNode }) {
  // Тихий однорядковий рядок під заголовком секції — без рамки й коробки.
  return <p className="px-1 text-sm text-muted">{children}</p>
}
