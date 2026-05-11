import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CommissionActions from './CommissionActions'

export default async function CommissionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/profile/edit')

  const { data: commission } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', id)
    .eq('artist_id', profile.id) // เห็นได้แค่ commission ของตัวเอง
    .single()

  if (!commission) notFound()

  const STATUS_LABEL: Record<string, string> = {
    open:        'เปิดรับ',
    in_progress: 'กำลังทำ',
    completed:   'เสร็จแล้ว',
    cancelled:   'ยกเลิก',
  }

  const STATUS_COLOR: Record<string, string> = {
    open:        'bg-green-50 text-green-600',
    in_progress: 'bg-blue-50 text-blue-600',
    completed:   'bg-gray-100 text-gray-500',
    cancelled:   'bg-red-50 text-red-400',
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto flex flex-col gap-6">

        {/* Back */}
        <Link
          href="/dashboard/commissions"
          className="text-sm text-gray-400 hover:text-gray-600 w-fit"
        >
          ← กลับ
        </Link>

        {/* Header card */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4 mb-4">
            <h1 className="text-xl font-medium">{commission.title}</h1>
            <span className={`text-xs px-3 py-1 rounded-full shrink-0 ${STATUS_COLOR[commission.status]}`}>
              {STATUS_LABEL[commission.status]}
            </span>
          </div>

          {commission.description && (
            <p className="text-sm text-gray-600 leading-relaxed mb-4 whitespace-pre-line">
              {commission.description}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div>
              <p className="text-xs text-gray-400 mb-1">ราคา</p>
              <p className="text-sm font-medium">
                {commission.price
                  ? `${commission.currency ?? 'USD'} ${commission.price}`
                  : '—'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Deadline</p>
              <p className="text-sm font-medium">
                {commission.deadline
                  ? new Date(commission.deadline).toLocaleDateString('th-TH', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    })
                  : '—'
                }
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">วันที่รับงาน</p>
              <p className="text-sm font-medium">
                {new Date(commission.created_at).toLocaleDateString('th-TH', {
                  day: 'numeric', month: 'long', year: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions — client component */}
        <CommissionActions
          commissionId={commission.id}
          currentStatus={commission.status}
        />

      </div>
    </main>
  )
}