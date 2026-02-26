'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabaseClient'

export default function MemberGuard({ children }) {
    const [authorized, setAuthorized] = useState(false)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data: { session }, error: sessionError } = await supabase.auth.getSession()

                if (sessionError || !session) {
                    throw new Error('No session')
                }

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('role')
                    .eq('id', session.user.id)
                    .single()

                if (profileError || profile?.role !== 'member') {
                    throw new Error('Not authorized')
                }

                setAuthorized(true)

            } catch (error) {
                console.log('Redirecting due to auth error:', error.message)
                router.push('/')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-900">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-[0.2em]">Memverifikasi Akses...</p>
                </div>
            </div>
        )
    }

    return authorized ? children : null
}
