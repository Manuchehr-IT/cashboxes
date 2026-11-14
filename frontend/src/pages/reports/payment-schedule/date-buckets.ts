export type Granularity = "day" | "week" | "month"

export interface Bucket {
  key: string
  startKey: string
  endKey: string
  label: string
  sub: string
  year: number
}

const WEEKDAYS_SHORT = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
const MONTHS_SHORT = ["янв", "фев", "мар", "апр", "май", "июн", "июл", "авг", "сен", "окт", "ноя", "дек"]

export function todayKey(): string {
  return new Date().toISOString().slice(0, 10)
}

export function startOfMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number)
  return `${y}-${String(m).padStart(2, "0")}-01`
}

export function endOfMonthKey(key: string): string {
  const [y, m] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m, 0)).toISOString().slice(0, 10)
}

export function addDaysKey(key: string, days: number): string {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10)
}

export function addMonthsKey(key: string, months: number): string {
  const [y, m, d] = key.split("-").map(Number)
  return new Date(Date.UTC(y, m - 1 + months, d)).toISOString().slice(0, 10)
}

function dayOfMonth(key: string): number {
  return Number(key.slice(8, 10))
}

function yearOf(key: string): number {
  return Number(key.slice(0, 4))
}

function weekdayShort(key: string): string {
  const [y, m, d] = key.split("-").map(Number)
  return WEEKDAYS_SHORT[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]
}

function monthShort(key: string): string {
  const m = Number(key.slice(5, 7))
  return MONTHS_SHORT[m - 1]
}

export function daysBetweenKeys(fromKey: string, toKey: string): number {
  const a = new Date(`${fromKey}T00:00:00Z`).getTime()
  const b = new Date(`${toKey}T00:00:00Z`).getTime()
  return Math.round((b - a) / 86400000)
}

export function getGranularity(fromKey: string, toKey: string): Granularity {
  const days = daysBetweenKeys(fromKey, toKey) + 1
  if (days <= 31) return "day"
  if (days <= 91) return "week"
  return "month"
}

/** Период дольше 12 месяцев обрезается с конца — графику с дневной/недельной детализацией
 * такой размах всё равно нечитаем, а месячная сетка больше 12 колонок не несёт пользы. */
export function clampRange(fromKey: string, toKey: string): { to: string; clamped: boolean } {
  const maxTo = addDaysKey(addMonthsKey(fromKey, 12), -1)
  if (toKey > maxTo) return { to: maxTo, clamped: true }
  return { to: toKey, clamped: false }
}

export function buildBuckets(fromKey: string, toKey: string, granularity: Granularity): Bucket[] {
  const buckets: Bucket[] = []

  if (granularity === "day") {
    let cur = fromKey
    while (cur <= toKey) {
      buckets.push({
        key: cur, startKey: cur, endKey: cur,
        label: String(dayOfMonth(cur)).padStart(2, "0"),
        sub: weekdayShort(cur),
        year: yearOf(cur),
      })
      cur = addDaysKey(cur, 1)
    }
  } else if (granularity === "week") {
    let cur = fromKey
    while (cur <= toKey) {
      const end = addDaysKey(cur, 6) > toKey ? toKey : addDaysKey(cur, 6)
      buckets.push({
        key: cur, startKey: cur, endKey: end,
        label: `${dayOfMonth(cur)}–${dayOfMonth(end)}`,
        sub: monthShort(cur),
        year: yearOf(cur),
      })
      cur = addDaysKey(cur, 7)
    }
  } else {
    let cur = startOfMonthKey(fromKey)
    const lastStart = startOfMonthKey(toKey)
    while (cur <= lastStart) {
      const naturalEnd = endOfMonthKey(cur)
      const end = naturalEnd > toKey ? toKey : naturalEnd
      buckets.push({
        key: cur, startKey: cur, endKey: end,
        label: monthShort(cur),
        sub: String(yearOf(cur)),
        year: yearOf(cur),
      })
      cur = addMonthsKey(cur, 1)
    }
  }

  return buckets
}

export interface YearRun {
  year: number
  span: number
}

export function buildYearRuns(buckets: Bucket[]): YearRun[] {
  const runs: YearRun[] = []
  for (const b of buckets) {
    const last = runs[runs.length - 1]
    if (last && last.year === b.year) last.span += 1
    else runs.push({ year: b.year, span: 1 })
  }
  return runs
}

export function isMultiYear(buckets: Bucket[]): boolean {
  return new Set(buckets.map((b) => b.year)).size > 1
}
