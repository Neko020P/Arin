'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function NewCommissionPage() {
    const router = useRouter()
    const supabase = createClient()

    const [artistId, setArtistId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    const [form, setForm] = useState({
        title: '',
        description: '',
        price: '',
        currency: 'USD',
        deadline: '',
        //status:      'open',
    })

    useEffect(() => {
        async function load() {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return router.push('/login')

            const { data: profile } = await supabase
                .from('profiles')
                .select('id')
                .eq('user_id', user.id)
                .single()

            if (profile) setArtistId(profile.id)
        }
        load()
    }, [])

    function set(field: string, value: string) {
        setForm(prev => ({ ...prev, [field]: value }))
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!artistId) return
        setSaving(true)
        setError('')

        const { error } = await supabase
            .from('commissions')
            .insert({
                artist_id: artistId,
                title: form.title.trim(),
                description: form.description.trim() || null,
                price: form.price ? parseFloat(form.price) : null,
                currency: form.currency,
                deadline: form.deadline || null,
                status: 'open',// status:      form.status,
            })

        if (error) {
            setError(error.message)
            setSaving(false)
        } else {
            router.push('/dashboard/commissions')
        }
    }

    return (
        <main className="min-h-screen py-10 px-4">
            <div className="max-w-lg mx-auto">

                <div className="mb-8">
                    <h1 className="text-2xl font-medium">เพิ่ม Commission ใหม่</h1>
                    <p className="text-sm text-gray-400 mt-1">กรอกรายละเอียดงานที่รับ</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">

                    {/* Title */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">ชื่องาน <span className="text-red-400">*</span></label>
                        <input
                            type="text"
                            required
                            value={form.title}
                            onChange={e => set('title', e.target.value)}
                            placeholder="เช่น Full body character illustration"
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                        />
                    </div>

                    {/* Description */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">รายละเอียด</label>
                        <textarea
                            value={form.description}
                            onChange={e => set('description', e.target.value)}
                            placeholder="รายละเอียดงาน ความต้องการของลูกค้า..."
                            rows={4}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 resize-none"
                        />
                    </div>

                    {/* Price + Currency */}
                    <div className="flex gap-3">
                        <div className="flex flex-col gap-1 flex-1">
                            <label className="text-sm font-medium">ราคา</label>
                            <input
                                type="number"
                                min="0"
                                step="0.01"
                                value={form.price}
                                onChange={e => set('price', e.target.value)}
                                placeholder="0.00"
                                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400"
                            />
                        </div>
                        <div className="flex flex-col gap-1 w-28">
                            <label className="text-sm font-medium">สกุลเงิน</label>
                            <select
                                value={form.currency}
                                onChange={e => set('currency', e.target.value)}
                                className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
                            >
                                <option value="USD">USD</option>
                                <option value="THB">THB</option>
                                <option value="EUR">EUR</option>
                                <option value="JPY">JPY</option>
                            </select>
                        </div>
                    </div>

                    {/* Deadline */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm font-medium">Deadline</label>
                        <input
                            type="date"
                            value={form.deadline}
                            onChange={e => set('deadline', e.target.value)}
                            min={new Date().toISOString().split('T')[0]}
                            className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 w-full"
                        />
                        {form.deadline && (
                            <p className="text-xs text-gray-400">
                                {new Date(form.deadline).toLocaleDateString('th-TH', {
                                    day: 'numeric', month: 'long', year: 'numeric'
                                })}
                            </p>
                        )}
                    </div>

                    {/* Status */}
                    {/* <div className="flex flex-col gap-1">
            <label className="text-sm font-medium">สถานะเริ่มต้น</label>
            <select
              value={form.status}
              onChange={e => set('status', e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-400 bg-white"
            >
              <option value="open">เปิดรับ</option>
              <option value="in_progress">กำลังทำ</option>
            </select>
          </div> */}

                    {error && <p className="text-sm text-red-500">{error}</p>}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex-1 bg-purple-600 text-white rounded-lg py-2.5 text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
                        >
                            {saving ? 'กำลังบันทึก...' : 'บันทึก Commission'}
                        </button>
                        <button
                            type="button"
                            onClick={() => router.back()}
                            className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50"
                        >
                            ยกเลิก
                        </button>
                    </div>

                </form>
            </div>
        </main>
    )
}