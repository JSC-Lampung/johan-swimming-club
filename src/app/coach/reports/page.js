
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
    MessageSquare
} from 'lucide-react'

export default function CoachReportsPage() {
    const [reports, setReports] = useState([])
    const [coachId, setCoachId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [isCreateMode, setIsCreateMode] = useState(false)

    // Form State
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')

    useEffect(() => {
        const fetchReports = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return
                setCoachId(user.id)

                const { data, error } = await supabase
                    .from('coach_reports')
                    .select('*')
                    .eq('coach_id', user.id)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setReports(data || [])
            } catch (error) {
                console.error('Fetch Reports Error:', error.message || error)
            } finally {
                setLoading(false)
            }
        }
        fetchReports()
    }, [])

    const handleSendReport = async (e) => {
        e.preventDefault()
        if (!title || !content) return alert('Mohon isi judul dan konten laporan.')

        setSubmitting(true)
        try {
            const { data, error } = await supabase
                .from('coach_reports')
                .insert([{
                    coach_id: coachId,
                    title,
                    content,
                    report_date: new Date().toISOString().split('T')[0]
                }])
                .select()

            if (error) throw error

            setReports([data[0], ...reports])
            alert('Laporan berhasil dikirim ke Admin!')
            setIsCreateMode(false)
            setTitle('')
            setContent('')
        } catch (error) {
            alert('Gagal mengirim laporan: ' + (error.message || 'Terjadi kesalahan'))
            console.error('Send Report Error:', error)
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="p-8 text-slate-400">Memuat data laporan...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <FileText className="text-blue-500" />
                        Laporan Kegiatan Pelatih
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Laporkan aktivitas training, kendala, atau prestasi kepada Admin.
                    </p>
                </div>

                {!isCreateMode && (
                    <button
                        onClick={() => setIsCreateMode(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 flex items-center gap-2 transition-all active:scale-95"
                    >
                        <Plus size={18} />
                        Buat Laporan Baru
                    </button>
                )}
            </div>

            {isCreateMode ? (
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl animate-slideUp">
                    <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/50">
                        <h2 className="text-lg font-bold text-white">Form Laporan Baru</h2>
                        <button onClick={() => setIsCreateMode(false)} className="text-slate-500 hover:text-white transition-colors">
                            <X size={24} />
                        </button>
                    </div>
                    <form onSubmit={handleSendReport} className="p-8 space-y-6">
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Judul Laporan</label>
                            <input
                                type="text"
                                placeholder="Misal: Laporan Sesi Sore - 23 Feb atau Evaluasi Latihan Bulanan"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                            />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">Konten / Isi Laporan</label>
                            <textarea
                                rows="8"
                                placeholder="Tuliskan detail kegiatan, jumlah atlet hadir, kendala sarana prasarana, atau catatan penting lainnya..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-4 text-white focus:outline-none focus:border-blue-500 transition-all text-sm leading-relaxed"
                            ></textarea>
                        </div>
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={submitting}
                                className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                <Send size={20} />
                                {submitting ? 'Mengirim...' : 'Kirim Laporan Sekarang'}
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsCreateMode(false)}
                                className="px-8 py-4 border border-slate-700 text-slate-400 font-bold rounded-xl hover:bg-slate-700 transition-all"
                            >
                                Batalkan
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="space-y-4">
                    <h2 className="text-slate-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                        <History size={14} /> Riwayat Laporan
                    </h2>

                    {reports.length === 0 ? (
                        <div className="py-20 text-center bg-slate-800/20 border-2 border-dashed border-slate-700/50 rounded-3xl">
                            <MessageSquare className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                            <p className="text-slate-500">Anda belum pernah mengirim laporan.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {reports.map((report) => (
                                <div key={report.id} className="bg-slate-800 border border-slate-700 rounded-2xl p-6 hover:border-slate-500 transition-all group">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">{report.title}</h3>
                                            <p className="text-slate-500 text-xs mt-1 flex items-center gap-2">
                                                <Clock size={12} />
                                                Dibuat: {new Date(report.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                        </div>
                                        <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 ${report.is_reviewed ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-400 border-slate-600/50'}`}>
                                            {report.is_reviewed ? (
                                                <> <CheckCircle size={10} /> Sudah Dibaca </>
                                            ) : (
                                                <> <Clock size={10} /> Menunggu </>
                                            )}
                                        </div>
                                    </div>
                                    <div className="mt-4 p-4 bg-slate-700/30 rounded-xl text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {report.content}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
