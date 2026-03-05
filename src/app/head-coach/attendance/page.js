
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

export default function HeadCoachAttendancePage() {
    const [members, setMembers] = useState([])
    const [attendance, setAttendance] = useState({}) // { memberId: status }
    const [leaveRequests, setLeaveRequests] = useState({}) // { memberId: reason }
    const [dailyScores, setDailyScores] = useState({}) // { memberId: score }
    const [dailyMetrics, setDailyMetrics] = useState({}) // { memberId: { technique: 0, discipline: 0, physical: 0, mental: 0 } }
    const [coachId, setCoachId] = useState(null)
    const [selectedProgram, setSelectedProgram] = useState('all')
    const [selectedDate, setSelectedDate] = useState(new Date().toLocaleDateString('en-CA'))
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const { settings } = useSettings()
    const [coachName, setCoachName] = useState('')

    useEffect(() => {
        const init = async () => {
            setLoading(true)
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setCoachId(user.id)

                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name')
                    .eq('id', user.id)
                    .single()
                setCoachName(profile?.full_name)

                // Fetch members for SELECTED program
                let memberQuery = supabase
                    .from('profiles')
                    .select('id, full_name, avatar_url, program_pilihan')
                    .eq('role', 'member')

                if (selectedProgram !== 'all') {
                    memberQuery = memberQuery.eq('program_pilihan', selectedProgram)
                }

                const { data: memberData } = await memberQuery
                    .order('full_name', { ascending: true })
                setMembers(memberData || [])

                // Fetch existing attendance for this date
                const memberIds = memberData?.map(m => m.id) || []

                if (memberIds.length > 0) {
                    const { data: attendData } = await supabase
                        .from('member_attendance')
                        .select('member_id, status, daily_score, daily_metrics')
                        .in('member_id', memberIds)
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

                    // Fetch leave requests for this date
                    const { data: leaveData } = await supabase
                        .from('member_leave_requests')
                        .select('member_id, reason')
                        .in('member_id', memberIds)
                        .eq('leave_date', selectedDate)

                    const leaveMap = {}
                    leaveData?.forEach(item => {
                        leaveMap[item.member_id] = item.reason
                    })
                    setLeaveRequests(leaveMap)
                } else {
                    setAttendance({})
                    setLeaveRequests({})
                    setDailyScores({})
                    setDailyMetrics({})
                }

            } catch (error) {
                console.error('Error:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [selectedDate, selectedProgram])

    const handleStatusChange = (memberId, status) => {
        setAttendance(prev => ({ ...prev, [memberId]: status }))
        if (status !== 'hadir') {
            setDailyScores(prev => ({ ...prev, [memberId]: 0 }))
            setDailyMetrics(prev => ({ ...prev, [memberId]: { technique: 0, discipline: 0, physical: 0, mental: 0 } }))
        } else if (!dailyScores[memberId]) {
            setDailyScores(prev => ({ ...prev, [memberId]: 80 }))
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

            // Delete old records for THESE members on this date
            const mIds = members.map(m => m.id)
            await supabase
                .from('member_attendance')
                .delete()
                .in('member_id', mIds)
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


    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                        <Calendar className="text-blue-500" />
                        PENILAIAN HARIAN (ALL)
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic text-blue-400/80">
                        Monitoring tanggal pertemuan dan input kehadiran atlet lintas program.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 md:gap-4">
                    <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2">
                        <Filter size={16} className="text-slate-500" />
                        <select
                            value={selectedProgram}
                            onChange={(e) => setSelectedProgram(e.target.value)}
                            className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                        >
                            <option value="all" className="bg-slate-800">Semua Program</option>
                            {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                        </select>
                    </div>

                    <div className="bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 flex items-center gap-3 min-w-[180px]">
                        <Calendar size={18} className="text-blue-400" />
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none mb-0.5">Tanggal Pertemuan</span>
                            <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                className="bg-transparent text-white focus:outline-none text-xs font-bold" />
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button onClick={saveAttendance} disabled={saving} className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2">
                            <Save size={16} /> {saving ? '...' : 'Simpan'}
                        </button>
                        <button onClick={attendAll} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all flex items-center gap-2">
                            <CheckCircle2 size={16} /> Hadir Semua
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden backdrop-blur-sm shadow-2xl">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/80 border-b border-white/5">
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest w-12 text-center">No.</th>
                                <th className="px-6 py-4 text-slate-400 text-[10px] font-black uppercase tracking-widest">Atlet</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Hadir</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Izin</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Sakit</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Alfa</th>
                                <th className="px-6 py-4 text-center text-slate-400 text-[10px] font-black uppercase tracking-widest">Metrik Teknik & Kedisiplinan</th>
                                <th className="px-6 py-4 text-right text-slate-400 text-[10px] font-black uppercase tracking-widest">Skor Harian</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-bold">
                            {members.length === 0 ? (
                                <tr><td colSpan="8" className="px-6 py-20 text-center text-slate-500 italic uppercase text-[10px] tracking-widest">Tidak ada atlet {selectedProgram !== 'all' ? `di level ${selectedProgram?.toUpperCase()}` : 'terdaftar'}.</td></tr>
                            ) : members.map((m, index) => {
                                const status = attendance[m.id]
                                return (
                                    <tr key={m.id} className="hover:bg-blue-500/5 transition-colors group">
                                        <td className="px-6 py-4 text-center text-[10px] font-black text-slate-600">{index + 1}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                                                    {m.avatar_url ? <img src={m.avatar_url} className="w-full h-full object-cover" /> : <Users size={18} className="text-slate-600" />}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs uppercase tracking-tight truncate max-w-[150px]">{m.full_name}</span>
                                                    {leaveRequests[m.id] ? (
                                                        <span className="text-[10px] font-black text-amber-500 uppercase tracking-tighter italic animate-pulse">
                                                            Izin: {leaveRequests[m.id]}
                                                        </span>
                                                    ) : (
                                                        selectedProgram === 'all' && m.program_pilihan && (
                                                            <span className="text-[8px] font-black uppercase text-blue-500 tracking-widest mt-0.5">
                                                                {m.program_pilihan}
                                                            </span>
                                                        )
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        {['hadir', 'izin', 'sakit', 'alfa'].map((s) => {
                                            const isSelected = attendance[m.id] === s;
                                            const activeColors = {
                                                hadir: 'bg-emerald-600 border-emerald-500 shadow-emerald-500/20',
                                                izin: 'bg-blue-600 border-blue-500 shadow-blue-500/20',
                                                sakit: 'bg-amber-600 border-amber-500 shadow-amber-500/20',
                                                alfa: 'bg-red-600 border-red-500 shadow-red-500/20'
                                            };
                                            return (
                                                <td key={s} className="px-6 py-4 text-center">
                                                    <button
                                                        onClick={() => handleStatusChange(m.id, s)}
                                                        className={`w-8 h-8 rounded-xl border-2 font-black text-[10px] transition-all active:scale-95 flex items-center justify-center ${isSelected ? `${activeColors[s]} text-white shadow-xl scale-110` : 'text-slate-600 border-slate-800 hover:border-slate-700'}`}
                                                    >
                                                        {s[0].toUpperCase()}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-3">
                                                {[
                                                    { key: 'technique', icon: Trophy, color: 'blue', label: 'TEKNIK (40%)' },
                                                    { key: 'discipline', icon: ShieldCheck, color: 'emerald', label: 'DISIPLIN (20%)' },
                                                    { key: 'physical', icon: Activity, color: 'amber', label: 'FISIK (20%)' },
                                                    { key: 'mental', icon: Brain, color: 'purple', label: 'SIKAP (20%)' }
                                                ].map(mItem => (
                                                    <div key={mItem.key} className="flex flex-col items-center gap-1 group relative">
                                                        <button
                                                            disabled={status !== 'hadir'}
                                                            onClick={() => updateMetric(m.id, mItem.key, ((dailyMetrics[m.id]?.[mItem.key] || 0) % 5) + 1)}
                                                            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${status === 'hadir' ? `bg-${mItem.color}-500/10 border-${mItem.color}-500/30 text-${mItem.color}-400 hover:bg-${mItem.color}-500 hover:text-white` : 'opacity-10 grayscale'}`}
                                                        >
                                                            <mItem.icon size={14} />
                                                        </button>
                                                        <span className="text-[10px] text-slate-500">{dailyMetrics[m.id]?.[mItem.key] || 0}</span>
                                                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 text-white text-[8px] font-bold rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                            {mItem.label}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className={`text-sm font-black italic transition-all ${status === 'hadir' ? 'text-blue-400' : 'text-slate-800'}`}>
                                                {status === 'hadir' ? Math.round(dailyScores[m.id]) : 0}%
                                            </div>
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
                        <h4 className="text-white font-black text-sm uppercase tracking-widest italic font-black">Ingat Simpan Data</h4>
                        <p className="text-slate-400 text-xs font-medium">Jangan lupa klik tombol <strong className="text-blue-400">&quot;Simpan&quot;</strong> di atas sebelum meninggalkan halaman ini.</p>
                    </div>
                </div>
            </div>

        </div>
    )
}
