
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Calendar,
    Users,
    Save,
    CheckCircle2,
    Clock,
    UserMinus,
    Stethoscope,
    AlertCircle,
    Trophy,
    ShieldCheck,
    Activity,
    Brain,
    Filter
} from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PROGRAMS } from '@/lib/constants'

export default function MemberAttendancePage() {
    const [members, setMembers] = useState([])
    const [attendance, setAttendance] = useState({}) // { memberId: status }
    const [dailyScores, setDailyScores] = useState({}) // { memberId: score }
    const [dailyMetrics, setDailyMetrics] = useState({}) // { memberId: { technique: 0, discipline: 0, physical: 0, mental: 0 } }
    const [coachId, setCoachId] = useState(null)
    const [userRole, setUserRole] = useState('')
    const [selectedProgram, setSelectedProgram] = useState('')
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { settings } = useSettings()
    const [coachName, setCoachName] = useState('')

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
                setCoachName(profile?.full_name)

                // Head Coach defaults to all programs ('')
                // Regular Coach defaults to their assigned program
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
        const fetchData = async () => {
            if (!coachId) return
            setLoading(true)
            try {
                // Fetch members for this program
                let memberQuery = supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, program_pilihan')
                    .eq('role', 'member')

                if (selectedProgram) {
                    memberQuery = memberQuery.eq('program_pilihan', selectedProgram)
                }

                const { data: memberData } = await memberQuery
                    .order('full_name', { ascending: true })
                setMembers(memberData || [])

                // Fetch existing attendance for this date
                const { data: attendData } = await supabase
                    .from('member_attendance')
                    .select('member_id, status, daily_score, daily_metrics')
                    .eq('coach_id', coachId)
                    .eq('date', selectedDate)

                const attendMap = {}
                const scoreMap = {}
                const metricsMap = {}
                attendData?.forEach(item => {
                    attendMap[item.member_id] = item.status
                    scoreMap[item.member_id] = item.daily_score || 0
                    metricsMap[item.member_id] = item.daily_metrics || { technique: 4, discipline: 4, physical: 4, mental: 4 }
                })
                setAttendance(attendMap)
                setDailyScores(scoreMap)
                setDailyMetrics(metricsMap)

            } catch (error) {
                console.error('Error fetching attendance:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [selectedDate, selectedProgram, coachId])

    const handleStatusChange = (memberId, status) => {
        setAttendance(prev => ({ ...prev, [memberId]: status }))
        if (status !== 'hadir') {
            setDailyScores(prev => ({ ...prev, [memberId]: 0 }))
            setDailyMetrics(prev => ({ ...prev, [memberId]: { technique: 0, discipline: 0, physical: 0, mental: 0 } }))
        } else if (!dailyScores[memberId]) {
            setDailyScores(prev => ({ ...prev, [memberId]: 80 })) // Default initial weighted score
            setDailyMetrics(prev => ({ ...prev, [memberId]: { technique: 4, discipline: 4, physical: 4, mental: 4 } }))
        }
    }

    const updateMetric = (memberId, key, value) => {
        setDailyMetrics(prev => {
            const current = prev[memberId] || { technique: 4, discipline: 4, physical: 4, mental: 4 }
            const newMetrics = { ...current, [key]: value }
            const weightedScore = (
                ((newMetrics.technique || 0) * 40) +
                ((newMetrics.discipline || 0) * 20) +
                ((newMetrics.physical || 0) * 20) +
                ((newMetrics.mental || 0) * 20)
            ) / 5
            setDailyScores(s => ({ ...s, [memberId]: weightedScore }))
            return { ...prev, [memberId]: newMetrics }
        })
    }

    const attendAll = () => {
        const attendMap = { ...attendance }
        const scoreMap = { ...dailyScores }
        const metricsMap = { ...dailyMetrics }
        members.forEach(m => {
            attendMap[m.id] = 'hadir'
            if (!metricsMap[m.id]) {
                metricsMap[m.id] = { technique: 4, discipline: 4, physical: 4, mental: 4 }
                scoreMap[m.id] = 80
            }
        })
        setAttendance(attendMap)
        setDailyScores(scoreMap)
        setDailyMetrics(metricsMap)
    }


    const saveAttendance = async () => {
        setSaving(true)
        try {
            const records = Object.entries(attendance).map(([mId, status]) => ({
                member_id: mId,
                coach_id: coachId,
                date: selectedDate,
                status: status,
                daily_score: dailyScores[mId] || 0,
                daily_metrics: dailyMetrics[mId] || {}
            }))

            if (records.length === 0) return

            // Delete old records for this date/coach to avoid duplicates
            await supabase
                .from('member_attendance')
                .delete()
                .eq('coach_id', coachId)
                .eq('date', selectedDate)

            // Insert new records
            const { error } = await supabase
                .from('member_attendance')
                .insert(records)

            if (error) throw error
            alert('Data absensi berhasil disimpan!')
        } catch (error) {
            alert('Gagal simpan absensi: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case 'hadir': return <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            case 'izin': return <Clock className="w-4 h-4 text-blue-500" />
            case 'sakit': return <Stethoscope className="w-4 h-4 text-amber-500" />
            case 'alfa': return <UserMinus className="w-4 h-4 text-red-500" />
            default: return null
        }
    }

    if (loading) return <div className="p-8 text-slate-400">Memuat data absensi...</div>

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Calendar className="text-blue-500" />
                        Penilaian Harian Atlet
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Pilih tanggal pertemuan dan centang kehadiran serta metrik latihan atlet.
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 md:gap-4 flex-wrap">
                    <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[200px]">
                        <Calendar size={18} className="text-blue-400 flex-shrink-0" />
                        <div className="flex flex-col flex-1">
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Tanggal Pertemuan</span>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-white focus:outline-none text-sm w-full font-bold"
                            />
                        </div>
                    </div>

                    {userRole === 'head_coach' && (
                        <div className="bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 flex items-center gap-3 min-w-[200px]">
                            <Filter size={18} className="text-slate-500 flex-shrink-0" />
                            <div className="flex flex-col flex-1">
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none mb-1">Filter Program</span>
                                <select
                                    value={selectedProgram}
                                    onChange={(e) => setSelectedProgram(e.target.value)}
                                    className="bg-transparent text-white focus:outline-none text-sm w-full font-bold cursor-pointer"
                                >
                                    <option value="" className="bg-slate-800 italic">Semua Program</option>
                                    {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                                </select>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 sm:flex sm:flex-row gap-2 md:gap-3">
                        <button
                            onClick={saveAttendance}
                            disabled={saving}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                        >
                            <Save size={18} className="flex-shrink-0" />
                            <span className="truncate">{saving ? '...' : 'Simpan'}</span>
                        </button>
                        <button
                            onClick={attendAll}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 md:px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-emerald-900/20 active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
                        >
                            <CheckCircle2 size={18} className="flex-shrink-0" />
                            <span className="truncate">Hadir Semua</span>
                        </button>
                    </div>

                </div>
            </div>

            {/* Attendance Table Card */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl overflow-hidden backdrop-blur-sm">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800 border-b border-slate-700">
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider w-12 text-center">No.</th>
                                <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Atlet</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Hadir</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Izin</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Sakit</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Alfa</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-xs font-bold uppercase tracking-wider">Metrik Latihan (T | D | F | S)</th>
                                <th className="px-6 py-4 text-right text-slate-400 text-xs font-bold uppercase tracking-wider">Skor</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {members.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-500 italic">
                                        Tidak ada atlet terdaftar {selectedProgram ? `di program ${selectedProgram?.toUpperCase()}` : 'di sistem'}.
                                    </td>
                                </tr>
                            ) : members.map((m, index) => {
                                const status = attendance[m.id]
                                return (
                                    <tr key={m.id} className="hover:bg-slate-700/20 transition-colors">
                                        <td className="px-6 py-4 text-center text-xs font-bold text-slate-600">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden">
                                                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <Users size={16} className="text-slate-500" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white font-medium text-sm">{m.full_name}</span>
                                                    {userRole === 'head_coach' && !selectedProgram && m.program_pilihan && (
                                                        <span className="text-[9px] font-bold text-blue-500 uppercase tracking-tighter italic leading-none">{m.program_pilihan}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {['hadir', 'izin', 'sakit', 'alfa'].map((s) => {
                                            const isSelected = status === s
                                            const config = {
                                                hadir: { label: 'H', active: 'bg-emerald-600 border-emerald-500 text-white shadow-emerald-500/40', inactive: 'text-emerald-500/50 border-emerald-500/20 hover:border-emerald-500/40 hover:bg-emerald-500/5' },
                                                izin: { label: 'I', active: 'bg-blue-600 border-blue-500 text-white shadow-blue-500/40', inactive: 'text-blue-500/50 border-blue-500/20 hover:border-blue-500/40 hover:bg-blue-500/5' },
                                                sakit: { label: 'S', active: 'bg-amber-600 border-amber-500 text-white shadow-amber-500/40', inactive: 'text-amber-500/50 border-amber-500/20 hover:border-amber-500/40 hover:bg-amber-500/5' },
                                                alfa: { label: 'A', active: 'bg-red-600 border-red-500 text-white shadow-red-500/40', inactive: 'text-red-500/50 border-red-500/20 hover:border-red-500/40 hover:bg-red-500/5' }
                                            }[s]

                                            return (
                                                <td key={s} className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleStatusChange(m.id, s)}
                                                        className={`
                                                            w-8 h-8 rounded-xl border-2 font-black text-xs transition-all active:scale-90 flex items-center justify-center
                                                            ${isSelected ? `${config.active} shadow-lg scale-110` : config.inactive}
                                                        `}
                                                    >
                                                        {config.label}
                                                    </button>
                                                </td>
                                            )
                                        })}

                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {/* Technique */}
                                                <div className="flex flex-col items-center gap-1 group relative">
                                                    <button
                                                        disabled={status !== 'hadir'}
                                                        onClick={() => updateMetric(m.id, 'technique', ((dailyMetrics[m.id]?.technique || 0) % 5) + 1)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${status === 'hadir' ? 'bg-blue-600/10 border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}
                                                    >
                                                        <Trophy size={14} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-slate-500">{dailyMetrics[m.id]?.technique || 0}</span>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">TEKNIK (40%)</div>
                                                </div>

                                                {/* Discipline */}
                                                <div className="flex flex-col items-center gap-1 group relative">
                                                    <button
                                                        disabled={status !== 'hadir'}
                                                        onClick={() => updateMetric(m.id, 'discipline', ((dailyMetrics[m.id]?.discipline || 0) % 5) + 1)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${status === 'hadir' ? 'bg-emerald-600/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-600 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}
                                                    >
                                                        <ShieldCheck size={14} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-slate-500">{dailyMetrics[m.id]?.discipline || 0}</span>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">DISIPLIN (20%)</div>
                                                </div>

                                                {/* Physical */}
                                                <div className="flex flex-col items-center gap-1 group relative">
                                                    <button
                                                        disabled={status !== 'hadir'}
                                                        onClick={() => updateMetric(m.id, 'physical', ((dailyMetrics[m.id]?.physical || 0) % 5) + 1)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${status === 'hadir' ? 'bg-amber-600/10 border-amber-500/30 text-amber-400 hover:bg-amber-600 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}
                                                    >
                                                        <Activity size={14} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-slate-500">{dailyMetrics[m.id]?.physical || 0}</span>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">FISIK (20%)</div>
                                                </div>

                                                {/* Mental/Attitude */}
                                                <div className="flex flex-col items-center gap-1 group relative">
                                                    <button
                                                        disabled={status !== 'hadir'}
                                                        onClick={() => updateMetric(m.id, 'mental', ((dailyMetrics[m.id]?.mental || 0) % 5) + 1)}
                                                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${status === 'hadir' ? 'bg-purple-600/10 border-purple-500/30 text-purple-400 hover:bg-purple-600 hover:text-white' : 'opacity-20 grayscale cursor-not-allowed'}`}
                                                    >
                                                        <Brain size={14} />
                                                    </button>
                                                    <span className="text-[10px] font-black text-slate-500">{dailyMetrics[m.id]?.mental || 0}</span>
                                                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">SIKAP (20%)</div>
                                                </div>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4 text-right">
                                            <div className={`text-sm font-black transition-all ${status === 'hadir' ? 'text-white' : 'text-slate-600'}`}>
                                                {status === 'hadir' ? Math.round(dailyScores[m.id]) : 0}
                                                <span className="text-[10px] opacity-40 ml-1">%</span>
                                            </div>
                                            <p className="text-[8px] font-bold text-slate-500 uppercase tracking-tighter">Weighted Score</p>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Grading Guide Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <div className="w-2 h-4 bg-blue-600 rounded-full animate-pulse"></div>
                        Panduan Penilaian (Skala 1 - 5)
                    </h3>
                    <div className="grid grid-cols-5 gap-2">
                        {[
                            { val: 1, label: 'Sangat Kurang', color: 'bg-red-500/10 text-red-400 border-red-500/20' },
                            { val: 2, label: 'Kurang', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' },
                            { val: 3, label: 'Cukup', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
                            { val: 4, label: 'Baik', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
                            { val: 5, label: 'Istimewa', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' }
                        ].map((item) => (
                            <div key={item.val} className={`p-2 rounded-xl border text-center ${item.color}`}>
                                <div className="text-lg font-black">{item.val}</div>
                                <div className="text-[7px] uppercase font-bold tracking-tighter leading-tight mt-1">{item.label}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 space-y-3">
                        <div className="flex items-start gap-3 p-3 bg-blue-600/5 rounded-2xl border border-blue-600/10">
                            <AlertCircle size={16} className="text-blue-500 shrink-0 mt-0.5" />
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                                Klik pada ikon metrik (T/D/F/S) di tabel untuk mengubah skor. Skor akan otomatis berputar dari 1 ke 5.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-800/80 border border-slate-700/50 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                    <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Activity size={18} className="text-blue-500" />
                        Keterangan Metrik
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <p className="text-blue-400 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                <Trophy size={10} /> Teknik (40%)
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Kualitas gerakan, efisiensi di air, & koordinasi.</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-emerald-400 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                <ShieldCheck size={10} /> Disiplin (20%)
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Kehadiran (on-time), fokus, & ikuti instruksi.</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-amber-400 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                <Activity size={10} /> Fisik (20%)
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Daya tahan (endurance), kekuatan, & kecepatan.</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-purple-400 text-[9px] font-black uppercase tracking-widest italic flex items-center gap-1.5">
                                <Brain size={10} /> Sikap (20%)
                            </p>
                            <p className="text-[10px] text-slate-500 font-medium leading-tight">Mentalitas, kerja sama tim, & semangat.</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hint Box */}
            <div className="bg-blue-600/5 border border-blue-600/20 p-6 rounded-3xl flex items-center justify-between gap-6 ring-1 ring-blue-500/10">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                        <Save size={24} />
                    </div>
                    <div>
                        <h4 className="text-white font-black text-sm uppercase tracking-widest italic">Ingat Simpan Data</h4>
                        <p className="text-slate-400 text-xs font-medium">Jangan lupa klik tombol <strong className="text-blue-400">&quot;Simpan&quot;</strong> di atas sebelum meninggalkan halaman ini.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
