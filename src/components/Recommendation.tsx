import { format, parseISO } from 'date-fns'

interface AvailabilityEntry {
  first_name: string
  available_date: string
  time_windows: string[]
}

interface RecommendationProps {
  availability: AvailabilityEntry[]
}

export default function Recommendation({ availability }: RecommendationProps) {
  if (availability.length === 0) {
    return (
      <div style={{ background: '#f0f0f0', borderRadius: '14px', padding: '20px', color: '#888', textAlign: 'center' }}>
        No responses yet — share the link to get the ball rolling!
      </div>
    )
  }

  const dateMap: Record<string, Set<string>> = {}
  const windowMap: Record<string, Record<string, Set<string>>> = {}

  availability.forEach(a => {
    if (!dateMap[a.available_date]) dateMap[a.available_date] = new Set()
    dateMap[a.available_date].add(a.first_name)
    if (!windowMap[a.available_date]) windowMap[a.available_date] = {}
    a.time_windows.forEach(w => {
      if (!windowMap[a.available_date][w]) windowMap[a.available_date][w] = new Set()
      windowMap[a.available_date][w].add(a.first_name)
    })
  })

  let bestDate = ''
  let bestCount = 0
  Object.entries(dateMap).forEach(([date, names]) => {
    if (names.size > bestCount) {
      bestCount = names.size
      bestDate = date
    }
  })

  let bestWindow = ''
  let bestWindowCount = 0
  if (bestDate && windowMap[bestDate]) {
    Object.entries(windowMap[bestDate]).forEach(([w, names]) => {
      if (names.size > bestWindowCount) {
        bestWindowCount = names.size
        bestWindow = w
      }
    })
  }

  return (
    <div style={{ background: '#1E3A28', color: 'white', borderRadius: '14px', padding: '20px 24px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
      <div style={{ fontSize: '2rem' }}>🏆</div>
      <div>
        <div style={{ fontWeight: '700', fontSize: '1rem', marginBottom: '4px' }}>Best day to meet</div>
        <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#C8A87A' }}>
          {format(parseISO(bestDate), 'EEEE, MMMM d')}
        </div>
        <div style={{ fontSize: '0.9rem', color: '#ccc', marginTop: '4px' }}>
          {bestCount} {bestCount === 1 ? 'person' : 'people'} free{bestWindow ? ` · Best time: ${bestWindow}` : ''}
        </div>
      </div>
    </div>
  )
}
