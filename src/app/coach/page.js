
'use client'
import { useState, useEffect } from 'react'
import {
    Users,
    CalendarCheck,
    TrendingUp,
    ClipboardCheck,
    Clock,
    CheckCircle2
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'

export default function CoachDashboard() {
    const [stats, setStats] = useState({
        totalMembers: 0,
        attendanceToday: 0,
        pendingReports: 0
    })
    const [coachProfile, setCoachProfile] = useState(null)
    const [isCheckedIn, setIsCheckedIn] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setCoachProfile(profile)

                // 1. Fetch total members for this coach's program
                const { count: memberCount } = await supabase
                    .from('profiles')
                    .select('*', { count: 'exact', head: true })
                    .eq('role', 'member')
                    .eq('program_pilihan', profile.program_pilihan)

                // 2. Fetch today's attendance count for this program
                const now = new Date()
                const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
                const { count: attendanceCount } = await supabase
                    .from('member_attendance')
                    .select('*', { count: 'exact', head: true })
                    .eq('coach_id', user.id)
                    .eq('date', today)

                // 3. Check if coach already checked-in today
                const { data: coachAttend } = await supabase
                    .from('coach_attendance')
                    .select('*')
                    .eq('coach_id', user.id)
                    .eq('date', today)
                    .single()

                setIsCheckedIn(!!coachAttend)
                setStats({
                    totalMembers: memberCount || 0,
                    attendanceToday: attendanceCount || 0,
                    pendingReports: 0 // Logic for reports can be added later
                })

            } catch (error) {
                console.error('Dashboard Stats Error:', error.message || error)
            } finally {
                setLoading(false)
            }
        }
        fetchStats()
    }, [])

    const handleCoachCheckIn = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const now = new Date()
            const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`

            const { error } = await supabase
                .from('coach_attendance')
                .insert([{
                    coach_id: user.id,
                    date: today,
                    check_in: new Date().toISOString(),
                    status: 'present'
                }])

            if (error) throw error
            setIsCheckedIn(true)
            alert('Berhasil Check-in! Selamat melatih hari ini.')
        } catch (error) {
            alert('Gagal Check-in: ' + error.message)
        }
    }

    if (loading) return <div className="p-8 text-slate-400">Loading Dashboard...</div>

    return (
        <div className="space-y-8 animate-fadeIn">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">Halo, Coach {coachProfile?.full_name?.split(' ')[0]}!</h1>
                <p className="text-slate-400">Selamat datang di Portal Pelatih Johan Swimming Club.</p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
                            <Users size={24} />
                        </div>
                        <h3 className="text-slate-400 font-medium">Total Atlet</h3>
                    </div>
                    <p className="text-4xl font-bold text-white leading-none">{stats.totalMembers}</p>
                    <p className="mt-2 text-xs text-slate-500">Di program {coachProfile?.program_pilihan?.toUpperCase() || '-'}</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-emerald-600/10 rounded-xl text-emerald-500">
                            <CalendarCheck size={24} />
                        </div>
                        <h3 className="text-slate-400 font-medium">Absen Hari Ini</h3>
                    </div>
                    <p className="text-4xl font-bold text-white leading-none">{stats.attendanceToday}</p>
                    <p className="mt-2 text-xs text-slate-500">Atlet sudah di-absen</p>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-amber-600/10 rounded-xl text-amber-500">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-slate-400 font-medium">Progres Rata-rata</h3>
                    </div>
                    <p className="text-4xl font-bold text-white leading-none">85%</p>
                    <p className="mt-2 text-xs text-slate-500">Peningkatan teknis bulan ini</p>
                </div>
            </div>

            {/* Action Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Attendance Card */}
                <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-8 text-white shadow-xl shadow-blue-900/20 relative overflow-hidden group">
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-white/20 rounded-lg">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-bold">Kehadiran Pelatih</h2>
                        </div>

                        <p className="mb-8 text-blue-100 text-sm max-w-sm">
                            Klik tombol di bawah untuk mencatat kehadiran Anda hari ini. Data akan otomatis terkirim ke laporan Admin.
                        </p>

                        {!isCheckedIn ? (
                            <button
                                onClick={handleCoachCheckIn}
                                className="px-8 py-4 bg-white text-blue-700 font-bold rounded-xl hover:bg-blue-50 transition-all active:scale-95 shadow-lg flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Check-in Sekarang
                            </button>
                        ) : (
                            <div className="flex items-center gap-3 bg-emerald-500/20 border border-emerald-500/30 text-emerald-100 px-6 py-4 rounded-xl backdrop-blur-sm self-start inline-flex">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                                <span className="font-bold uppercase tracking-wider text-sm">Sudah Check-in</span>
                            </div>
                        )}
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                        <ClipboardCheck className="w-48 h-48" />
                    </div>
                </div>

                {/* Quick Shortcuts */}
                <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-8">
                    <h2 className="text-xl font-bold text-white mb-6">Akses Cepat</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <Link href="/coach/attendance" className="p-4 bg-slate-700/40 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50 group">
                            <h4 className="text-white font-medium mb-1 group-hover:text-blue-400">Absensi Atlet</h4>
                            <p className="text-[10px] text-slate-500">Mulai input kehadiran hari ini</p>
                        </Link>
                        <Link href="/coach/assessments" className="p-4 bg-slate-700/40 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50 group">
                            <h4 className="text-white font-medium mb-1 group-hover:text-blue-400">Input Nilai</h4>
                            <p className="text-[10px] text-slate-500">Catat perkembangan teknik</p>
                        </Link>
                        <Link href="/coach/members" className="p-4 bg-slate-700/40 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50 group">
                            <h4 className="text-white font-medium mb-1 group-hover:text-blue-400">Data Atlet</h4>
                            <p className="text-[10px] text-slate-500">Lihat profil anggota binaan</p>
                        </Link>
                        <Link href="/coach/reports" className="p-4 bg-slate-700/40 rounded-xl hover:bg-slate-700 transition-colors border border-slate-600/50 group">
                            <h4 className="text-white font-medium mb-1 group-hover:text-blue-400">Laporan</h4>
                            <p className="text-[10px] text-slate-500">Kirim laporan harian/mingguan</p>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    )
}

import Link from 'next/link'
