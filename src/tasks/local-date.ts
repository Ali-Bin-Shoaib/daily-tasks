export function localDateKey(now = new Date()): string {
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function formatLongDate(key: string, locale?: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key)
  if (!match) return key

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(year, month - 1, day))
}
