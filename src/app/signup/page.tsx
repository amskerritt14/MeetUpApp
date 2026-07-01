'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { first_name: firstName } },
    })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-sm w-full">
        <Link href="/" className="block text-center mb-6 text-2xl font-bold" style={{ color: 'var(--forest)' }}>
          📅 See You Next Tuesday?
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--forest)' }}>Create account 🎉</h1>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleSignup} className="flex flex-col gap-4">
            <div>
              <label htmlFor="first-name" className="block text-sm font-medium mb-1">First name</label>
              <input
                id="first-name"
                type="text"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                className="input"
                placeholder="Alex"
                required
              />
            </div>
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
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1">Password</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
                minLength={8}
                required
              />
              <p className="text-xs mt-1" style={{ color: 'var(--stone-light)' }}>At least 8 characters</p>
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
          <p className="mt-4 text-center text-sm" style={{ color: 'var(--stone-light)' }}>
            Already have an account?{' '}
            <Link href="/login" style={{ color: 'var(--fern)', fontWeight: 600 }}>Log in</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
