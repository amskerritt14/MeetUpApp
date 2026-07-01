import { getEligibleDays, getBestDate } from '@/lib/dateHelpers'
import { format } from 'date-fns'

describe('getEligibleDays', () => {
  it('returns only days matching the daysOfWeek filter', () => {
    // 2024-01-01 is Monday (1), 2024-01-07 is Sunday (0)
    const days = getEligibleDays('2024-01-01', '2024-01-07', [1, 3]) // Mon, Wed
    const formatted = days.map(d => format(d, 'yyyy-MM-dd'))
    expect(formatted).toEqual(['2024-01-01', '2024-01-03'])
  })

  it('returns empty array when no days match', () => {
    // 2024-01-01 is Monday; ask for only Sunday (0)
    const days = getEligibleDays('2024-01-01', '2024-01-05', [0])
    expect(days).toHaveLength(0)
  })

  it('returns all days when all weekdays are included', () => {
    const days = getEligibleDays('2024-01-01', '2024-01-07', [0, 1, 2, 3, 4, 5, 6])
    expect(days).toHaveLength(7)
  })

  it('handles single-day range matching', () => {
    // 2024-01-01 = Monday (1)
    const days = getEligibleDays('2024-01-01', '2024-01-01', [1])
    expect(days).toHaveLength(1)
    expect(format(days[0], 'yyyy-MM-dd')).toBe('2024-01-01')
  })

  it('handles single-day range not matching', () => {
    // 2024-01-01 = Monday (1), ask for Tuesday (2)
    const days = getEligibleDays('2024-01-01', '2024-01-01', [2])
    expect(days).toHaveLength(0)
  })

  it('returns correct weekends-only days', () => {
    // Week of 2024-01-01 (Mon) to 2024-01-07 (Sun)
    const days = getEligibleDays('2024-01-01', '2024-01-07', [0, 6]) // Sun, Sat
    const formatted = days.map(d => format(d, 'yyyy-MM-dd'))
    expect(formatted).toEqual(['2024-01-06', '2024-01-07']) // Sat=6th, Sun=7th
  })
})

describe('getBestDate', () => {
  it('returns null for empty availability', () => {
    expect(getBestDate([])).toBeNull()
  })

  it('returns the only date when there is one entry', () => {
    const result = getBestDate([
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
    ])
    expect(result).toBe('2024-01-01')
  })

  it('returns the date with the most unique respondents', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
      { first_name: 'Carol', available_date: '2024-01-02', time_windows: ['Afternoon'] },
    ]
    expect(getBestDate(availability)).toBe('2024-01-02')
  })

  it('counts unique respondents, not total entries', () => {
    // Alice submits two entries for 2024-01-01 but should count as 1 unique
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Afternoon'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
      { first_name: 'Carol', available_date: '2024-01-02', time_windows: ['Morning'] },
    ]
    // 2024-01-01 has 1 unique (Alice); 2024-01-02 has 2 unique (Bob, Carol)
    expect(getBestDate(availability)).toBe('2024-01-02')
  })

  it('handles ties by returning the first-encountered date', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
    ]
    // Both dates have 1 unique respondent — first encountered wins (2024-01-01)
    expect(getBestDate(availability)).toBe('2024-01-01')
  })

  it('handles multiple respondents on same date', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-03', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-03', time_windows: ['Evening'] },
      { first_name: 'Carol', available_date: '2024-01-03', time_windows: ['Afternoon'] },
      { first_name: 'Dave', available_date: '2024-01-04', time_windows: ['Morning'] },
    ]
    expect(getBestDate(availability)).toBe('2024-01-03')
  })
})
