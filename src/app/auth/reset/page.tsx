'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  async function handleReset(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`,
    })
    if (error) { setError(error.message) } else { setSent(true) }
    setLoading(false)
  }

  if (sent) {
    return (
      <main className="flex items-center justify-center min-h-screen px-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✉️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--forest)' }}>Check your inbox</h2>
          <p className="text-sm" style={{ color: 'var(--stone-light)' }}>
            We sent a password reset link to <strong>{email}</strong>.
          </p>
          <Link href="/login" className="btn-secondary w-full mt-4 block">Back to login</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-6">
      <div className="max-w-sm w-full">
        <Link href="/" className="block text-center mb-6 text-2xl font-bold" style={{ color: 'var(--forest)' }}>
          📅 See You Next Tuesday?
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--forest)' }}>Forgot password</h1>
          <p className="text-sm mb-6" style={{ color: 'var(--stone-light)' }}>
            Enter your email and we&apos;ll send you a reset link.
          </p>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleReset} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="input"
                placeholder="you@example.com"
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm">
            <Link href="/login" style={{ color: 'var(--fern)', fontWeight: 600 }}>Back to login</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
