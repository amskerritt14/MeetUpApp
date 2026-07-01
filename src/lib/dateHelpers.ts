import { eachDayOfInterval, parseISO, getDay } from 'date-fns'

/**
 * Returns all dates in [dateStart, dateEnd] whose day-of-week is in daysOfWeek.
 * daysOfWeek uses JS getDay() values: 0 = Sunday, 6 = Saturday.
 */
export function getEligibleDays(
  dateStart: string,
  dateEnd: string,
  daysOfWeek: number[]
): Date[] {
  const allDates = eachDayOfInterval({
    start: parseISO(dateStart),
    end: parseISO(dateEnd),
  })
  return allDates.filter(d => daysOfWeek.includes(getDay(d)))
}

/**
 * Given availability rows, returns the date string with the most unique respondents.
 * Returns null if the array is empty.
 * Ties are broken by whichever date is encountered first.
 */
export function getBestDate(
  availability: {
    first_name: string
    available_date: string
    time_windows: string[]
  }[]
): string | null {
  if (availability.length === 0) return null

  const dateMap: Record<string, Set<string>> = {}
  for (const a of availability) {
    if (!dateMap[a.available_date]) dateMap[a.available_date] = new Set()
    dateMap[a.available_date].add(a.first_name)
  }

  let bestDate = ''
  let bestCount = 0
  for (const [date, names] of Object.entries(dateMap)) {
    if (names.size > bestCount) {
      bestCount = names.size
      bestDate = date
    }
  }
  return bestDate || null
}
