import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AvailabilityForm from '@/components/AvailabilityForm'
import { createClient } from '@/lib/supabase/client'

// Mock @/lib/supabase/client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      insert: jest.fn().mockResolvedValue({ data: [], error: null }),
    })),
  })),
}))

// Mock lucide-react Check icon
jest.mock('lucide-react', () => ({
  __esModule: true,
  Check: ({ size, color }: { size: number; color: string }) => (
    <svg data-testid="check-icon" width={size} stroke={color} />
  ),
}))

const baseEvent = {
  id: 'evt-1',
  name: 'Test Event',
  date_start: '2024-01-01', // Monday
  date_end: '2024-01-07',   // Sunday
  days_of_week: [1, 3],     // Mon, Wed
  time_windows: ['Morning', 'Afternoon', 'Evening'],
}

describe('AvailabilityForm', () => {
  it('renders only eligible dates (matching days_of_week)', () => {
    render(<AvailabilityForm event={baseEvent} />)
    // Mon Jan 1 and Wed Jan 3 should appear; others should not
    expect(screen.getByText(/Mon, Jan 1/i)).toBeInTheDocument()
    expect(screen.getByText(/Wed, Jan 3/i)).toBeInTheDocument()
    // Tue Jan 2 should NOT appear
    expect(screen.queryByText(/Tue, Jan 2/i)).not.toBeInTheDocument()
  })

  it('renders all time windows for each eligible date', () => {
    render(<AvailabilityForm event={baseEvent} />)
    // Each of 2 dates × 3 windows = 6 window labels
    const morningLabels = screen.getAllByText('Morning')
    expect(morningLabels).toHaveLength(2)
    const afternoonLabels = screen.getAllByText('Afternoon')
    expect(afternoonLabels).toHaveLength(2)
  })

  it('toggles time window selection on click', async () => {
    const user = userEvent.setup()
    render(<AvailabilityForm event={baseEvent} />)
    const morningSpans = screen.getAllByText('Morning')
    // Click on the first "Morning" label's span
    await user.click(morningSpans[0])
    // The checkbox div should now show the check icon
    expect(screen.getAllByTestId('check-icon')).toHaveLength(1)
  })

  it('deselects a window on second click', async () => {
    const user = userEvent.setup()
    render(<AvailabilityForm event={baseEvent} />)
    const morningSpans = screen.getAllByText('Morning')
    await user.click(morningSpans[0])
    expect(screen.getAllByTestId('check-icon')).toHaveLength(1)
    await user.click(morningSpans[0])
    expect(screen.queryByTestId('check-icon')).not.toBeInTheDocument()
  })

  it('shows error when submitting without a name', async () => {
    render(<AvailabilityForm event={baseEvent} />)
    // Use fireEvent.submit to bypass native HTML5 required validation in jsdom
    const form = screen.getByRole('button', { name: /save my availability/i }).closest('form')!
    fireEvent.submit(form)
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument()
  })

  it('shows error when submitting with name but no time windows selected', async () => {
    const user = userEvent.setup()
    render(<AvailabilityForm event={baseEvent} />)
    const nameInput = screen.getByPlaceholderText(/enter your name/i)
    await user.type(nameInput, 'Alice')
    const form = screen.getByRole('button', { name: /save my availability/i }).closest('form')!
    fireEvent.submit(form)
    expect(screen.getByText(/please select at least one time slot/i)).toBeInTheDocument()
  })

  it('shows success state after valid submit', async () => {
    const user = userEvent.setup()
    render(<AvailabilityForm event={baseEvent} />)
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Alice')
    await user.click(screen.getAllByText('Morning')[0])
    const form = screen.getByRole('button', { name: /save my availability/i }).closest('form')!
    fireEvent.submit(form)
    await waitFor(() => {
      expect(screen.getByText(/availability saved/i)).toBeInTheDocument()
    })
  })

  it('uses initialFirstName if provided and disables the name input', () => {
    render(<AvailabilityForm event={baseEvent} initialFirstName="Bob" />)
    const input = screen.getByDisplayValue('Bob')
    expect(input).toBeDisabled()
  })

  it('calls supabase insert with correct payload on submit', async () => {
    const mockInsert = jest.fn().mockResolvedValue({ data: [], error: null })
    ;(createClient as jest.Mock).mockReturnValue({
      from: jest.fn(() => ({ insert: mockInsert })),
    })

    const user = userEvent.setup()
    render(<AvailabilityForm event={baseEvent} userId="user-123" />)
    await user.type(screen.getByPlaceholderText(/enter your name/i), 'Alice')
    await user.click(screen.getAllByText('Morning')[0])
    const form = screen.getByRole('button', { name: /save my availability/i }).closest('form')!
    fireEvent.submit(form)

    await waitFor(() => {
      expect(mockInsert).toHaveBeenCalledWith(
        expect.arrayContaining([
          expect.objectContaining({
            event_id: 'evt-1',
            user_id: 'user-123',
            first_name: 'Alice',
            available_date: '2024-01-01',
            time_windows: ['Morning'],
          }),
        ])
      )
    })
  })
})
