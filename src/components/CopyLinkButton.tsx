'use client'

import { useState } from 'react'

export default function CopyLinkButton({ url }: { url: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="text-sm font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
      style={{
        background: copied ? '#dcfce7' : 'var(--forest)',
        color: copied ? '#166534' : 'white',
      }}
    >
      {copied ? '✓ Copied!' : 'Copy'}
    </button>
  )
}
