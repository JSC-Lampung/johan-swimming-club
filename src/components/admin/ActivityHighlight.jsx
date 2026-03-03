'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    UserPlus,
    CalendarCheck,
    FileText,
    Activity,
    ArrowRight,
    SearchX,
    Clock
} from 'lucide-react'
import Link from 'next/link'

export default function ActivityHighlight() {
    const [activities, setActivities] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchActivities = async () => {
            setLoading(true)
            try {
                // Fetch basic data from 4 tables (limited for efficiency)
                // 1. New Members
                const { data: members } = await supabase
                    .from('profiles')
                    .select('id, full_name, created_at, role')
                    .eq('role', 'member')
                    .order('created_at', { ascending: false })
                    .limit(3)

                // 2. Coach Reports
                const { data: reports } = await supabase
                    .from('coach_reports')
                    .select('id, profiles(full_name), title, created_at')
                    .order('created_at', { ascending: false })
                    .limit(3)

                // 3. Coach Attendance
                const { data: coachAttend } = await supabase
                    .from('coach_attendance')
                    .select('id, profiles(full_name), created_at')
                    .order('created_at', { ascending: false })
                    .limit(2)

                // 4. Member Attendance (Daily Session Check-ins)
                const { data: memberAttend } = await supabase
                    .from('member_attendance')
                    .select('id, profiles(full_name), created_at')
                    .order('created_at', { ascending: false })
                    .limit(2)

                // Combine and format
                const combined = [
                    ...(members || []).map(m => ({
                        id: `member-${m.id}`,
                        type: 'MEMBER_JOIN',
                        title: 'Anggota Baru Bergabung',
                        user: m.full_name,
                        time: m.created_at,
                        icon: UserPlus,
                        color: 'text-emerald-400',
                        bg: 'bg-emerald-500/10'
                    })),
                    ...(reports || []).map(r => ({
                        id: `report-${r.id}`,
                        type: 'COACH_REPORT',
                        title: 'Laporan Masuk',
                        user: r.profiles?.full_name || 'Pelatih',
                        time: r.created_at,
                        icon: FileText,
                        color: 'text-blue-400',
                        bg: 'bg-blue-500/10'
                    })),
                    ...(coachAttend || []).map(a => ({
                        id: `c-attend-${a.id}`,
                        type: 'COACH_ATTEND',
                        title: 'Check-in Pelatih',
                        user: a.profiles?.full_name || 'Pelatih',
                        time: a.created_at,
                        icon: CalendarCheck,
                        color: 'text-amber-400',
                        bg: 'bg-amber-500/10'
                    })),
                    ...(memberAttend || []).map(a => ({
                        id: `m-attend-${a.id}`,
                        type: 'MEMBER_ATTEND',
                        title: 'Latihan Dimulai',
                        user: a.profiles?.full_name || 'Atlet',
                        time: a.created_at,
                        icon: Activity,
                        color: 'text-cyan-400',
                        bg: 'bg-cyan-500/10'
                    }))
                ]

                // Sort by time descending
                combined.sort((a, b) => new Date(b.time) - new Date(a.time))
                setActivities(combined.slice(0, 8)) // Show top 8 total

            } catch (err) {
                console.error('Error fetching activity highlight:', err)
            } finally {
                setLoading(false)
            }
        }

        fetchActivities()

        // Cleanup subscriptions if any (not needed for simple dashboard)
    }, [])

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInMinutes = Math.floor((now - date) / (1000 * 60))

        if (diffInMinutes < 1) return 'Baru saja'
        if (diffInMinutes < 60) return `${diffInMinutes}m yang lalu`
        if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}j yang lalu`

        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
    }

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                        <span>Highlight Aktivitas</span>
                    </div>
                </h3>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                    Real-time
                </div>
            </div>

            <div className="flex-1 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center p-20">
                        <div className="w-8 h-8 border-2 border-slate-700 border-t-blue-500 rounded-full animate-spin"></div>
                    </div>
                ) : activities.length > 0 ? (
                    <div className="space-y-4">
                        {activities.map((item) => (
                            <div key={item.id} className="flex items-center gap-4 group cursor-default p-2 rounded-xl hover:bg-slate-700/30 transition-all">
                                <div className={`w-10 h-10 rounded-2xl ${item.bg} ${item.color} flex items-center justify-center shrink-0 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform`}>
                                    <item.icon size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start gap-2">
                                        <p className="text-white font-bold text-xs uppercase tracking-tight truncate">{item.title}</p>
                                        <span className="text-[10px] text-slate-500 font-bold whitespace-nowrap flex items-center gap-1">
                                            <Clock size={10} />
                                            {formatTime(item.time)}
                                        </span>
                                    </div>
                                    <p className="text-slate-400 text-[10px] mt-0.5 truncate font-medium">
                                        Oleh: <span className="text-blue-400 font-bold tracking-wide italic">{item.user}</span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center p-20 text-center bg-slate-900/40 rounded-3xl border border-dashed border-slate-700">
                        <SearchX size={40} className="text-slate-700 mb-4 opacity-30" />
                        <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Belum ada aktivitas hari ini</p>
                    </div>
                )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-700/50 flex justify-center">
                <Link href="/admin/reports" className="text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] hover:text-white transition-colors flex items-center gap-2 group">
                    Lihat Monitoring Detail <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
