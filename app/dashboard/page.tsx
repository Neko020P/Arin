import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) redirect('/login')

    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()

    return (
        <main className="p-8">
            <h1 className="text-2xl font-medium mb-4">Dashboard</h1>
            <p className="text-gray-600 mb-2">Welcome, {user.email}!</p>
            <div className="bg-gray-50 rounded-lg p-4 text-sm font-mono">
                <p>email: {user.email}</p>
                <p>username: {profile?.username}</p>
                <p>user_id: {user.id}</p>
            </div>

            <form action="/auth/signout" method="POST">
                <button
                    type="submit"
                    className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600"
                >
                    Logout
                </button>
            </form>
        </main>
    )
}