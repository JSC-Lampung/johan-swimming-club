
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    FileText,
    CalendarCheck,
    CheckCircle,
    Clock,
    User,
    ClipboardList,
    Filter,
    ChevronDown,
    SearchX,
    Trash2
} from 'lucide-react'
import { PROGRAMS } from '@/lib/constants'

export default function AdminReportsPage() {
    const [activeTab, setActiveTab] = useState('reports') // 'reports' or 'attendance'
    const [reports, setReports] = useState([])
    const [attendance, setAttendance] = useState([])
    const [loading, setLoading] = useState(true)

    // Filter state
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
    const [selectedProgram, setSelectedProgram] = useState('all')

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i)

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            try {
                const startOfMonth = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
                const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]

                if (activeTab === 'reports') {
                    let query = supabase
                        .from('coach_reports')
                        .select(`
                            *,
                            profiles!inner (
                                full_name,
                                avatar_url,
                                position_title,
                                program_pilihan
                            )
                        `)
                        .gte('created_at', `${startOfMonth}T00:00:00`)
                        .lte('created_at', `${endOfMonth}T23:59:59`)

                    if (selectedProgram !== 'all') {
                        query = query.eq('profiles.program_pilihan', selectedProgram)
                    }

                    const { data, error } = await query.order('created_at', { ascending: false })
                    if (error) throw error
                    setReports(data || [])
                } else {
                    let query = supabase
                        .from('coach_attendance')
                        .select(`
                            *,
                            profiles!inner (
                                full_name,
                                avatar_url,
                                program_pilihan
                            )
                        `)
                        .gte('date', startOfMonth)
                        .lte('date', endOfMonth)

                    if (selectedProgram !== 'all') {
                        query = query.eq('profiles.program_pilihan', selectedProgram)
                    }

                    const { data, error } = await query.order('date', { ascending: false })
                    if (error) throw error
                    setAttendance(data || [])
                }
            } catch (error) {
                console.error('Error fetching admin data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [activeTab, selectedMonth, selectedYear, selectedProgram])

    const markAsReviewed = async (reportId) => {
        try {
            const { error } = await supabase
                .from('coach_reports')
                .update({ is_reviewed: true })
                .eq('id', reportId)

            if (error) throw error
            setReports(reports.map(r => r.id === reportId ? { ...r, is_reviewed: true } : r))
        } catch (error) {
            alert('Gagal update status: ' + error.message)
        }
    }

    const handleDeleteReport = async (reportId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus laporan ini? Tindakan ini tidak dapat dibatalkan.')) return
        try {
            const { error } = await supabase
                .from('coach_reports')
                .delete()
                .eq('id', reportId)

            if (error) throw error
            setReports(reports.filter(r => r.id !== reportId))
        } catch (error) {
            alert('Gagal menghapus laporan: ' + error.message)
        }
    }

    const handleDeleteAttendance = async (attendanceId) => {
        if (!confirm('Apakah Anda yakin ingin menghapus data absensi ini?')) return
        try {
            const { error } = await supabase
                .from('coach_attendance')
                .delete()
                .eq('id', attendanceId)

            if (error) throw error
            setAttendance(attendance.filter(a => a.id !== attendanceId))
        } catch (error) {
            alert('Gagal menghapus absensi: ' + error.message)
        }
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header & Tabs */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-slate-700/50 pb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <ClipboardList className="text-blue-500" />
                        Monitoring Kinerja Pelatih
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Pantau absensi harian, jumlah latihan, serta tinjau laporan kerja seluruh pelatih.
                    </p>
                </div>

                <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
                    <button
                        onClick={() => setActiveTab('reports')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reports' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <FileText size={16} /> Laporan
                    </button>
                    <button
                        onClick={() => setActiveTab('attendance')}
                        className={`px-6 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'attendance' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        <CalendarCheck size={16} /> Absensi
                    </button>
                </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-slate-800/50 border border-slate-700/50 p-4 rounded-2xl flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter size={16} className="text-slate-500" />
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Filter:</span>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                    >
                        {months.map((m, i) => (
                            <option key={i} value={i} className="bg-slate-800">{m}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
                    >
                        {years.map(y => (
                            <option key={y} value={y} className="bg-slate-800">{y}</option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2">
                    <select
                        value={selectedProgram}
                        onChange={(e) => setSelectedProgram(e.target.value)}
                        className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer min-w-[120px]"
                    >
                        <option value="all" className="bg-slate-800">Semua Program</option>
                        {PROGRAMS.map(p => (
                            <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="py-20 text-center text-slate-500">Memuat data...</div>
            ) : (
                <div className="space-y-6">
                    {activeTab === 'reports' ? (
                        <div className="grid grid-cols-1 gap-6">
                            {reports.length === 0 ? (
                                <div className="py-20 flex flex-col items-center justify-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 text-slate-500">
                                    <SearchX size={48} className="mb-4 opacity-20" />
                                    <p className="font-bold uppercase tracking-widest text-sm">Tidak ada laporan ditemukan</p>
                                    <p className="text-xs mt-1 opacity-60">Coba ubah filter bulan, tahun, atau program.</p>
                                </div>
                            ) : reports.map((r) => (
                                <div key={r.id} className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden hover:border-slate-500 transition-all">
                                    <div className="p-6 border-b border-slate-700/50 flex justify-between items-start">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-600">
                                                {r.profiles?.avatar_url ? <img src={r.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={24} className="text-slate-500" />}
                                            </div>
                                            <div>
                                                <h3 className="text-white font-bold">{r.profiles?.full_name || 'Pelatih'}</h3>
                                                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">{r.profiles?.position_title || 'Coach'}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-white font-bold text-sm uppercase">{r.title}</p>
                                            <p className="text-slate-500 text-[10px] mt-1 italic">{new Date(r.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="p-6 bg-slate-800/50">
                                        <p className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{r.content}</p>
                                    </div>
                                    <div className="p-4 bg-slate-900/30 border-t border-slate-700/50 flex justify-between items-center">
                                        <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest ${r.is_reviewed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                            {r.is_reviewed ? <><CheckCircle size={12} /> Sudah Dibaca</> : <><Clock size={12} /> Menunggu Review</>}
                                        </div>
                                        <div className="flex items-center gap-3">
                                            {!r.is_reviewed && (
                                                <button
                                                    onClick={() => markAsReviewed(r.id)}
                                                    className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold rounded-lg uppercase tracking-wider transition-all active:scale-95 shadow-lg"
                                                >
                                                    Tandai Dibaca
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteReport(r.id)}
                                                className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all active:scale-95 border border-red-500/20"
                                                title="Hapus Laporan"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-900 border-b border-slate-700">
                                            <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Tanggal</th>
                                            <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Pelatih</th>
                                            <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Program</th>
                                            <th className="px-6 py-4 text-slate-400 text-xs font-bold uppercase tracking-wider">Waktu Check-in</th>
                                            <th className="px-6 py-4 text-right text-slate-400 text-xs font-bold uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-700/50">
                                        {attendance.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center justify-center text-slate-500">
                                                        <SearchX size={40} className="mb-3 opacity-20" />
                                                        <p className="font-bold uppercase tracking-widest text-xs">Tidak ada data absensi</p>
                                                        <p className="text-[10px] mt-1 opacity-60 italic">Ubah filter untuk melihat data lain.</p>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : attendance.map((a) => (
                                            <tr key={a.id} className="hover:bg-slate-700/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <span className="text-white text-sm font-medium">{new Date(a.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden border border-slate-600">
                                                            {a.profiles?.avatar_url ? <img src={a.profiles.avatar_url} className="w-full h-full object-cover" /> : <User size={16} className="text-slate-500 mx-auto mt-1.5" />}
                                                        </div>
                                                        <span className="text-white font-bold text-xs uppercase">{a.profiles?.full_name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-blue-400 text-xs font-bold uppercase">{a.profiles?.program_pilihan || '-'}</span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                                                        <Clock size={14} className="text-slate-500" />
                                                        {new Date(a.check_in).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[10px] font-bold uppercase tracking-widest">Hadir</span>
                                                        <button
                                                            onClick={() => handleDeleteAttendance(a.id)}
                                                            className="p-1.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition-all active:scale-95 border border-red-500/20"
                                                            title="Hapus Absensi"
                                                        >
                                                            <Trash2 size={12} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
