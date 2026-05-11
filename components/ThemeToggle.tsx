'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // ต้อง mounted ก่อนถึง render ได้ เพื่อหลีกเลี่ยง hydration mismatch
  useEffect(() => setMounted(true), [])
  if (!mounted) return <div className="w-8 h-8" />

  const isDark = theme === 'dark'

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="toggle theme"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}