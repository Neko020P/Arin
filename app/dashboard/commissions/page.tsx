import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

const STATUS_LABEL: Record<string, string> = {
  open:        'Pending',
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
}

const STATUS_COLOR: Record<string, string> = {
  open:        'bg-green-50 text-green-600',
  in_progress: 'bg-blue-50 text-blue-600',
  completed:   'bg-gray-100 text-gray-500',
  cancelled:   'bg-red-50 text-red-400',
}

export default async function CommissionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (!profile) redirect('/profile/edit')

  const { data: commissions } = await supabase
    .from('commissions')
    .select('*')
    .eq('artist_id', profile.id)
    .order('created_at', { ascending: false })

  // สรุป stats
  const stats = {
    open:        commissions?.filter(c => c.status === 'open').length ?? 0,
    in_progress: commissions?.filter(c => c.status === 'in_progress').length ?? 0,
    completed:   commissions?.filter(c => c.status === 'completed').length ?? 0,
    revenue:     commissions
      ?.filter(c => c.status === 'completed')
      .reduce((sum, c) => sum + (c.price ?? 0), 0) ?? 0,
  }

  return (
    <main className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-4xl mx-auto flex flex-col gap-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-medium">Commissions</h1>
            <p className="text-sm text-gray-400 mt-1">จัดการงานและรายได้ของคุณ</p>
          </div>
          <Link
            href="/dashboard/commissions/new"
            className="bg-purple-600 text-white text-sm px-5 py-2 rounded-full hover:bg-purple-700 transition-colors"
          >
            + เพิ่ม Commission
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard label="เปิดรับ"    value={stats.open}        color="bg-green-50 text-green-600" />
          <StatCard label="กำลังทำ"   value={stats.in_progress} color="bg-blue-50 text-blue-600" />
          <StatCard label="เสร็จแล้ว" value={stats.completed}   color="bg-gray-100 text-gray-500" />
          <StatCard label="รายได้รวม" value={`$${stats.revenue.toFixed(2)}`} color="bg-purple-50 text-purple-600" />
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {commissions && commissions.length > 0 ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left">
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">ชื่องาน</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">สถานะ</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">ราคา</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400">Deadline</th>
                  <th className="px-5 py-3 text-xs font-medium text-gray-400"></th>
                </tr>
              </thead>
              <tbody>
                {commissions.map(c => (
                  <tr key={c.id} className="border-b last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-800">{c.title}</p>
                      {c.description && (
                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{c.description}</p>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`text-xs px-2.5 py-1 rounded-full ${STATUS_COLOR[c.status]}`}>
                        {STATUS_LABEL[c.status]}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-600">
                      {c.price ? `${c.currency ?? 'USD'} ${c.price}` : '—'}
                    </td>
                    <td className="px-5 py-4 text-gray-400 text-xs">
                      {c.deadline
                        ? new Date(c.deadline).toLocaleDateString('th-TH', {
                            day: 'numeric', month: 'short', year: 'numeric'
                          })
                        : '—'
                      }
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/commissions/${c.id}`}
                        className="text-xs text-purple-600 hover:underline"
                      >
                        ดูรายละเอียด →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-20 text-center">
              <p className="text-gray-400 text-sm mb-3">ยังไม่มี commission</p>
              <Link
                href="/dashboard/commissions/new"
                className="text-sm text-purple-600 hover:underline"
              >
                เพิ่ม commission แรก →
              </Link>
            </div>
          )}
        </div>

      </div>
    </main>
  )
}

function StatCard({
  label, value, color
}: {
  label: string
  value: string | number
  color: string
}) {
  return (
    <div className={`rounded-2xl p-4 ${color}`}>
      <p className="text-2xl font-medium">{value}</p>
      <p className="text-xs mt-0.5 opacity-70">{label}</p>
    </div>
  )
}