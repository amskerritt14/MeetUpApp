import React from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalendarView from '@/components/CalendarView'

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  __esModule: true,
  ChevronLeft: () => <svg data-testid="chevron-left" />,
  ChevronRight: () => <svg data-testid="chevron-right" />,
}))

// Mock Recommendation to keep CalendarView tests focused
jest.mock('@/components/Recommendation', () => ({
  __esModule: true,
  default: () => <div data-testid="recommendation-mock" />,
}))

const baseEvent = {
  id: 'evt-1',
  name: 'Test Event',
  date_start: '2024-01-01', // Monday — so month view starts in Jan 2024
  date_end: '2024-01-31',
  days_of_week: [1, 3, 5], // Mon, Wed, Fri
  time_windows: ['Morning', 'Afternoon'],
}

const baseAvailability = [
  { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
  { first_name: 'Bob', available_date: '2024-01-01', time_windows: ['Afternoon'] },
  { first_name: 'Carol', available_date: '2024-01-03', time_windows: ['Morning'] },
]

describe('CalendarView', () => {
  it('renders month view by default (shows day names header)', () => {
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    // Month view shows day-name column headers Sun Mon Tue ...
    expect(screen.getByText('Sun')).toBeInTheDocument()
    expect(screen.getByText('Mon')).toBeInTheDocument()
  })

  it('switches to week view when Week button is clicked', async () => {
    const user = userEvent.setup()
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    await user.click(screen.getByRole('button', { name: /week/i }))
    // Week view shows nav label with date range (e.g. "31 Dec – 6 Jan 2024")
    expect(screen.getByText(/–/)).toBeInTheDocument()
  })

  it('switches to day view when Day button is clicked', async () => {
    const user = userEvent.setup()
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    await user.click(screen.getByRole('button', { name: /day/i }))
    // Day view shows a full date label
    expect(screen.getByText(/Monday, 1 January 2024/i)).toBeInTheDocument()
  })

  it('shows correct free/total count badge on an eligible day with responses', () => {
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    // 2024-01-01 (Monday) has 2 unique respondents; total respondents = 3 (Alice, Bob, Carol)
    expect(screen.getByText('2/3 free')).toBeInTheDocument()
  })

  it('shows "No responses" badge on eligible days without responses', () => {
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    // Some Mon/Wed/Fri in January will have no responses
    const noResponseBadges = screen.getAllByText('No responses')
    expect(noResponseBadges.length).toBeGreaterThan(0)
  })

  it('renders the Recommendation component', () => {
    render(<CalendarView event={baseEvent} availability={baseAvailability} />)
    expect(screen.getByTestId('recommendation-mock')).toBeInTheDocument()
  })

  it('shows "Not an event day." in day view for non-event days', async () => {
    const user = userEvent.setup()
    // Set start on a Tuesday (non-event day per days_of_week=[1,3,5])
    const eventWithTuesdayStart = { ...baseEvent, date_start: '2024-01-02' } // Tuesday
    render(<CalendarView event={eventWithTuesdayStart} availability={[]} />)
    await user.click(screen.getByRole('button', { name: /day/i }))
    expect(screen.getByText('Not an event day.')).toBeInTheDocument()
  })

  it('shows "No responses yet for this day." in day view on event day with no data', async () => {
    const user = userEvent.setup()
    // date_start=Monday (event day), no availability
    render(<CalendarView event={baseEvent} availability={[]} />)
    await user.click(screen.getByRole('button', { name: /day/i }))
    expect(screen.getByText('No responses yet for this day.')).toBeInTheDocument()
  })

  it('has three view toggle buttons', () => {
    render(<CalendarView event={baseEvent} availability={[]} />)
    expect(screen.getByRole('button', { name: /month/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /week/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /day/i })).toBeInTheDocument()
  })
})
