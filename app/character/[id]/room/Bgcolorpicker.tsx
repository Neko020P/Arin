'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const PRESETS = [
  { label: 'Midnight', value: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)' },
  { label: 'Ocean', value: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)' },
  { label: 'Sunset', value: 'linear-gradient(135deg, #f093fb, #f5576c, #fda085)' },
  { label: 'Forest', value: 'linear-gradient(135deg, #134e5e, #71b280)' },
  { label: 'Peach', value: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { label: 'Lavender', value: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { label: 'Sky', value: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
  { label: 'Rose', value: 'linear-gradient(135deg, #f953c6, #b91d73)' },
  { label: 'Mint', value: 'linear-gradient(135deg, #84fab0, #8fd3f4)' },
  { label: 'Ember', value: 'linear-gradient(135deg, #f7971e, #ffd200)' },
  { label: 'Night', value: 'linear-gradient(135deg, #141e30, #243b55)' },
  { label: 'Candy', value: 'linear-gradient(135deg, #fddb92, #d1fdff)' },
]

type Props = {
  characterId: string
  current: string | null
  onChange: (value: string) => void
}

export default function BgColorPicker({ characterId, current, onChange }: Props) {
  const [selected, setSelected] = useState(current ?? PRESETS[0].value)
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  async function handleSelect(value: string) {
    const previous = selected
    setSelected(value)
    setOpen(false)
    setError('')
    const { error: updateErr } = await supabase.from('characters').update({ room_bg_color: value }).eq('id', characterId)
    if (updateErr) {
      setError('บันทึกสีไม่สำเร็จ ลองใหม่อีกครั้ง')
      setSelected(previous)   // roll back optimistic UI since the write failed
    } else {
      onChange(value)
    }
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 text-white/70 hover:bg-white/10 text-sm transition-colors w-full"
      >
        <div className="w-5 h-5 rounded-full shrink-0" style={{ background: selected }} />
        <span>BG Color</span>
        <span className="ml-auto">{open ? '▲' : '▼'}</span>
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 w-56 bg-gray-900 border border-white/10 rounded-2xl p-3 z-50 grid grid-cols-4 gap-2">
          {PRESETS.map(p => (
            <button
              key={p.value}
              onClick={() => handleSelect(p.value)}
              title={p.label}
              className={`w-full aspect-square rounded-xl border-2 transition-all ${selected === p.value ? 'border-white scale-110' : 'border-transparent hover:border-white/40'}`}
              style={{ background: p.value }}
            />
          ))}
        </div>
      )}
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  )
}