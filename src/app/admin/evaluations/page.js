
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    BarChart3,
    ChevronDown,
    Trophy,
    Users,
    Calendar,
    Search,
    Download,
    TrendingUp,
    Star,
    FileText,
    ArrowUpCircle,
    Plus,
    Trash2
} from 'lucide-react'

import { PROGRAMS, LEVEL_MAPPING } from '@/lib/constants'

export default function AthleteEvaluationPage() {
    const [loading, setLoading] = useState(true)
    const [members, setMembers] = useState([])
    const [evaluations, setEvaluations] = useState([])
    const [selectedProgram, setSelectedProgram] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    // Modal state
    const [selectedMember, setSelectedMember] = useState(null)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [promoting, setPromoting] = useState(false)

    useEffect(() => {
        fetchData()
    }, [selectedMonth, selectedYear, selectedProgram])

    const fetchData = async () => {
        setLoading(true)
        try {
            // 1. Fetch members
            let query = supabase.from('profiles').select('*').eq('role', 'member')
            if (selectedProgram !== 'all') {
                query = query.eq('program_pilihan', selectedProgram)
            }
            const { data: memberData } = await query

            // 2. Fetch assessments for the selected month/year
            const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-01`
            const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0]

            const { data: assessData } = await supabase
                .from('member_assessments')
                .select('*')
                .gte('date', startDate)
                .lte('date', endDate)

            setMembers(memberData || [])
            setEvaluations(assessData || [])
        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    // Helper to calculate average score for a member
    const getMemberStats = (memberId) => {
        const memberAssess = evaluations.filter(e => e.member_id === memberId)
        if (memberAssess.length === 0) return null

        const avgScore = memberAssess.reduce((acc, curr) => acc + curr.score, 0) / memberAssess.length

        // Detailed categories (assuming from JSONB or just flat for now)
        // In this implementation, let's assume we use the score directly and note categories
        return {
            average: Math.round(avgScore),
            count: memberAssess.length,
            latest: memberAssess[memberAssess.length - 1]
        }
    }

    const handlePromote = async (member) => {
        const nextLevel = LEVEL_MAPPING[member.program_pilihan]?.next
        if (!nextLevel) return

        if (!confirm(`Konfirmasi kenaikan level untuk ${member.full_name} ke ${LEVEL_MAPPING[nextLevel].label}?`)) return

        setPromoting(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ program_pilihan: nextLevel })
                .eq('id', member.id)

            if (error) throw error

            alert(`Berhasil! ${member.full_name} kini berada di ${LEVEL_MAPPING[nextLevel].label}.`)
            setIsDetailModalOpen(false)
            fetchData()
        } catch (error) {
            alert('Gagal memproses kenaikan level: ' + error.message)
        } finally {
            setPromoting(false)
        }
    }

    const handleDeleteAssessment = async (assessmentId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data penilaian ini?')) return
        try {
            const { error } = await supabase
                .from('member_assessments')
                .delete()
                .eq('id', assessmentId)

            if (error) throw error

            setIsDetailModalOpen(false)
            fetchData()
        } catch (error) {
            alert('Gagal menghapus penilaian: ' + error.message)
        }
    }

    const filteredMembers = members.filter(m =>
        m.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const clubAverage = evaluations.length > 0
        ? Math.round(evaluations.reduce((acc, curr) => acc + curr.score, 0) / evaluations.length)
        : 0

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <BarChart3 className="text-blue-500" />
                        Evaluasi Perkembangan Atlet
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">
                        Pantau capaian skor dan teknik seluruh atlet secara berkala.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl text-slate-300 text-sm font-bold hover:bg-slate-700 transition-all">
                        <Download size={18} />
                        Cetak Laporan
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-blue-600/10 rounded-xl text-blue-500">
                            <TrendingUp size={24} />
                        </div>
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Rata-rata Skor Klub</h3>
                    </div>
                    <p className="text-4xl font-black text-white leading-none relative z-10">{clubAverage}%</p>
                    <div className="absolute -right-4 -bottom-4 text-blue-500/5 group-hover:scale-110 transition-transform duration-700 translate-y-4">
                        <TrendingUp size={120} />
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-emerald-600/10 rounded-xl text-emerald-500">
                            <Users size={24} />
                        </div>
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Aktivitas Evaluasi</h3>
                    </div>
                    <p className="text-4xl font-black text-white leading-none relative z-10">{evaluations.length}</p>
                    <p className="text-[10px] text-slate-500 mt-2 font-bold uppercase tracking-widest">Total Sesi Dinilai</p>
                    <div className="absolute -right-4 -bottom-4 text-emerald-500/5 group-hover:scale-110 transition-transform duration-700 translate-y-4">
                        <Users size={120} />
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-700/50 p-6 rounded-2xl relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-4 relative z-10">
                        <div className="p-3 bg-amber-600/10 rounded-xl text-amber-500">
                            <Star size={24} />
                        </div>
                        <h3 className="text-slate-400 font-bold uppercase tracking-widest text-xs">Top Performer</h3>
                    </div>
                    <p className="text-lg font-black text-white leading-none relative z-10 truncate">
                        {evaluations.length > 0 ? "Atlet Berprestasi" : "Belum Tersedia"}
                    </p>
                    <div className="absolute -right-4 -bottom-4 text-amber-500/5 group-hover:scale-110 transition-transform duration-700 translate-y-4">
                        <Trophy size={120} />
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-slate-800 border border-slate-700 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atlet..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:outline-none focus:border-blue-500 transition-all font-medium"
                    />
                </div>

                <select
                    value={selectedProgram}
                    onChange={(e) => setSelectedProgram(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white text-sm font-bold focus:outline-none focus:border-blue-500"
                >
                    <option value="all">Semua Program</option>
                    {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>

                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700 rounded-xl px-3 py-1">
                    <Calendar size={16} className="text-blue-500" />
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(Number(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none"
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString('id-ID', { month: 'long' })}</option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(Number(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none"
                    >
                        {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-900/50 border-b border-slate-700">
                                <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest">Atlet & Program</th>
                                <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest text-center">Rata-rata Skor</th>
                                <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest">Visualisasi Progres</th>
                                <th className="px-8 py-5 text-slate-400 text-[10px] font-black uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-500 animate-pulse font-bold italic tracking-widest">Menyelaraskan Data Evaluasi...</td></tr>
                            ) : filteredMembers.length === 0 ? (
                                <tr><td colSpan="4" className="px-8 py-20 text-center text-slate-500 italic">Tidak ada data atlet ditemukan.</td></tr>
                            ) : filteredMembers.map((m) => {
                                const stats = getMemberStats(m.id)
                                const isReadyForPromotion = stats?.latest?.evaluation?.status === 'NAIK LEVEL'

                                return (
                                    <tr key={m.id} className="hover:bg-slate-700/20 transition-all group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-slate-700 overflow-hidden border border-slate-600 group-hover:border-blue-500/50 transition-colors relative">
                                                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 font-bold">{m.full_name[0]}</div>}
                                                    {isReadyForPromotion && (
                                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-800 animate-pulse shadow-lg shadow-emerald-500/50"></div>
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-white font-black text-sm tracking-tight">{m.full_name}</h3>
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest">{LEVEL_MAPPING[m.program_pilihan]?.label || m.program_pilihan}</p>
                                                        {isReadyForPromotion && (
                                                            <span className="text-[8px] bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-500/20 font-black tracking-widest animate-pulse">SIAP NAIK LEVEL</span>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-center">
                                            {stats ? (
                                                <div className="inline-flex flex-col">
                                                    <span className="text-2xl font-black text-white">{stats.average}%</span>
                                                    <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">{stats.count} Sesi Dinilai</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-600 text-[10px] font-bold uppercase tracking-widest italic">Belum Ada Data</span>
                                            )}
                                        </td>
                                        <td className="px-8 py-6">
                                            {stats ? (
                                                <div className="w-full max-w-[200px] flex flex-col gap-2">
                                                    <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-700">
                                                        <div
                                                            className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full transition-all duration-1000 shadow-lg shadow-blue-500/20"
                                                            style={{ width: `${stats.average}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex justify-between text-[8px] font-black uppercase tracking-widest">
                                                        <span className="text-slate-500">Poor</span>
                                                        <span className="text-blue-400">Excellent</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-2 w-full bg-slate-900/50 border border-dashed border-slate-700 rounded-full"></div>
                                            )}
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button
                                                onClick={() => {
                                                    setSelectedMember({ ...m, stats })
                                                    setIsDetailModalOpen(true)
                                                }}
                                                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95 border border-slate-600"
                                            >
                                                Detail
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {isDetailModalOpen && selectedMember && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setIsDetailModalOpen(false)}></div>
                    <div className="relative w-full max-w-2xl bg-slate-800 border border-slate-700 rounded-[32px] overflow-hidden shadow-2xl animate-scaleIn">
                        {/* Modal Header */}
                        <div className="p-8 pb-4 border-b border-slate-700/50 flex justify-between items-start">
                            <div className="flex items-center gap-6">
                                <div className="w-20 h-20 rounded-3xl bg-slate-700 border border-slate-600 overflow-hidden shadow-2xl shadow-black/40">
                                    {selectedMember.avatar_url ? (
                                        <img src={selectedMember.avatar_url} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-500 text-3xl font-black">{selectedMember.full_name[0]}</div>
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-1">
                                        <h2 className="text-2xl font-black text-white uppercase tracking-tight">{selectedMember.full_name}</h2>
                                        {selectedMember.stats?.latest?.evaluation?.status === 'NAIK LEVEL' && (
                                            <span className="bg-emerald-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-emerald-500/20">REKOMENDASI NAIK LEVEL</span>
                                        )}
                                    </div>
                                    <p className="text-blue-400 text-xs font-black uppercase tracking-[0.2em]">{LEVEL_MAPPING[selectedMember.program_pilihan]?.label || selectedMember.program_pilihan}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsDetailModalOpen(false)} className="p-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-500 hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
                            {!selectedMember.stats ? (
                                <div className="py-20 text-center text-slate-500 italic font-medium uppercase tracking-widest text-xs">Belum ada data evaluasi untuk periode ini.</div>
                            ) : (
                                <div className="space-y-8">
                                    {/* Score Overview */}
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Teknik', score: selectedMember.stats.latest.evaluation?.technique || 0, color: 'text-blue-400' },
                                            { label: 'Disiplin', score: selectedMember.stats.latest.evaluation?.discipline || 0, color: 'text-emerald-400' },
                                            { label: 'Fisik', score: selectedMember.stats.latest.evaluation?.physical || 0, color: 'text-amber-400' },
                                            { label: 'Mental', score: selectedMember.stats.latest.evaluation?.mental || 0, color: 'text-purple-400' }
                                        ].map((stat, i) => (
                                            <div key={i} className="bg-slate-900/50 border border-slate-700/50 p-4 rounded-2xl flex flex-col items-center text-center">
                                                <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mb-2">{stat.label}</p>
                                                <div className={`text-2xl font-black ${stat.color}`}>{stat.score}<span className="text-[10px] opacity-20">/5</span></div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Performance Stats */}
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <TrendingUp size={14} className="text-blue-500" /> Analisis Skor Bulanan
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-end mb-2">
                                                    <p className="text-sm font-black text-white">Rata-rata Skor</p>
                                                    <p className="text-xl font-black text-blue-400">{selectedMember.stats.average}%</p>
                                                </div>
                                                <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                                    <div className="h-full bg-blue-600 transition-all duration-1000" style={{ width: `${selectedMember.stats.average}%` }}></div>
                                                </div>
                                                <div className="flex justify-between items-end mt-4">
                                                    <p className="text-sm font-black text-white text-opacity-70">Kehadiran Latihan</p>
                                                    <p className="text-lg font-black text-emerald-400">{selectedMember.stats.latest.evaluation?.attendance_pct || 0}%</p>
                                                </div>
                                                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden border border-slate-700">
                                                    <div className="h-full bg-emerald-500" style={{ width: `${selectedMember.stats.latest.evaluation?.attendance_pct || 0}%` }}></div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-900/50 border border-slate-700/50 p-6 rounded-3xl flex flex-col justify-center">
                                            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                                                <FileText size={14} className="text-amber-500" /> Catatan Pelatih
                                            </h4>
                                            <p className="text-slate-300 text-sm italic leading-relaxed font-medium">
                                                {selectedMember.stats.latest.notes ? `"${selectedMember.stats.latest.notes}"` : 'Tidak ada catatan tambahan dari pelatih.'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Modal Footer / Promotion Action */}
                        <div className="p-8 pt-4 bg-slate-900 border-t border-slate-700/50">
                            {selectedMember.stats?.latest?.evaluation?.status === 'NAIK LEVEL' && LEVEL_MAPPING[selectedMember.program_pilihan]?.next ? (
                                <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                                    <div className="text-center lg:text-left">
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1">REKOMENDASI PELATIH</p>
                                        <h5 className="text-white font-black text-sm">Sudah siap naik ke <span className="text-emerald-400 uppercase">{LEVEL_MAPPING[LEVEL_MAPPING[selectedMember.program_pilihan].next].label}</span>?</h5>
                                    </div>
                                    <button
                                        disabled={promoting}
                                        onClick={() => handlePromote(selectedMember)}
                                        className="w-full lg:w-auto px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all flex items-center justify-center gap-3"
                                    >
                                        <ArrowUpCircle size={20} />
                                        {promoting ? 'Memproses...' : 'Konfirmasi Kenaikan Level'}
                                    </button>
                                </div>
                            ) : (
                                <div className="flex justify-between items-center group">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic group-hover:text-blue-500 transition-colors">Pantau terus perkembangan tekniknya bulan depan.</p>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleDeleteAssessment(selectedMember.stats.latest.id)}
                                            className="px-4 py-3 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-red-500/20 transition-all shadow-lg shadow-red-500/5 hover:shadow-red-500/20 active:scale-95 flex items-center gap-2"
                                            title="Hapus Penilaian"
                                        >
                                            <Trash2 size={16} />
                                            Hapus Penilaian
                                        </button>
                                        <button
                                            onClick={() => setIsDetailModalOpen(false)}
                                            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-700"
                                        >
                                            Tutup
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
