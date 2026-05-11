'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const NEXT_STATUS: Record<string, { value: string; label: string; color: string }[]> = {
  open:        [{ value: 'in_progress', label: 'Start Working', color: 'bg-blue-600' }],
  in_progress: [{ value: 'completed',   label: 'Mark as Completed', color: 'bg-green-600' }],
  completed:   [],
  cancelled:   [],
}

const CANCEL_ALLOWED = ['open', 'in_progress']

export default function CommissionActions({
  commissionId,
  currentStatus,
}: {
  commissionId: string
  currentStatus: string
}) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function updateStatus(newStatus: string) {
    setLoading(true)
    setError('')

    const { error } = await supabase
      .from('commissions')
      .update({ status: newStatus })
      .eq('id', commissionId)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.refresh()
      setLoading(false)
    }
  }

  const nextActions = NEXT_STATUS[currentStatus] ?? []
  const canCancel = CANCEL_ALLOWED.includes(currentStatus)

  if (nextActions.length === 0 && !canCancel) return null

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h2 className="text-sm font-medium mb-4">อัปเดตสถานะ</h2>

      <div className="flex flex-col gap-3">
        {nextActions.map(action => (
          <button
            key={action.value}
            onClick={() => updateStatus(action.value)}
            disabled={loading}
            className={`${action.color} text-white rounded-lg py-2.5 text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-opacity`}
          >
            {loading ? 'กำลังอัปเดต...' : action.label}
          </button>
        ))}

        {canCancel && (
          <button
            onClick={() => updateStatus('cancelled')}
            disabled={loading}
            className="border border-red-200 text-red-400 rounded-lg py-2.5 text-sm hover:bg-red-50 disabled:opacity-50 transition-colors"
          >
            Cancel Commission
          </button>
        )}
      </div>

      {error && <p className="text-sm text-red-500 mt-3">{error}</p>}
    </div>
  )
}