'use client'
import { useState } from 'react'
import { calcCurrentStats } from '@/lib/stats'
import type { Stats } from '@/lib/stats'
import RoomCanvas from './RoomCanvas'
import RoomEditor from './RoomEditor'
import StatsBar from './StatsBar'
import ActionPanel from './ActionPanel'

type Props = {
  characterId: string
  spriteUrl: string | null
  bgUrl: string | null
  initialStats: Stats & { last_updated: string }
  isOwner: boolean
  currentBgUrl: string | null
  currentSpriteUrl: string | null
}

export default function RoomClient({
  characterId,
  spriteUrl,
  bgUrl,
  initialStats,
  isOwner,
  currentBgUrl,
  currentSpriteUrl,
}: Props) {
  // คำนวณ decay ตั้งแต่แรก load
  const [liveStats, setLiveStats] = useState<Stats>(() =>
    calcCurrentStats(initialStats, initialStats.last_updated)
  )

  if (!spriteUrl) {
    return (
      <div className="flex-1 flex items-center justify-center text-white/40">
        ยังไม่มีรูป character — ใส่ ref sheet ก่อนนะครับ
      </div>
    )
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* Canvas */}
      <div className="flex-1 flex items-center justify-center p-4">
        <RoomCanvas
          spriteUrl={spriteUrl}
          bgUrl={bgUrl}
          stats={liveStats}
        />
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 flex justify-center">
        <StatsBar stats={liveStats} />
      </div>

      {/* Actions + Editor — เฉพาะเจ้าของ */}
      {isOwner && (
        <div className="border-t border-white/10 p-4 flex flex-col items-center gap-4">
          <ActionPanel
            characterId={characterId}
            dbStats={initialStats}
            onUpdate={setLiveStats}
          />
          <RoomEditor
            characterId={characterId}
            currentBgUrl={currentBgUrl}
            currentSpriteUrl={currentSpriteUrl}
          />
        </div>
      )}
    </div>
  )
}