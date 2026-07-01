'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [magicSent, setMagicSent] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  async function handleMagicLink() {
    if (!email) { setError('Enter your email first'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({ email })
    if (error) { setError(error.message) } else { setMagicSent(true) }
    setLoading(false)
  }

  if (magicSent) {
    return (
      <main className="flex flex-col items-center justify-center min-h-screen px-6">
        <div className="card max-w-sm w-full text-center">
          <div className="text-4xl mb-3">✉️</div>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--forest)' }}>Check your inbox</h2>
          <p style={{ color: 'var(--stone-light)' }}>We sent a magic link to <strong>{email}</strong>. Click it to log in.</p>
        </div>
      </main>
    )
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen px-6">
      <div className="max-w-sm w-full">
        <Link href="/" className="block text-center mb-6 text-2xl font-bold" style={{ color: 'var(--forest)' }}>
          📅 See You Next Tuesday?
        </Link>
        <div className="card">
          <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--forest)' }}>Welcome back 👋</h1>
          {error && (
            <div className="mb-4 p-3 rounded-lg text-sm" style={{ background: '#fee2e2', color: '#991b1b' }}>
              {error}
            </div>
          )}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                required
              />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={loading}>
              {loading ? 'Logging in…' : 'Log in'}
            </button>
          </form>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2" style={{ background: 'white', color: 'var(--stone-light)' }}>or</span>
            </div>
          </div>
          <button onClick={handleMagicLink} className="btn-secondary w-full" disabled={loading}>
            ✨ Send magic link
          </button>
          <p className="mt-4 text-center text-sm" style={{ color: 'var(--stone-light)' }}>
            No account?{' '}
            <Link href="/signup" style={{ color: 'var(--fern)', fontWeight: 600 }}>Sign up</Link>
          </p>
        </div>
      </div>
    </main>
  )
}
