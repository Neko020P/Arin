import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import CommissionActions from './CommissionActions'
import InvoiceButton from './InvoiceButton'

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

  // ดึง profile ของ artist เพื่อใช้ใน invoice
  const { data: artistProfile } = await supabase
    .from('profiles')
    .select('username, display_name')
    .eq('id', profile.id)
    .single()

  const { data: commission } = await supabase
    .from('commissions')
    .select('*')
    .eq('id', id)
    .eq('artist_id', profile.id) // เห็นได้แค่ commission ของตัวเอง
    .single()

  if (!commission) notFound()

  // ดึง characters ที่เชื่อมกับ commission นี้
  const { data: linkedCharacters } = commission.character_ids?.length
    ? await supabase
      .from('characters')
      .select('id, name, ref_sheet_url')
      .in('id', commission.character_ids)
    : { data: [] }

  const STATUS_LABEL: Record<string, string> = {
    open: 'เปิดรับ',
    in_progress: 'กำลังทำ',
    completed: 'เสร็จแล้ว',
    cancelled: 'ยกเลิก',
  }

  const STATUS_COLOR: Record<string, string> = {
    open: 'bg-green-50 text-green-600',
    in_progress: 'bg-blue-50 text-blue-600',
    completed: 'bg-gray-100 text-gray-500',
    cancelled: 'bg-red-50 text-red-400',
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
        
        {/* Characters */}
        {linkedCharacters && linkedCharacters.length > 0 && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-medium mb-4">
              Characters ที่เกี่ยวข้อง
            </h2>
            <div className="flex flex-col gap-2">
              {linkedCharacters.map((c: any) => (
                <Link
                  key={c.id}
                  href={`/character/${c.id}`}
                  className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-purple-200 hover:bg-purple-50 transition-colors"
                >
                  {c.ref_sheet_url ? (
                    <img
                      src={c.ref_sheet_url}
                      alt={c.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-lg shrink-0">
                      🎨
                    </div>
                  )}
                  <p className="text-sm font-medium">{c.name}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Actions — client component */}
        <CommissionActions
          commissionId={commission.id}
          currentStatus={commission.status}
        />

        {/* Invoice */}
        {commission.status === 'completed' && artistProfile && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-sm font-medium mb-4">Invoice</h2>
            <InvoiceButton
              commission={commission}
              artist={artistProfile}
            />
          </div>
        )}

      </div>
    </main>
  )
}