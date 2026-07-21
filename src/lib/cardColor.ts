/**
 * Яскраві кольори карток, підібрані так, щоб білий текст читався.
 * Колір призначається за id задачі — виглядає «випадково», але стабільний:
 * та сама задача завжди того самого кольору, тож при кожному кліку/перемальовуванні
 * картки не блимають новими барвами.
 */
const CARD_COLORS = [
  '#4f46e5', // indigo
  '#2563eb', // blue
  '#7c3aed', // violet
  '#c026d3', // fuchsia
  '#db2777', // pink
  '#e11d48', // rose
  '#dc2626', // red
  '#ea580c', // orange
] as const

function hashString(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return Math.abs(hash)
}

export function cardColor(id: string): string {
  return CARD_COLORS[hashString(id) % CARD_COLORS.length]
}
