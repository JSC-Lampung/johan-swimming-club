
'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Users, UserCheck, FileText, BarChart3, TrendingUp, Calendar } from 'lucide-react'

export default function DashboardStats() {
    const [stats, setStats] = useState({
        members: 0,
        coaches: 0,
        contents: 0,
        assessments: 0,
        loading: true
    })

    useEffect(() => {
        async function fetchStats() {
            try {
                // 1. Total Members
                const { count: memberCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'member')

                // 2. Total Coaches
                const { count: coachCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'coach')

                // 3. Total Postings (excluding site_config)
                const { count: contentCount } = await supabase
                    .from('landing_contents')
                    .select('*', { count: 'exact', head: true })
                    .neq('category', 'site_config')

                // 4. This Month's Coach Reports
                const now = new Date()
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0]
                const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0]

                const { count: reportCount } = await supabase
                    .from('coach_reports')
                    .select('*', { count: 'exact', head: true })
                    .gte('created_at', `${startOfMonth}T00:00:00`)
                    .lte('created_at', `${endOfMonth}T23:59:59`)

                setStats({
                    members: memberCount || 0,
                    coaches: coachCount || 0,
                    contents: contentCount || 0,
                    assessments: reportCount || 0,
                    loading: false
                })
            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
                setStats(s => ({ ...s, loading: false }))
            }
        }
        fetchStats()
    }, [])

    const statCards = [
        {
            title: 'Total Anggota',
            value: stats.members,
            subtitle: 'Aktif Terdaftar',
            icon: UserCheck,
            color: 'from-blue-600 to-blue-500'
        },
        {
            title: 'Pelatih Aktif',
            value: stats.coaches,
            subtitle: 'Tim Profesional',
            icon: Users,
            color: 'from-emerald-600 to-emerald-500'
        },
        {
            title: 'Pusat Info',
            value: stats.contents,
            subtitle: 'Postingan Aktif',
            icon: FileText,
            color: 'from-purple-600 to-purple-500'
        },
        {
            title: 'Laporan Masuk',
            value: stats.assessments,
            subtitle: 'Bulan Ini',
            icon: BarChart3,
            color: 'from-amber-600 to-amber-500'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fadeIn">
            {statCards.map((card, i) => (
                <div key={i} className={`bg-gradient-to-br ${card.color} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group transition-all duration-300 hover:scale-[1.02] hover:shadow-xl`}>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-md">
                            <card.icon size={24} className="text-white" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] bg-white/20 px-2 py-1 rounded-full backdrop-blur-md font-bold uppercase tracking-wider">
                            <TrendingUp size={12} />
                            Live
                        </div>
                    </div>
                    <div className="relative z-10">
                        <p className="text-4xl font-black tracking-tight">{stats.loading ? '...' : card.value}</p>
                        <h3 className="font-bold text-white/80 text-sm mt-1 uppercase tracking-widest">{card.title}</h3>
                        <p className="text-[10px] text-white/60 font-medium mt-1 uppercase tracking-[0.2em]">{card.subtitle}</p>
                    </div>
                    {/* Background Decorative Element */}
                    <div className="absolute -bottom-6 -right-6 opacity-10 group-hover:scale-110 transition-transform duration-500">
                        <card.icon size={120} />
                    </div>
                </div>
            ))}
        </div>
    )
}
