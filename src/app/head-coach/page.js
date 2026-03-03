
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Users,
    BarChart3,
    CalendarCheck,
    TrendingUp,
    Star,
    Activity,
    ChevronRight,
    Trophy,
    Target,
    FileText,
    ScrollText,
    Medal
} from 'lucide-react'
import Link from 'next/link'

export default function HeadCoachDashboard() {
    const [stats, setStats] = useState({
        totalMembers: 0,
        totalCoaches: 0,
        assessmentsThisMonth: 0,
        avgScore: 0,
        attendanceToday: 0
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                // Total Members
                const { count: memberCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'member')

                // Total Coaches
                const { count: coachCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'coach')

                // Assessments this month
                const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]
                const { data: assessments } = await supabase
                    .from('member_assessments')
                    .select('score')
                    .gte('date', startOfMonth)

                const totalScore = assessments?.reduce((acc, curr) => acc + curr.score, 0) || 0
                const avg = assessments?.length > 0 ? Math.round(totalScore / assessments.length) : 0

                // Quick Attendance Today (Rough estimation)
                const today = new Date().toLocaleDateString('en-CA')
                const { count: attendanceCount } = await supabase
                    .from('member_attendance')
                    .select('*', { count: 'exact', head: true })
                    .eq('date', today)
                    .eq('status', 'hadir')

                setStats({
                    totalMembers: memberCount || 0,
                    totalCoaches: coachCount || 0,
                    assessmentsThisMonth: assessments?.length || 0,
                    avgScore: avg,
                    attendanceToday: attendanceCount || 0
                })

            } catch (error) {
                console.error('Error fetching dashboard stats:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchDashboardData()
    }, [])

    const statCards = [
        { label: 'Total Atlet', value: stats.totalMembers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10', sub: 'Semua Program' },
        { label: 'Total Pelatih', value: stats.totalCoaches, icon: Star, color: 'text-purple-500', bg: 'bg-purple-500/10', sub: 'Pelatih Program' },
        { label: 'Evaluasi Bulan Ini', value: stats.assessmentsThisMonth, icon: BarChart3, color: 'text-emerald-500', bg: 'bg-emerald-500/10', sub: `${stats.avgScore}% Rata-rata` },
        { label: 'Hadir Hari Ini', value: stats.attendanceToday, icon: CalendarCheck, color: 'text-amber-500', bg: 'bg-amber-500/10', sub: 'Absensi Lapangan' }
    ]

    return (
        <div className="space-y-8 animate-fadeIn pb-10">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">Dashboard Kepala Pelatih</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">Monitor seluruh program latihan dan perkembangan atlet dalam satu panel.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-slate-900 border border-slate-800 p-6 rounded-3xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
                        <div className="flex items-center gap-4 relative z-10">
                            <div className={`p-4 rounded-2xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div>
                                <h3 className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">{stat.label}</h3>
                                <p className="text-3xl font-black text-white">{loading ? '...' : stat.value}</p>
                            </div>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-4 font-bold uppercase tracking-widest relative z-10">{stat.sub}</p>

                        {/* Decorative background icon */}
                        <div className={`absolute -right-4 -bottom-4 ${stat.color} opacity-[0.03] group-hover:scale-110 transition-transform duration-700`}>
                            <stat.icon size={140} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions & Program Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visual Section */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl shadow-blue-500/20">
                    <div className="relative z-10">
                        <Trophy className="mb-6 opacity-30" size={48} />
                        <h2 className="text-4xl font-black leading-tight mb-4 uppercase italic">Quality Above <br />All Else</h2>
                        <p className="text-blue-100/80 text-sm font-medium leading-relaxed max-w-sm">
                            Kepala Pelatih bertanggung jawab penuh atas standar teknik dan disiplin di seluruh program Johan Swimming Club.
                        </p>
                        <div className="mt-10 flex gap-4">
                            <Link href="/head-coach/assessments" className="bg-white text-blue-600 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-xl">
                                Mulai Penilaian
                            </Link>
                        </div>
                    </div>
                    {/* Abstract water shape */}
                    <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 400 400" fill="none">
                            <circle cx="400" cy="0" r="300" fill="white" />
                            <circle cx="450" cy="50" r="250" fill="white" />
                        </svg>
                    </div>
                </div>

                {/* Navigation Links */}
                <div className="space-y-4">
                    <h3 className="text-white font-black uppercase tracking-widest text-xs ml-4 mb-2">Akses Cepat</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: 'Data Anggota', desc: 'Lihat profil seluruh atlet', href: '/head-coach/members', icon: Users, color: 'blue' },
                            { title: 'Sertifikat Level', desc: 'Nominasi & Cetak Sertifikat', href: '/head-coach/certificates', icon: ScrollText, color: 'emerald' },
                            { title: 'Input Penilaian', desc: 'Beri skor bulanan atlet', href: '/head-coach/assessments', icon: Target, color: 'amber' },
                            { title: 'Absensi Lapangan', desc: 'Monitor kehadiran harian', href: '/head-coach/attendance', icon: CalendarCheck, color: 'purple' }
                        ].map((link, i) => (
                            <Link key={i} href={link.href} className="group bg-slate-900 border border-slate-800 hover:border-slate-700 p-6 rounded-3xl flex items-center gap-5 transition-all active:scale-95">
                                <div className={`p-4 rounded-2xl bg-${link.color}-500/10 text-${link.color}-400 group-hover:scale-110 transition-transform`}>
                                    <link.icon size={24} />
                                </div>
                                <div className="flex-1">
                                    <h4 className="text-white font-bold text-sm tracking-tight">{link.title}</h4>
                                    <p className="text-slate-500 text-[10px] font-medium mt-0.5">{link.desc}</p>
                                </div>
                                <ChevronRight className="text-slate-700 group-hover:text-white transition-colors" size={18} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
