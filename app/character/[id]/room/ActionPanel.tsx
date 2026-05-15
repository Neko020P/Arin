'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { applyAction, calcCurrentStats } from '@/lib/stats'
import type { Stats } from '@/lib/stats'

const ACTIONS = [
  { id: 'feed',  label: 'ให้อาหาร', icon: '🍖', cooldown: 30  }, // วินาที
  { id: 'play',  label: 'เล่นด้วย', icon: '🎾', cooldown: 60  },
  { id: 'bath',  label: 'อาบน้ำ',   icon: '🛁', cooldown: 120 },
  { id: 'sleep', label: 'ให้นอน',   icon: '💤', cooldown: 180 },
]

type Props = {
  characterId: string
  dbStats: Stats & { last_updated: string }
  onUpdate: (next: Stats) => void
}

export default function ActionPanel({ characterId, dbStats, onUpdate }: Props) {
  const supabase = createClient()
  // cooldown per action: actionId → timestamp ที่ใช้ครั้งล่าสุด
  const [lastUsed, setLastUsed] = useState<Record<string, number>>({})
  const [loading, setLoading]   = useState<string | null>(null)

  async function handleAction(actionId: string) {
    setLoading(actionId)

    const current = calcCurrentStats(dbStats, dbStats.last_updated)
    const next    = applyAction(current, actionId)

    const { error } = await supabase
      .from('character_stats')
      .update({ ...next, last_updated: new Date().toISOString() })
      .eq('character_id', characterId)

    if (!error) {
      onUpdate(next)
      setLastUsed(prev => ({ ...prev, [actionId]: Date.now() }))
    }

    setLoading(null)
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {ACTIONS.map(({ id, label, icon, cooldown }) => {
        const elapsed    = (Date.now() - (lastUsed[id] ?? 0)) / 1000
        const onCooldown = elapsed < cooldown
        const remaining  = Math.ceil(cooldown - elapsed)

        return (
          <button
            key={id}
            disabled={onCooldown || loading === id}
            onClick={() => handleAction(id)}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-xl
                       border border-white/20 text-white/70 text-sm
                       hover:bg-white/10 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span className="text-xl">{icon}</span>
            <span className="text-xs">{label}</span>
            {onCooldown && (
              <span className="text-[10px] text-white/30">{remaining}s</span>
            )}
          </button>
        )
      })}
    </div>
  )
}