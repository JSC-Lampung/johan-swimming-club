'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    FileText,
    Send,
    History,
    CheckCircle,
    Clock,
    Plus,
    X,
    MessageSquare,
    Search,
    Calendar,
    Filter,
    Users
} from 'lucide-react'
import { PROGRAMS } from '@/lib/constants'

export default function HeadCoachReportsPage() {
    const [reports, setReports] = useState([])
    const [coaches, setCoaches] = useState([])
    const [currentUser, setCurrentUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isCreateMode, setIsCreateMode] = useState(false)

    // Filters
    const [searchCoach, setSearchCoach] = useState('All')
    const [searchProgram, setSearchProgram] = useState('All')
    const [searchTitle, setSearchTitle] = useState('')

    // Form State (For Head Coach's own reports)
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setCurrentUser(user)

                // Fetch all coaches for filter
                const { data: coachesData } = await supabase
                    .from('profiles')
                    .select('id, full_name')
                    .in('role', ['coach', 'head_coach'])
                    .order('full_name')
                setCoaches(coachesData || [])

                fetchReports()
            } catch (error) {
                console.error('Init error:', error)
            } finally {
                setLoading(false)
            }
        }
        init()
    }, [])

    const fetchReports = async () => {
        const { data, error } = await supabase
            .from('coach_reports')
            .select(`
                *,
                coach:profiles!coach_id(full_name, avatar_url, role, program_pilihan)
            `)
            .order('created_at', { ascending: false })

        if (!error) setReports(data || [])
    }

    const handleSendReport = async (e) => {
        e.preventDefault()
        if (!title || !content) return alert('Mohon isi judul dan konten laporan.')

        setSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('coach_reports')
                .insert([{
                    coach_id: currentUser.id,
                    title,
                    content,
                    report_date: new Date().toISOString().split('T')[0]
                }])
                .select()

            if (error) throw error

            alert('Laporan Anda berhasil dipublikasikan!')
            setIsCreateMode(false)
            setTitle('')
            setContent('')
            fetchReports()
        } catch (error) {
            alert('Gagal mengirim laporan: ' + (error.message || 'Terjadi kesalahan'))
        } finally {
            setSubmitting(false)
        }
    }

    const toggleReviewed = async (reportId, currentStatus) => {
        const { error } = await supabase
            .from('coach_reports')
            .update({ is_reviewed: !currentStatus })
            .eq('id', reportId)

        if (!error) {
            setReports(reports.map(r => r.id === reportId ? { ...r, is_reviewed: !currentStatus } : r))
        }
    }

    const filteredReports = reports.filter(r => {
        const coachMatch = searchCoach === 'All' || r.coach_id === searchCoach
        const titleMatch = r.title.toLowerCase().includes(searchTitle.toLowerCase())
        const programMatch = searchProgram === 'All' || r.coach?.program_pilihan === searchProgram
        return coachMatch && titleMatch && programMatch
    })

    if (loading) return <div className="p-8 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Memuat dashboard pengawasan...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-800/20 p-8 rounded-[2.5rem] border border-slate-800/50 backdrop-blur-md relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/5 blur-3xl -z-10 rounded-full"></div>
                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight uppercase italic">
                        <FileText className="text-blue-500" size={32} />
                        PENGAWASAN KEGIATAN
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium">
                        Pantau laporan harian pelatih dan kelola standarisasi program latihan.
                    </p>
                </div>

                {!isCreateMode && (
                    <button
                        onClick={() => setIsCreateMode(true)}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-600/20 flex items-center gap-3 transition-all active:scale-95 group shrink-0"
                    >
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                        BUAT LAPORAN SAYA
                    </button>
                )}
            </div>

            {isCreateMode ? (
                <div className="bg-slate-800 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl animate-slideUp">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <div className="flex items-center gap-3">
                            <Send className="text-blue-500" size={20} />
                            <h2 className="text-sm font-black text-white uppercase tracking-widest">Input Laporan Head Coach</h2>
                        </div>
                        <button onClick={() => setIsCreateMode(false)} className="bg-slate-900/50 p-2 rounded-xl text-slate-500 hover:text-white transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    <form onSubmit={handleSendReport} className="p-8 space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">Judul Laporan</label>
                                <input
                                    type="text"
                                    placeholder="Misal: Evaluasi Sesi Pagi / Catatan Supervisi"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-bold text-sm focus:border-blue-500 outline-none transition-all"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">Tanggal</label>
                                <div className="w-full bg-slate-900/20 border border-slate-800 rounded-2xl px-5 py-4 text-slate-400 font-bold text-sm italic">
                                    {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest px-1">Konten Laporan</label>
                            <textarea
                                rows="6"
                                placeholder="Tulis catatan kegiatan atau instruksi khusus di sini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-2xl px-5 py-4 text-white font-medium text-sm leading-relaxed focus:border-blue-500 outline-none transition-all resize-none"
                            ></textarea>
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-slate-700/50">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-emerald-600/20 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                <Send size={18} />
                                {submitting ? 'MEMPROSES...' : 'PUBLIKASIKAN LAPORAN'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreateMode(false)}
                                className="px-10 py-4 bg-slate-700 hover:bg-slate-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all active:scale-95"
                            >
                                BATAL
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Filters */}
                    <div className="bg-slate-900/40 p-4 rounded-[2rem] border border-slate-800/50 flex flex-wrap gap-4 items-center">
                        <div className="flex-1 min-w-[200px] relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                            <input
                                type="text"
                                placeholder="Cari judul laporan..."
                                value={searchTitle}
                                onChange={e => setSearchTitle(e.target.value)}
                                className="w-full bg-slate-800 border-none rounded-xl py-3 pl-10 pr-4 text-white text-[11px] font-bold focus:ring-1 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                                <Filter size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Program:</span>
                                <select
                                    value={searchProgram}
                                    onChange={e => setSearchProgram(e.target.value)}
                                    className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                                >
                                    <option value="All">Semua Program</option>
                                    {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                                </select>
                            </div>
                            <div className="flex items-center gap-2 text-slate-500 bg-slate-800/50 px-3 py-2 rounded-xl border border-slate-700/50">
                                <Users size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Pelatih:</span>
                                <select
                                    value={searchCoach}
                                    onChange={e => setSearchCoach(e.target.value)}
                                    className="bg-transparent text-white text-[11px] font-bold outline-none cursor-pointer"
                                >
                                    <option value="All">Semua Pelatih</option>
                                    {coaches.map(c => <option key={c.id} value={c.id} className="bg-slate-800">{c.full_name}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        {filteredReports.length === 0 ? (
                            <div className="py-24 text-center bg-slate-800/10 border-2 border-dashed border-slate-800 rounded-[3rem]">
                                <History className="w-16 h-16 text-slate-800 mx-auto mb-6" />
                                <p className="text-slate-600 font-black uppercase tracking-[0.2em] italic">Belum ada riwayat laporan.</p>
                            </div>
                        ) : (
                            filteredReports.map((report) => (
                                <div key={report.id} className="bg-slate-800/40 border border-slate-700/50 rounded-[2.5rem] p-8 hover:border-blue-500/30 transition-all group relative overflow-hidden">
                                    {/* Status Indicator */}
                                    <div className={`absolute left-0 top-0 bottom-0 w-1.5 transition-all duration-500 ${report.is_reviewed ? 'bg-emerald-500 shadowy-emerald-400/50' : 'bg-blue-500 animate-pulse shadow-[0_0_15px_rgba(59,130,246,0.5)]'}`}></div>

                                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-slate-900 border border-slate-700 overflow-hidden flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                                                {report.coach?.avatar_url ? (
                                                    <img src={report.coach.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="text-slate-700 font-black text-2xl uppercase italic">{report.coach?.full_name?.[0]}</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h3 className="text-lg font-black text-white italic group-hover:text-blue-400 transition-colors uppercase tracking-tight leading-none">{report.title}</h3>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                                                        <Users size={12} />
                                                        {report.coach?.full_name}
                                                    </p>
                                                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5">
                                                        <Calendar size={12} />
                                                        {new Date(report.report_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full lg:w-auto mt-4 lg:mt-0 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-700/30">
                                            <button
                                                onClick={() => toggleReviewed(report.id, report.is_reviewed)}
                                                className={`flex-1 lg:flex-none px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] flex items-center justify-center gap-2 transition-all active:scale-95 ${report.is_reviewed
                                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                                                    : 'bg-blue-600 text-white shadow-lg shadow-blue-600/20 group-hover:animate-bounce-subtle'
                                                    }`}
                                            >
                                                {report.is_reviewed ? (
                                                    <> <CheckCircle size={14} /> DITINJAU </>
                                                ) : (
                                                    <> <Clock size={14} /> TANDAI DIBACA </>
                                                )}
                                            </button>
                                        </div>
                                    </div>

                                    <div className="mt-8 p-6 bg-slate-900/60 rounded-[1.5rem] border border-slate-700/30 text-slate-300 text-sm leading-relaxed whitespace-pre-wrap font-medium font-sans italic selection:bg-blue-500/30">
                                        <div className="flex items-center gap-2 text-slate-600 mb-3 select-none">
                                            <MessageSquare size={14} />
                                            <span className="text-[9px] font-black uppercase tracking-widest">Detail Laporan:</span>
                                        </div>
                                        &quot;{report.content}&quot;
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
