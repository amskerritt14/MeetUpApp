import React from 'react'
import { render, screen } from '@testing-library/react'
import Recommendation from '@/components/Recommendation'

describe('Recommendation', () => {
  it('renders "No responses yet" when availability is empty', () => {
    render(<Recommendation availability={[]} />)
    expect(screen.getByText(/No responses yet/i)).toBeInTheDocument()
  })

  it('picks the date with the most unique respondents', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
      { first_name: 'Carol', available_date: '2024-01-02', time_windows: ['Afternoon'] },
    ]
    render(<Recommendation availability={availability} />)
    // 2024-01-02 = Tuesday, January 2
    expect(screen.getByText(/Tuesday, January 2/i)).toBeInTheDocument()
  })

  it('shows the correct count of free people', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-02', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
      { first_name: 'Carol', available_date: '2024-01-02', time_windows: ['Afternoon'] },
    ]
    render(<Recommendation availability={availability} />)
    expect(screen.getByText(/3 people free/i)).toBeInTheDocument()
  })

  it('shows the best time window', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-02', time_windows: ['Morning', 'Afternoon'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
    ]
    render(<Recommendation availability={availability} />)
    expect(screen.getByText(/Best time: Morning/i)).toBeInTheDocument()
  })

  it('shows singular "person" for count of 1', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
    ]
    render(<Recommendation availability={availability} />)
    expect(screen.getByText(/1 person free/i)).toBeInTheDocument()
  })

  it('handles ties by picking the first-encountered date', () => {
    // Both dates have exactly 1 unique respondent — first processed wins
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
      { first_name: 'Bob', available_date: '2024-01-02', time_windows: ['Morning'] },
    ]
    render(<Recommendation availability={availability} />)
    // Monday January 1 should win
    expect(screen.getByText(/Monday, January 1/i)).toBeInTheDocument()
  })

  it('renders the trophy icon area (Best day to meet heading)', () => {
    const availability = [
      { first_name: 'Alice', available_date: '2024-01-01', time_windows: ['Morning'] },
    ]
    render(<Recommendation availability={availability} />)
    expect(screen.getByText(/Best day to meet/i)).toBeInTheDocument()
  })
})
