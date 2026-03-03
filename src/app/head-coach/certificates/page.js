'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    ScrollText,
    Search,
    Filter,
    Trophy,
    Award,
    Printer,
    ChevronRight,
    SearchX,
    User,
    Calendar,
    CheckCircle2,
    AlertCircle,
    TrendingUp
} from 'lucide-react'
import { PROGRAMS, LEVEL_MAPPING } from '@/lib/constants'
import Link from 'next/link'

export default function CertificateManagementPage() {
    const [loading, setLoading] = useState(true)
    const [nominations, setNominations] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedProgram, setSelectedProgram] = useState('All')
    const [selectedQuarter, setSelectedQuarter] = useState(Math.floor(new Date().getMonth() / 3) + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const quarters = [
        { id: 1, name: 'Triwulan I (Jan - Mar)', months: [0, 1, 2] },
        { id: 2, name: 'Triwulan II (Apr - Jun)', months: [3, 4, 5] },
        { id: 3, name: 'Triwulan III (Jul - Sep)', months: [6, 7, 8] },
        { id: 4, name: 'Triwulan IV (Okt - Des)', months: [9, 10, 11] }
    ]

    useEffect(() => {
        fetchNominations()
    }, [selectedQuarter, selectedYear, selectedProgram])

    const fetchNominations = async () => {
        setLoading(true)
        try {
            const quarter = quarters.find(q => q.id === selectedQuarter)
            const startDate = new Date(selectedYear, quarter.months[0], 1).toISOString().split('T')[0]
            const endDate = new Date(selectedYear, quarter.months[2] + 1, 0).toISOString().split('T')[0]

            // 1. Fetch all members
            let memberQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, program_pilihan')
                .eq('role', 'member')

            if (selectedProgram !== 'All') {
                memberQuery = memberQuery.eq('program_pilihan', selectedProgram)
            }

            const { data: members } = await memberQuery.order('full_name')

            if (!members) return

            // 2. Fetch assessments for these members in the quarter
            const { data: assessments } = await supabase
                .from('member_assessments')
                .select('*')
                .in('member_id', members.map(m => m.id))
                .gte('date', startDate)
                .lte('date', endDate)

            // 3. Process Nominations
            const processedNominations = members.map(member => {
                const memberAssessments = assessments?.filter(a => a.member_id === member.id) || []

                if (memberAssessments.length === 0) return null

                // Average Score
                const avgScore = Math.round(memberAssessments.reduce((acc, curr) => acc + curr.score, 0) / memberAssessments.length)

                // Average Attendance Pct
                const avgAttendance = Math.round(memberAssessments.reduce((acc, curr) => acc + (curr.evaluation?.attendance_pct || 0), 0) / memberAssessments.length)

                // Latest Status
                const latestAssessment = [...memberAssessments].sort((a, b) => new Date(b.date) - new Date(a.date))[0]
                const latestStatus = latestAssessment?.evaluation?.status

                // Criteria for Recommendation
                const isRecommended = avgScore >= 80 && avgAttendance >= 75 && latestStatus === 'NAIK LEVEL'

                return {
                    ...member,
                    avgScore,
                    avgAttendance,
                    latestStatus,
                    isRecommended,
                    assessmentCount: memberAssessments.length
                }
            }).filter(n => n !== null)

            setNominations(processedNominations)
        } catch (error) {
            console.error('Error fetching nominations:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredNominations = nominations.filter(n =>
        n.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8 animate-fadeIn pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Award className="text-emerald-500" />
                        Manajemen Sertifikat Level
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Monitor kelayakan kenaikan level dan cetak sertifikat kelulusan atlet.</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama atlet..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={selectedQuarter}
                            onChange={e => setSelectedQuarter(parseInt(e.target.value))}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors"
                        >
                            {quarters.map(q => <option key={q.id} value={q.id}>{q.name}</option>)}
                        </select>
                        <select
                            value={selectedProgram}
                            onChange={e => setSelectedProgram(e.target.value)}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-4 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors min-w-[140px]"
                        >
                            <option value="All">Semua Program</option>
                            {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Nomination Table */}
            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl overflow-hidden">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-separate border-spacing-y-2 px-4">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                                <th className="px-4 py-6">Atlet</th>
                                <th className="px-4 py-6">Rata Skor (3Bln)</th>
                                <th className="px-4 py-6">Presensi</th>
                                <th className="px-4 py-6">Status Terakhir</th>
                                <th className="px-4 py-6">Rekomendasi</th>
                                <th className="px-4 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6} className="px-4 py-4 bg-slate-800/20 rounded-2xl h-16 mb-2"></td>
                                    </tr>
                                ))
                            ) : filteredNominations.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <SearchX size={48} className="mb-4" />
                                            <p className="font-black uppercase tracking-[0.2em] italic">Tidak ada nominasi tersedia</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredNominations.map((nomination) => (
                                    <tr key={nomination.id} className="group">
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-l border-slate-700/50 rounded-l-2xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                    {nomination.avatar_url ? (
                                                        <img src={nomination.avatar_url} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <User size={20} className="text-slate-600" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-black text-white uppercase tracking-tight">{nomination.full_name}</span>
                                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-widest italic">{nomination.program_pilihan}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-slate-700/50">
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={14} className={nomination.avgScore >= 80 ? 'text-emerald-500' : 'text-slate-500'} />
                                                <span className={`text-sm font-black italic ${nomination.avgScore >= 80 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {nomination.avgScore}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-slate-700/50">
                                            <span className={`text-xs font-bold ${nomination.avgAttendance >= 75 ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                {nomination.avgAttendance}%
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-slate-700/50">
                                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-lg ${nomination.latestStatus === 'NAIK LEVEL' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-700/50 text-slate-400'
                                                }`}>
                                                {nomination.latestStatus || 'EVALUASI'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-slate-700/50">
                                            {nomination.isRecommended ? (
                                                <div className="flex items-center gap-2 text-emerald-400 animate-pulse">
                                                    <CheckCircle2 size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">DIREKOMENDASIKAN</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 text-slate-600">
                                                    <AlertCircle size={16} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">BELUM LAYAK</span>
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-4 py-4 bg-slate-800/40 border-y border-r border-slate-700/50 rounded-r-2xl text-right">
                                            <Link
                                                href={`/head-coach/certificates/print/${nomination.id}?q=${selectedQuarter}&y=${selectedYear}`}
                                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${nomination.isRecommended
                                                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                                        : 'bg-slate-700 text-slate-500 cursor-not-allowed grayscale'
                                                    }`}
                                            >
                                                <Printer size={14} />
                                                Cetak
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-[2rem] space-y-4">
                    <div className="flex items-center gap-3 text-blue-400">
                        <Calendar size={20} />
                        <h4 className="font-black uppercase tracking-widest text-sm">Standar Kelulusan (3 Bulan)</h4>
                    </div>
                    <ul className="space-y-3">
                        <li className="flex items-center gap-3 text-xs font-medium text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Rata-rata skor evaluasi minimal 80%
                        </li>
                        <li className="flex items-center gap-3 text-xs font-medium text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Rata-rata presensi kehadiran minimal 75%
                        </li>
                        <li className="flex items-center gap-3 text-xs font-medium text-slate-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                            Status evaluasi bulan terakhir wajib "NAIK LEVEL"
                        </li>
                    </ul>
                </div>
                <div className="bg-emerald-600/10 border border-emerald-500/20 p-6 rounded-[2rem] flex flex-col justify-center text-center">
                    <Trophy size={40} className="mx-auto mb-4 text-emerald-500 opacity-50" />
                    <p className="text-xl font-black text-white italic uppercase tracking-tight">Grooming Future Champions</p>
                    <p className="text-slate-400 text-xs mt-2">Sertifikat ini adalah bukti prestasi dan kerja keras atlet dalam mencapai standar Johan Swimming Club.</p>
                </div>
            </div>
        </div>
    )
}
