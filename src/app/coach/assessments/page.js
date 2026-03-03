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

export default function MemberAssessmentsPage() {
    const [members, setMembers] = useState([])
    const [program, setProgram] = useState('')
    const [coachId, setCoachId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [userRole, setUserRole] = useState('')
    const [selectedProgram, setSelectedProgram] = useState('')
    const [loading, setLoading] = useState(true)

    // Selection Month/Year
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

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

    const fetchData = async () => {
        if (!coachId) return
        setLoading(true)
        try {
            // Dynamic member query
            let memberQuery = supabase
                .from('profiles')
                .select('id, full_name, avatar_url, program_pilihan')
                .eq('role', 'member')

            if (selectedProgram) {
                memberQuery = memberQuery.eq('program_pilihan', selectedProgram)
            }

            const { data: memberData } = await memberQuery
                .order('full_name', { ascending: true })

            // Fetch latest assessment for each member in the selected month
            let assessments = []
            if (viewMode === 'monthly') {
                const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
                const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

                const { data } = await supabase
                    .from('member_assessments')
                    .select('*')
                    .in('member_id', (memberData || []).map(m => m.id))
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
                    .in('member_id', (memberData || []).map(m => m.id))
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
            console.error('Error fetching assessments:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const initProfile = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setCoachId(user.id)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, program_pilihan, role')
                    .eq('id', user.id)
                    .single()

                setUserRole(profile?.role)

                if (profile?.role === 'head_coach') {
                    setSelectedProgram('')
                } else {
                    setSelectedProgram(profile?.program_pilihan)
                }
            } catch (error) {
                console.error('Error initializing profile:', error)
            }
        }
        initProfile()
    }, [])

    useEffect(() => {
        fetchData()
    }, [selectedMonth, selectedYear, viewMode, selectedProgram, coachId])

    const fetchAttendance = async (memberId) => {
        try {
            const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
            const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

            const { data, count } = await supabase
                .from('member_attendance')
                .select('*', { count: 'exact' })
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

        // If an assessment exists for this month, load it for editing
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

        // Default empty form
        setFormData({
            technique: 4,
            discipline: 4,
            physical: 4,
            mental: 4,
            notes: ''
        })
    }

    // Effect to calculate score
    useEffect(() => {
        const score = (
            (formData.technique * 40) +
            (formData.discipline * 20) +
            (formData.physical * 20) +
            (formData.mental * 20)
        ) / 5
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
            const { error } = await supabase
                .from('profiles')
                .update({ program_pilihan: nextLevel })
                .eq('id', promotingMember.id)

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
            const recordDate = isCurrentMonth
                ? today.toLocaleDateString('en-CA')
                : new Date(selectedYear, selectedMonth + 1, 0).toLocaleDateString('en-CA')

            const assessmentData = {
                member_id: selectedMember.id,
                coach_id: coachId,
                date: recordDate,
                category: 'Evaluasi Bulanan',
                score: calculatedScore,
                notes: formData.notes,
                evaluation: {
                    technique: formData.technique,
                    discipline: formData.discipline,
                    physical: formData.physical,
                    mental: formData.mental,
                    attendance_pct: attendancePct,
                    status: status.label
                }
            }

            let result;
            if (selectedMember.latest_assessment) {
                const assessDate = new Date(selectedMember.latest_assessment.date)
                if (assessDate.getMonth() === selectedMonth && assessDate.getFullYear() === selectedYear) {
                    result = await supabase
                        .from('member_assessments')
                        .update(assessmentData)
                        .eq('id', selectedMember.latest_assessment.id)
                } else {
                    result = await supabase
                        .from('member_assessments')
                        .insert([assessmentData])
                }
            } else {
                result = await supabase
                    .from('member_assessments')
                    .insert([assessmentData])
            }

            if (result.error) throw result.error

            alert('Penilaian berhasil disimpan!')
            setIsModalOpen(false)
            setTimeout(() => {
                initData()
            }, 800)
        } catch (error) {
            alert('Gagal simpan penilaian: ' + error.message)
        } finally {
            setSubmitting(false)
        }
    }

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="p-8 text-slate-400">Memuat data penilaian...</div>

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <BarChart3 className="text-blue-500" />
                        Penilaian Atlet
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

                <div className="flex flex-col md:flex-row items-center gap-3">
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                        <select
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                            className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none"
                        >
                            {months.map((m, i) => (
                                <option key={i} value={i} className="bg-slate-800 text-white">{m}</option>
                            ))}
                        </select>
                        <select
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="bg-transparent text-white text-xs font-bold px-2 py-1 border-l border-slate-700 focus:outline-none"
                        >
                            {years.map(y => (
                                <option key={y} value={y} className="bg-slate-800 text-white">{y}</option>
                            ))}
                        </select>
                    </div>

                    {userRole === 'head_coach' && (
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl p-1">
                            <Filter className="w-4 h-4 text-slate-500 ml-2" />
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="bg-transparent text-white text-xs font-bold px-2 py-1 focus:outline-none cursor-pointer"
                            >
                                <option value="" className="bg-slate-800 italic">Semua Program</option>
                                {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                            </select>
                        </div>
                    )}

                    <div className="relative w-full md:w-auto">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari nama atlet..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 w-full md:w-64 transition-all text-sm"
                        />
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider w-12 text-center">No.</th>
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Atlet</th>
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Skor Terakhir</th>
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Kategori Terakhir</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-20 text-center text-slate-500 italic">
                                        <SearchX size={48} className="mx-auto mb-4 opacity-20" />
                                        Belum ada atlet yang ditemukan {selectedProgram ? `di program ${selectedProgram?.toUpperCase()}` : 'di sistem'}.
                                    </td>
                                </tr>
                            ) : filteredMembers.map((m, index) => (
                                <tr key={m.id} className="hover:bg-slate-700/20 transition-colors group">
                                    <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">{index + 1}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-700 border border-slate-600 flex items-center justify-center overflow-hidden">
                                                {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <User size={20} className="text-slate-500" />}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white font-bold group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none">{m.full_name}</span>
                                                {userRole === 'head_coach' && !selectedProgram && m.program_pilihan && (
                                                    <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter italic leading-none mt-1">{m.program_pilihan}</span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.latest_assessment ? (
                                            <div className="flex items-center gap-2">
                                                <TrendingUp size={14} className={m.latest_assessment.score >= 70 ? 'text-emerald-500' : 'text-red-500'} />
                                                <span className={`font-mono font-bold ${m.latest_assessment.score >= 70 ? 'text-emerald-400' : 'text-red-400'}`}>
                                                    {m.latest_assessment.score} / 100
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs italic">Belum ada nilai</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {m.latest_assessment ? (
                                            <div className="flex flex-col">
                                                <span className="text-white text-xs font-bold uppercase tracking-wider">
                                                    {m.latest_assessment.evaluation?.status || 'Evaluasi'}
                                                </span>
                                                <span className="text-slate-500 text-[10px]">
                                                    {new Date(m.latest_assessment.date).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}
                                                </span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-600 text-xs italic">-</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={() => openAssessmentModal(m)}
                                                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-[120px] ${m.latest_assessment ? 'bg-amber-600/10 hover:bg-amber-600 text-amber-400 hover:text-white' : 'bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white'}`}
                                            >
                                                {m.latest_assessment ? <><Plus size={14} /> Edit Nilai</> : <><Plus size={14} /> Beri Nilai</>}
                                            </button>

                                            {m.latest_assessment?.evaluation?.status === 'NAIK LEVEL' && LEVEL_MAPPING[m.program_pilihan]?.next && (
                                                <button
                                                    onClick={() => { setPromotingMember(m); setIsPromoteModalOpen(true); }}
                                                    className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 mx-auto w-full max-w-[120px] animate-pulse"
                                                >
                                                    <ArrowUpCircle size={14} /> Promosi
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

            {/* Assessment Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setIsModalOpen(false)}></div>
                    <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl animate-fadeIn max-h-[90vh] flex flex-col">
                        <div className="p-6 border-b border-slate-700 bg-slate-800/50 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <BarChart3 size={20} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">Evaluasi Bulanan</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-black leading-none mt-0.5">{selectedMember?.full_name}</p>
                                </div>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                                <Plus size={24} className="rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-4">
                                <div className={`p-4 rounded-xl flex items-center justify-between ${attendancePct < 80 ? 'bg-red-500/10 border border-red-500/20' : 'bg-slate-700/30 border border-slate-600'}`}>
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-lg ${attendancePct < 80 ? 'bg-red-500/20 text-red-500' : 'bg-slate-600 text-slate-400'}`}>
                                            <CalendarCheck size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Presensi</p>
                                            <p className={`text-lg font-black ${attendancePct < 80 ? 'text-red-400' : 'text-emerald-400'}`}>{attendancePct}%</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/20 flex flex-col justify-between">
                                    <div className="flex items-center justify-between w-full">
                                        <div>
                                            <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest leading-none mb-1">Performa Latihan</p>
                                            <div className="flex gap-2 text-[8px] font-black text-slate-500 uppercase">
                                                <span>T:{avgDailyMetrics.technique}</span>
                                                <span>D:{avgDailyMetrics.discipline}</span>
                                                <span>F:{avgDailyMetrics.physical}</span>
                                                <span>S:{avgDailyMetrics.mental}</span>
                                            </div>
                                            <p className="text-lg font-black text-blue-400 mt-1">{avgDailyScore || '-'} <span className="text-[10px] opacity-50">/ 100</span></p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={applyRecommendation}
                                            disabled={!avgDailyScore}
                                            className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow-lg active:scale-90 transition-all disabled:opacity-30 disabled:grayscale"
                                            title="Gunakan Rekomendasi Detail"
                                        >
                                            <TrendingUp size={16} />
                                        </button>
                                    </div>
                                    {avgDailyScore > 0 && <p className="text-[7px] text-slate-500 font-bold uppercase mt-1 leading-none">* Klik panah untuk isi otomatis per kategori</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Trophy size={12} className="text-blue-500" /> Teknik (40%)
                                        </label>
                                        <span className={`text-sm font-black ${formData.technique < 3 ? 'text-red-400' : 'text-blue-400'}`}>{formData.technique} / 5</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        value={formData.technique}
                                        onChange={e => setFormData({ ...formData, technique: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                                    />
                                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                        <span>Kurang</span>
                                        <span>Sangat Baik</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <ShieldCheck size={12} className="text-emerald-500" /> Disiplin (20%)
                                        </label>
                                        <span className="text-sm font-black text-emerald-400">{formData.discipline} / 5</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        value={formData.discipline}
                                        onChange={e => setFormData({ ...formData, discipline: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                                    />
                                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                        <span>Kurang</span>
                                        <span>Sangat Baik</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Activity size={12} className="text-amber-500" /> Fisik (20%)
                                        </label>
                                        <span className="text-sm font-black text-amber-400">{formData.physical} / 5</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        value={formData.physical}
                                        onChange={e => setFormData({ ...formData, physical: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                                    />
                                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                        <span>Kurang</span>
                                        <span>Sangat Baik</span>
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                            <Brain size={12} className="text-purple-500" /> Mental (20%)
                                        </label>
                                        <span className="text-sm font-black text-purple-400">{formData.mental} / 5</span>
                                    </div>
                                    <input
                                        type="range" min="1" max="5" step="1"
                                        value={formData.mental}
                                        onChange={e => setFormData({ ...formData, mental: parseInt(e.target.value) })}
                                        className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                    />
                                    <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-tighter">
                                        <span>Kurang</span>
                                        <span>Sangat Baik</span>
                                    </div>
                                </div>
                            </div>

                            <div className={`p-4 rounded-2xl border-2 flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${getStatus().bg} ${getStatus().color.replace('text', 'border')}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`p-4 rounded-2xl ${getStatus().bg}`}>
                                        {(() => {
                                            const StatusIcon = getStatus().icon
                                            return <StatusIcon size={32} />
                                        })()}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-pink-300 tracking-widest leading-none">Skor Akhir & Rekomendasi</p>
                                        <p className="text-2xl font-black mt-1 text-pink-400">{calculatedScore} <span className="text-xs opacity-50 font-medium text-pink-300/50">/ 100</span></p>
                                        <p className={`text-xs font-black uppercase tracking-widest mt-1 p-1 px-2 rounded-lg inline-block ${getStatus().bg} ${getStatus().color}`}>
                                            {getStatus().label}
                                        </p>
                                        {getStatus().reason && <p className="text-[9px] font-medium opacity-70 mt-0.5 text-pink-300/70">* {getStatus().reason}</p>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-slate-400 text-[10px] font-black uppercase tracking-wider mb-2">Catatan Pelatih</label>
                                <textarea
                                    rows="2"
                                    placeholder="Tuliskan evaluasi teknis lebih detail..."
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm resize-none transition-all"
                                ></textarea>
                            </div>

                            <div className="pt-2 flex gap-3 shrink-0">
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs"
                                >
                                    {submitting ? 'Menyimpan...' : 'Simpan Penilaian'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-4 border border-slate-700 text-slate-400 font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all text-xs"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Promote (Level Up) Modal */}
            {isPromoteModalOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsPromoteModalOpen(false)}></div>
                    <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-fadeIn">
                        <div className="p-8 text-center space-y-6">
                            <div className="relative mx-auto w-24 h-24">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20"></div>
                                <div className="relative bg-emerald-500 text-white p-6 rounded-full flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                    <Trophy size={40} />
                                </div>
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tight">Promosikan Atlet</h3>
                                <p className="text-slate-400 text-sm mt-2 font-medium">
                                    Konfirmasi kenaikan level untuk <span className="text-white font-bold">{promotingMember?.full_name}</span>.
                                </p>
                            </div>

                            <div className="flex items-center justify-center gap-4 bg-slate-700/30 p-4 rounded-xl border border-slate-600">
                                <div className="text-left">
                                    <p className="text-[10px] text-slate-500 uppercase font-black">Dari</p>
                                    <p className="text-xs font-bold text-slate-300">{LEVEL_MAPPING[promotingMember?.program_pilihan]?.label}</p>
                                </div>
                                <ChevronRight className="text-slate-500" size={20} />
                                <div className="text-left">
                                    <p className="text-[10px] text-emerald-500 uppercase font-black">Ke</p>
                                    <p className="text-xs font-black text-emerald-400">{LEVEL_MAPPING[LEVEL_MAPPING[promotingMember?.program_pilihan]?.next]?.label}</p>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handlePromote}
                                    disabled={promoting}
                                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50 text-xs flex items-center justify-center gap-2"
                                >
                                    {promoting ? 'Proses...' : 'Ya, Promosikan'}
                                    {!promoting && <CheckCircle2 size={16} />}
                                </button>
                                <button
                                    onClick={() => setIsPromoteModalOpen(false)}
                                    className="px-6 py-4 border border-slate-700 text-slate-400 font-black uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all text-xs"
                                >
                                    Batal
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
