export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(' ')
}

export function pad(n: number) {
  return String(n).padStart(2, '0')
}
