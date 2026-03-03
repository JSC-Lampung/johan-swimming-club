
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    BarChart3,
    Search,
    Plus,
    Trophy,
    TrendingUp,
    ChevronRight,
    SearchX,
    User,
    Activity,
    Brain,
    ShieldCheck,
    CalendarCheck,
    AlertCircle,
    Info,
    ArrowUpCircle,
    CheckCircle2,
    Filter
} from 'lucide-react'
import { LEVEL_MAPPING, PROGRAMS } from '@/lib/constants'

export default function HeadCoachAssessmentsPage() {
    const [members, setMembers] = useState([])
    const [allMembers, setAllMembers] = useState([])
    const [selectedProgram, setSelectedProgram] = useState('all')
    const [searchQuery, setSearchQuery] = useState('')
    const [loading, setLoading] = useState(true)
    const [coachId, setCoachId] = useState(null)

    // Selection Month/Year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const years = [2024, 2025, 2026]

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)
    const [attendancePct, setAttendancePct] = useState(0)
    const [avgDailyScore, setAvgDailyScore] = useState(0)
    const [avgDailyMetrics, setAvgDailyMetrics] = useState({ technique: 0, discipline: 0, physical: 0, mental: 0 })
    const [formData, setFormData] = useState({
        technique: 4,
        discipline: 4,
        physical: 4,
        mental: 4,
        notes: ''
    })
    const [calculatedScore, setCalculatedScore] = useState(80)
    const [submitting, setSubmitting] = useState(false)

    // Promotion state
    const [isPromoteModalOpen, setIsPromoteModalOpen] = useState(false)
    const [promotingMember, setPromotingMember] = useState(null)
    const [promoting, setPromoting] = useState(false)

    const [viewMode, setViewMode] = useState('monthly') // 'monthly', 'quarterly'

    const initData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return
            setCoachId(user.id)

            // Fetch all members
            let memberQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, program_pilihan')
                .eq('role', 'member')
                .order('full_name', { ascending: true })

            const { data: memberData } = await memberQuery
            setAllMembers(memberData || [])

            // Fetch assessments based on viewMode
            let assessments = []
            if (viewMode === 'monthly') {
                const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
                const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

                const { data } = await supabase
                    .from('member_assessments')
                    .select('*')
                    .gte('date', startOfMonth)
                    .lte('date', endOfMonth)
                    .order('created_at', { ascending: false })
                assessments = data || []
            } else {
                // Quarterly: Get last 3 months
                const endOfPeriod = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]
                const startOfPeriod = new Date(selectedYear, selectedMonth - 2, 1).toISOString().split('T')[0]

                const { data } = await supabase
                    .from('member_assessments')
                    .select('*')
                    .gte('date', startOfPeriod)
                    .lte('date', endOfPeriod)
                    .order('date', { ascending: false })
                assessments = data || []
            }

            const membersWithLatest = (memberData || []).map(m => {
                const latest = assessments?.find(a => a.member_id === m.id)
                const allInPeriod = assessments?.filter(a => a.member_id === m.id) || []
                return { ...m, latest_assessment: latest, period_assessments: allInPeriod }
            })

            setMembers([...membersWithLatest])

        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        initData()
    }, [selectedMonth, selectedYear, viewMode])

    const fetchAttendance = async (memberId) => {
        try {
            const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
            const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

            const { data } = await supabase
                .from('member_attendance')
                .select('*')
                .eq('member_id', memberId)
                .gte('date', startOfMonth)
                .lte('date', endOfMonth)

            if (data) {
                const presentData = data.filter(a => a.status === 'hadir')
                const presentCount = presentData.length
                const total = data.length || 0
                setAttendancePct(total > 0 ? Math.round((presentCount / total) * 100) : 100)

                // Calculate average daily score
                const scores = presentData.map(a => a.daily_score).filter(s => s > 0)
                const avg = scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1) : 0
                setAvgDailyScore(parseFloat(avg))

                // Calculate specific metric averages
                const metricsList = presentData.map(a => a.daily_metrics).filter(m => m && Object.keys(m).length > 0)
                const metricAverages = { technique: 0, discipline: 0, physical: 0, mental: 0 }

                if (metricsList.length > 0) {
                    ['technique', 'discipline', 'physical', 'mental'].forEach(key => {
                        const sum = metricsList.reduce((acc, m) => acc + (m[key] || 0), 0)
                        metricAverages[key] = parseFloat((sum / metricsList.length).toFixed(1))
                    })
                }
                setAvgDailyMetrics(metricAverages)

                // AUTO-FILL form with daily averages as starting point
                setFormData(prev => ({
                    ...prev,
                    technique: Math.round(metricAverages.technique) || 4,
                    discipline: Math.round(metricAverages.discipline) || 4,
                    physical: Math.round(metricAverages.physical) || 4,
                    mental: Math.round(metricAverages.mental) || 4
                }))
            }
        } catch (error) {
            console.error('Error fetching attendance:', error)
        }
    }

    const openAssessmentModal = (member) => {
        setSelectedMember(member)
        fetchAttendance(member.id)
        setIsModalOpen(true)

        if (member.latest_assessment) {
            // Only load if it matches the current selected month for editing
            const assessDate = new Date(member.latest_assessment.date)
            if (assessDate.getMonth() === selectedMonth && assessDate.getFullYear() === selectedYear) {
                const evalData = member.latest_assessment.evaluation || {}
                setFormData({
                    technique: evalData.technique || 4,
                    discipline: evalData.discipline || 4,
                    physical: evalData.physical || 4,
                    mental: evalData.mental || 4,
                    notes: member.latest_assessment.notes || ''
                })
                return
            }
        }

        setFormData({ technique: 4, discipline: 4, physical: 4, mental: 4, notes: '' })
    }

    useEffect(() => {
        const score = ((formData.technique * 40) + (formData.discipline * 20) + (formData.physical * 20) + (formData.mental * 20)) / 5
        setCalculatedScore(Math.round(score))
    }, [formData])

    const getStatus = () => {
        if (formData.technique < 3) return { label: 'BELUM NAIK LEVEL', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle, reason: 'Teknik di bawah standar (min. 3)' }
        if (calculatedScore >= 85) return { label: 'NAIK LEVEL', color: 'text-emerald-400', bg: 'bg-emerald-500/10', icon: ShieldCheck }
        if (calculatedScore >= 70) return { label: 'BERTAHAN', color: 'text-cyan-300', bg: 'bg-cyan-500/20', icon: Info }
        return { label: 'BELUM NAIK LEVEL', color: 'text-red-400', bg: 'bg-red-500/10', icon: AlertCircle }
    }

    const applyRecommendation = () => {
        setFormData({
            ...formData,
            technique: Math.round(avgDailyMetrics.technique) || 4,
            discipline: Math.round(avgDailyMetrics.discipline) || 4,
            physical: Math.round(avgDailyMetrics.physical) || 4,
            mental: Math.round(avgDailyMetrics.mental) || 4
        })
    }

    const handlePromote = async () => {
        const nextLevel = LEVEL_MAPPING[promotingMember.program_pilihan]?.next
        if (!nextLevel) return
        setPromoting(true)
        try {
            const { error } = await supabase.from('profiles').update({ program_pilihan: nextLevel }).eq('id', promotingMember.id)
            if (error) throw error
            alert('Berhasil mempromosikan atlet ke level berikutnya!')
            setIsPromoteModalOpen(false)
            initData()
        } catch (error) {
            alert('Gagal memproses promosi: ' + error.message)
        } finally {
            setPromoting(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        const status = getStatus()
        try {
            const today = new Date()
            const isCurrentMonth = today.getMonth() === selectedMonth && today.getFullYear() === selectedYear
            const recordDate = isCurrentMonth ? today.toLocaleDateString('en-CA') : new Date(selectedYear, selectedMonth + 1, 0).toLocaleDateString('en-CA')

            const assessmentData = {
                member_id: selectedMember.id,
                coach_id: coachId,
                date: recordDate,
                category: 'Evaluasi Kepala Pelatih',
                score: calculatedScore,
                notes: formData.notes,
                evaluation: {
                    technique: formData.technique, discipline: formData.discipline, physical: formData.physical, mental: formData.mental,
                    attendance_pct: attendancePct, status: status.label
                }
            }

            let result;
            if (selectedMember.latest_assessment) {
                const assessDate = new Date(selectedMember.latest_assessment.date)
                if (assessDate.getMonth() === selectedMonth && assessDate.getFullYear() === selectedYear) {
                    result = await supabase.from('member_assessments').update(assessmentData).eq('id', selectedMember.latest_assessment.id)
                } else {
                    result = await supabase.from('member_assessments').insert([assessmentData])
                }
            } else {
                result = await supabase.from('member_assessments').insert([assessmentData])
            }

            if (result.error) throw result.error
            alert('Penilaian berhasil disimpan!')
            setIsModalOpen(false)
            setTimeout(() => initData(), 800)
        } catch (error) {
            alert('Gagal simpan penilaian: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const filteredMembers = members.filter(m => {
        const matchesSearch = m.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesProgram = selectedProgram === 'all' || m.program_pilihan === selectedProgram
        return matchesSearch && matchesProgram
    })

    if (loading) return <div className="p-8 text-slate-400">Memuat data penilaian...</div>

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <BarChart3 className="text-blue-500" />
                        Penilaian Atlet (All)
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                            <button
                                onClick={() => setViewMode('monthly')}
                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === 'monthly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Bulanan
                            </button>
                            <button
                                onClick={() => setViewMode('quarterly')}
                                className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-md transition-all ${viewMode === 'quarterly' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                            >
                                Triwulan
                            </button>
                        </div>
                        <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest bg-slate-800/50 px-2 py-1.5 rounded-lg border border-slate-700/50">
                            {viewMode === 'monthly' ? months[selectedMonth] : `${months[(selectedMonth - 2 + 12) % 12]} - ${months[selectedMonth]}`} {selectedYear}
                        </span>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                        <Filter className="w-4 h-4 text-slate-500 ml-2" />
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none"
                        >
                            <option value="all" className="bg-slate-800">Semua Program</option>
                            {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                        </select>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                        <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none">
                            {months.map((m, i) => <option key={i} value={i} className="bg-slate-800">{m}</option>)}
                        </select>
                        <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="bg-transparent text-white text-xs font-bold px-2 py-1 border-l border-slate-700 focus:outline-none">
                            {years.map(y => <option key={y} value={y} className="bg-slate-800">{y}</option>)}
                        </select>
                    </div>

                    <div className="relative flex-1 lg:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input type="text" placeholder="Cari atlet..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 w-full lg:w-48 transition-all text-sm font-medium" />
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/80 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest w-12 text-center">No.</th>
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Atlet & Program</th>
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Skor Penilaian</th>
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Status Terakhir</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {filteredMembers.length === 0 ? (
                                <tr><td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic"><SearchX size={48} className="mx-auto mb-4 opacity-20" /> Belum ada atlet ditemukan pada filter ini.</td></tr>
                            ) : filteredMembers.map((m, index) => (
                                <tr key={m.id} className="hover:bg-slate-800/40 transition-colors group">
                                    <td className="px-6 py-4 text-center text-[10px] font-black text-slate-600">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-600" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight text-xs">{m.full_name}</span>
                                                <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest">{LEVEL_MAPPING[m.program_pilihan]?.label || m.program_pilihan?.toUpperCase()}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.latest_assessment ? (
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                                                        <div className={`h-full ${m.latest_assessment.score >= 85 ? 'bg-emerald-500' : m.latest_assessment.score >= 70 ? 'bg-blue-500' : 'bg-red-500'}`} style={{ width: `${m.latest_assessment.score}%` }}></div>
                                                    </div>
                                                    <span className={`font-black text-xs ${m.latest_assessment.score >= 70 ? 'text-blue-400' : 'text-red-400'}`}>{m.latest_assessment.score}%</span>
                                                </div>
                                                <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">T:{m.latest_assessment.evaluation?.technique} D:{m.latest_assessment.evaluation?.discipline} F:{m.latest_assessment.evaluation?.physical} M:{m.latest_assessment.evaluation?.mental}</span>
                                            </div>
                                        ) : <span className="text-slate-700 text-[10px] font-black uppercase tracking-[0.2em]">Belum Dinilai</span>}
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.latest_assessment ? (
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-wider ${m.latest_assessment.evaluation?.status === 'NAIK LEVEL' ? 'text-emerald-400' : 'text-slate-400'}`}>
                                                    {m.latest_assessment.evaluation?.status || 'Evaluasi'}
                                                </span>
                                                <span className="text-slate-600 text-[9px] font-bold">Updated: {new Date(m.latest_assessment.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}</span>
                                            </div>
                                        ) : <span className="text-slate-700 text-xs">-</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col lg:flex-row items-center justify-center gap-2">
                                            <button onClick={() => openAssessmentModal(m)} className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full lg:w-auto ${m.latest_assessment ? 'bg-slate-800 hover:bg-slate-700 text-blue-400' : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white'}`}>
                                                {m.latest_assessment ? 'Edit Nilai' : 'Beri Nilai'}
                                            </button>
                                            {m.latest_assessment?.evaluation?.status === 'NAIK LEVEL' && LEVEL_MAPPING[m.program_pilihan]?.next && (
                                                <button onClick={() => { setPromotingMember(m); setIsPromoteModalOpen(true); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all w-full lg:w-auto animate-pulse">
                                                    Promosi
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Reuse Modals from Coach Assessment but with minor title adjustments if needed */}
            {/* Modal Assessment */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-scaleIn max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 shadow-xl shadow-blue-500/5">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-white uppercase tracking-tight">Evaluasi Kepala Pelatih</h3>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black leading-none mt-1">{selectedMember?.full_name} • {LEVEL_MAPPING[selectedMember?.program_pilihan]?.label}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full bg-slate-800 text-slate-500 hover:text-white flex items-center justify-center transition-all hover:rotate-90">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-2xl flex flex-col justify-center ${attendancePct < 80 ? 'bg-red-500/5 border border-red-500/20' : 'bg-slate-800/50 border border-slate-800'}`}>
                                    <p className="text-[9px] font-black uppercase text-slate-500 tracking-widest mb-1">Presensi Bulan Ini</p>
                                    <p className={`text-2xl font-black ${attendancePct < 80 ? 'text-red-400' : 'text-emerald-400'}`}>{attendancePct}%</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-center relative group">
                                    <p className="text-[9px] font-black uppercase text-blue-500 tracking-widest mb-1">Rekomendasi Skor</p>
                                    <p className="text-2xl font-black text-blue-400">{avgDailyScore || '-'}</p>
                                    <button type="button" onClick={applyRecommendation} disabled={!avgDailyScore} className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-blue-600 text-white rounded-xl shadow-xl active:scale-90 transition-all disabled:opacity-30 disabled:grayscale">
                                        <TrendingUp size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-6">
                                {[
                                    { key: 'technique', label: 'Teknik Dasar', pct: '40%', icon: Trophy, color: 'blue' },
                                    { key: 'discipline', label: 'Kedisiplinan', pct: '20%', icon: ShieldCheck, color: 'emerald' },
                                    { key: 'physical', label: 'Ketahanan Fisik', pct: '20%', icon: Activity, color: 'amber' },
                                    { key: 'mental', label: 'Kesiapan Mental', pct: '20%', icon: Brain, color: 'purple' }
                                ].map((item) => (
                                    <div key={item.key} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <item.icon size={14} className={`text-${item.color}-500`} />
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.label} ({item.pct})</label>
                                            </div>
                                            <span className={`text-sm font-black text-${item.color}-400`}>{formData[item.key]} <span className="text-[10px] opacity-30 text-slate-500">/ 5</span></span>
                                        </div>
                                        <input type="range" min="1" max="5" step="1" value={formData[item.key]} onChange={e => setFormData({ ...formData, [item.key]: parseInt(e.target.value) })}
                                            className={`w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-${item.color}-500 transition-all`} />
                                    </div>
                                ))}
                            </div>

                            <div className={`p-6 rounded-3xl border-2 flex items-center justify-between gap-4 transition-all ${getStatus().bg} ${getStatus().color.replace('text', 'border')}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${getStatus().bg} shadow-2xl`}>
                                        {(() => { const StatusIcon = getStatus().icon; return <StatusIcon size={32} /> })()}
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black uppercase text-white/40 tracking-widest">Calculated Score</p>
                                        <p className="text-3xl font-black text-white">{calculatedScore}%</p>
                                        <div className={`text-[10px] font-black uppercase tracking-[0.2em] mt-1 px-3 py-1 rounded-full ${getStatus().bg} ${getStatus().color} border border-current w-fit`}>
                                            {getStatus().label}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-500 text-[9px] font-black uppercase tracking-[0.2em] mb-3 ml-1">Catatan Kepala Pelatih</label>
                                <textarea rows="3" placeholder="Berikan instruksi teknis spesifik untuk progres atlet ini..." value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500/50 text-sm resize-none transition-all font-medium italic" />
                            </div>

                            <div className="flex gap-4 pt-2">
                                <button type="submit" disabled={submitting} className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-50 text-xs">
                                    {submitting ? 'Menyimpan Progres...' : 'Simpan Penilaian'}
                                </button>
                                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 bg-slate-800 text-slate-400 font-black uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all text-xs">
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote Modal */}
            {isPromoteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-xl" onClick={() => setIsPromoteModalOpen(false)}></div>
                    <div className="relative bg-slate-900 border border-slate-800 rounded-[32px] w-full max-w-sm overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-10 text-center space-y-8">
                            <div className="relative mx-auto w-28 h-28">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                                <div className="absolute inset-2 bg-emerald-500/20 rounded-full blur-xl"></div>
                                <div className="relative bg-gradient-to-br from-emerald-400 to-emerald-600 text-white p-7 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/40">
                                    <Trophy size={48} />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white uppercase tracking-tight italic">Achievement!</h3>
                                <p className="text-slate-500 text-sm mt-3 font-medium leading-relaxed">
                                    Siap mempromosikan <span className="text-white font-bold">{promotingMember?.full_name}</span> ke tingkatan yang lebih tinggi?
                                </p>
                            </div>
                            <div className="flex items-center justify-center gap-6 bg-slate-800/40 p-6 rounded-3xl border border-slate-700/50 shadow-inner">
                                <p className="text-xs font-black text-slate-500 uppercase tracking-tighter">{LEVEL_MAPPING[promotingMember?.program_pilihan]?.label}</p>
                                <ChevronRight className="text-emerald-500 animate-pulse" size={24} />
                                <p className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{LEVEL_MAPPING[LEVEL_MAPPING[promotingMember?.program_pilihan]?.next]?.label}</p>
                            </div>
                            <div className="flex flex-col gap-3">
                                <button onClick={handlePromote} disabled={promoting} className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-[0.2em] rounded-2xl shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 disabled:opacity-50 text-[10px] flex items-center justify-center gap-2">
                                    {promoting ? 'Processing...' : 'Konfirmasi Promosi'} <CheckCircle2 size={18} />
                                </button>
                                <button onClick={() => setIsPromoteModalOpen(false)} className="w-full py-4 text-slate-500 font-black uppercase tracking-widest text-[10px] hover:text-white transition-colors">Batalkan</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
