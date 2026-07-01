'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface NavProps {
  userEmail?: string | null
  role?: string | null
}

export default function Nav({ userEmail, role }: NavProps) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <nav className="w-full px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #e5e2dc', background: 'white' }}>
      <Link href={userEmail ? '/dashboard' : '/'} className="font-bold text-lg" style={{ color: 'var(--forest)' }}>
        📅 SYNT?
      </Link>
      <div className="flex items-center gap-3">
        {role === 'admin' && (
          <Link href="/admin" className="text-sm font-medium" style={{ color: 'var(--sand)' }}>
            Admin
          </Link>
        )}
        {userEmail ? (
          <button onClick={handleLogout} className="text-sm" style={{ color: 'var(--stone-light)' }}>
            Log out
          </button>
        ) : (
          <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--fern)' }}>
            Log in
          </Link>
        )}
      </div>
    </nav>
  )
}
