'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    BarChart3,
    TrendingUp,
    ChevronLeft,
    ChevronRight,
    Calendar,
    Activity,
    Target,
    Zap,
    Brain,
    Info,
    SearchX
} from 'lucide-react'

export default function MemberProgressPage() {
    const [assessments, setAssessments] = useState([])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [loading, setLoading] = useState(true)

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

    useEffect(() => {
        const fetchProgress = async () => {
            setLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
                const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

                // 1. Fetch Monthly Assessments (Only the latest one for the selected month)
                const { data: monthlyData } = await supabase
                    .from('member_assessments')
                    .select('*')
                    .eq('member_id', user.id)
                    .gte('date', startOfMonth)
                    .lte('date', endOfMonth)
                    .order('date', { ascending: false })
                    .limit(1)

                // 2. Fetch Daily Attendance Scores
                const { data: dailyData } = await supabase
                    .from('member_attendance')
                    .select('*')
                    .eq('member_id', user.id)
                    .eq('status', 'hadir')
                    .not('daily_score', 'is', null)
                    .gt('daily_score', 0)
                    .gte('date', startOfMonth)
                    .lte('date', endOfMonth)

                // Combine and format
                const combined = [
                    ...(monthlyData || []).map(item => ({
                        ...item,
                        type: 'MONTHLY',
                        displayTitle: 'Evaluasi Bulanan'
                    })),
                    ...(dailyData || []).map(item => ({
                        ...item,
                        type: 'DAILY',
                        displayTitle: 'Latihan Harian',
                        score: item.daily_score,
                        evaluation: item.daily_metrics,
                        notes: item.notes // If attendance has notes
                    }))
                ]

                // Sort by date descending
                combined.sort((a, b) => new Date(b.date) - new Date(a.date))

                setAssessments(combined)
            } catch (error) {
                console.error('Error fetching technical progress:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchProgress()
    }, [selectedMonth, selectedYear])

    const getScoreColor = (score) => {
        if (score >= 90) return 'text-emerald-400 bg-emerald-400/10'
        if (score >= 80) return 'text-blue-400 bg-blue-400/10'
        if (score >= 70) return 'text-amber-400 bg-amber-400/10'
        return 'text-red-400 bg-red-400/10'
    }

    const MetricBar = ({ label, value, icon: Icon, color }) => (
        <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                <span className="flex items-center gap-1.5">
                    <Icon size={12} className={color} />
                    {label}
                </span>
                <span className="text-white bg-slate-700/50 px-2 py-0.5 rounded-full">{value}/5</span>
            </div>
            <div className="h-1.5 w-full bg-slate-900/50 rounded-full overflow-hidden">
                <div
                    className={`h-full bg-gradient-to-r rounded-full transition-all duration-1000 ${color.replace('text', 'from')} to-slate-400`}
                    style={{ width: `${(value / 5) * 100}%` }}
                />
            </div>
        </div>
    )

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">RIWAYAT PERKEMBANGAN</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Pantau peningkatan teknik dan disiplin latihanmu setiap sesi.</p>
                </div>

                <div className="flex items-center gap-2 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 shadow-xl backdrop-blur-md">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold uppercase tracking-widest px-4 py-2 outline-none cursor-pointer hover:bg-slate-700/50 rounded-xl transition-colors"
                    >
                        {months.map((m, i) => <option key={m} value={i} className="bg-slate-800">{m}</option>)}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold uppercase tracking-widest px-4 py-2 outline-none cursor-pointer hover:bg-slate-700/50 rounded-xl transition-colors"
                    >
                        {years.map(y => <option key={y} value={y} className="bg-slate-800">{y}</option>)}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50 border-dashed">
                    <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                </div>
            ) : assessments.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {assessments.map((item, idx) => (
                        <div key={idx} className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 overflow-hidden shadow-2xl group hover:border-slate-500 transition-all duration-300 relative">
                            {/* Type Badge */}
                            <div className={`absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-[9px] font-black uppercase tracking-widest ${item.type === 'MONTHLY' ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'bg-blue-600/20 text-blue-400 border-l border-b border-blue-600/20'}`}>
                                {item.displayTitle}
                            </div>

                            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                                {/* Left: Score Circle */}
                                <div className="flex flex-col items-center justify-center shrink-0 border-b md:border-b-0 md:border-r border-slate-700/50 pb-6 md:pb-0 md:pr-8">
                                    <div className={`w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-slate-700 bg-slate-900 shadow-inner group-hover:scale-105 transition-transform duration-500`}>
                                        <p className="text-3xl font-black text-white tracking-tighter italic">{Math.round(item.score)}</p>
                                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total Skor</p>
                                    </div>
                                    <div className="mt-4 flex items-center gap-2">
                                        <Calendar size={14} className="text-slate-500" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {new Date(item.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </p>
                                    </div>
                                </div>

                                {/* Center: Metrics */}
                                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6 py-2">
                                    <MetricBar label="Teknik Renang" value={item.evaluation?.technique || 0} icon={Target} color="text-blue-400" />
                                    <MetricBar label="Disiplin & Sikap" value={item.evaluation?.discipline || 0} icon={Zap} color="text-emerald-400" />
                                    <MetricBar label="Kemampuan Fisik" value={item.evaluation?.physical || 0} icon={Activity} color="text-purple-400" />
                                    <MetricBar label="Mental Bertanding" value={item.evaluation?.mental || 0} icon={Brain} color="text-amber-400" />
                                </div>
                            </div>

                            {/* Footer: Coach Notes */}
                            {item.notes && (
                                <div className="px-8 py-6 bg-slate-900/50 border-t border-slate-700/50 flex items-start gap-4">
                                    <div className="p-2 rounded-xl bg-blue-600/10 text-blue-400">
                                        <Info size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 italic">Catatan Pelatih:</p>
                                        <p className="text-slate-300 text-sm font-medium leading-relaxed italic">&quot;{item.notes}&quot;</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-20 bg-slate-800/20 rounded-3xl border border-slate-700/50 border-dashed">
                    <div className="p-6 rounded-full bg-slate-800/50 text-slate-600 mb-4">
                        <SearchX size={48} />
                    </div>
                    <h3 className="text-white font-black text-lg uppercase tracking-tight">Belum Ada Data</h3>
                    <p className="text-slate-500 text-xs mt-1 font-bold italic tracking-widest uppercase">Evaluasimu untuk bulan ini belum tersedia.</p>
                </div>
            )}
        </div>
    )
}
