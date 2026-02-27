'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Mail,
    Calendar,
    Send,
    Clock,
    CheckCircle2,
    AlertCircle,
    Trash2,
    MessageSquare
} from 'lucide-react'

export default function MemberLeavePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [requests, setRequests] = useState([])
    const [formData, setFormData] = useState({
        leave_date: '',
        reason: ''
    })
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                setUser(authUser)
                fetchRequests(authUser.id)
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    const fetchRequests = async (userId) => {
        const { data, error } = await supabase
            .from('member_leave_requests')
            .select('*')
            .eq('member_id', userId)
            .order('created_at', { ascending: false })

        if (!error) setRequests(data)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setMessage({ type: '', text: '' })

        try {
            const { error } = await supabase
                .from('member_leave_requests')
                .insert({
                    member_id: user.id,
                    leave_date: formData.leave_date,
                    reason: formData.reason
                })

            if (error) throw error

            setMessage({ type: 'success', text: 'Permohonan izin berhasil dikirim! ✨' })
            setFormData({ leave_date: '', reason: '' })
            fetchRequests(user.id)
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal mengirim izin: ' + error.message })
        } finally {
            setSubmitting(false)
        }
    }

    // Member can delete their own request
    const handleDelete = async (id) => {
        if (!confirm('Hapus permohonan izin ini?')) return

        try {
            const { error } = await supabase
                .from('member_leave_requests')
                .delete()
                .eq('id', id)

            if (error) throw error
            fetchRequests(user.id)
        } catch (error) {
            alert('Gagal menghapus: ' + error.message)
        }
    }

    if (loading) return <div className="p-8 text-slate-400 font-bold uppercase tracking-widest animate-pulse">Memuat data...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">IZIN ABSENSI</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">Kirim pemberitahuan jika Anda tidak dapat mengikuti kegiatan latihan.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Form Section */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleSubmit} className="bg-slate-800/50 backdrop-blur-md rounded-3xl border border-slate-700 p-8 shadow-2xl space-y-6 sticky top-24">
                        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                            Buat Izin Baru
                        </h3>

                        {message.text && (
                            <div className={`p-4 rounded-xl flex items-center gap-3 animate-slideIn ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                }`}>
                                {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                                <p className="font-bold text-xs tracking-tight">{message.text}</p>
                            </div>
                        )}

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Tanggal Izin</label>
                            <div className="relative">
                                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="date"
                                    required
                                    value={formData.leave_date}
                                    onChange={e => setFormData({ ...formData, leave_date: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 italic">Alasan Izin</label>
                            <div className="relative">
                                <MessageSquare className="absolute left-4 top-4 text-slate-500" size={18} />
                                <textarea
                                    required
                                    rows="4"
                                    placeholder="Contoh: Sedang sakit atau ada keperluan mendesak..."
                                    value={formData.reason}
                                    onChange={e => setFormData({ ...formData, reason: e.target.value })}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors resize-none"
                                ></textarea>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="bg-blue-600 hover:bg-blue-700 text-white font-black py-4 px-8 rounded-2xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-3 w-full disabled:opacity-50 active:scale-95"
                        >
                            <Send size={20} />
                            {submitting ? 'MENGIRIM...' : 'KIRIM PERMOHONAN'}
                        </button>
                    </form>
                </div>

                {/* History Section */}
                <div className="lg:col-span-2 space-y-6">
                    <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2 ml-2">
                        <Clock size={18} className="text-blue-500" />
                        Riwayat Izin Anda
                    </h3>

                    {requests.length === 0 ? (
                        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl p-12 text-center">
                            <Mail className="mx-auto text-slate-700 mb-4" size={48} />
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-sm">Belum ada riwayat izin.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {requests.map((req) => (
                                <div key={req.id} className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-600 transition-colors group">
                                    <div className="flex gap-6 items-start">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-slate-700 flex flex-col items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-blue-500 uppercase leading-none mb-1">
                                                {new Date(req.leave_date).toLocaleDateString('id-ID', { month: 'short' })}
                                            </span>
                                            <span className="text-xl font-black text-white leading-none">
                                                {new Date(req.leave_date).getDate()}
                                            </span>
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h4 className="text-white font-black text-sm tracking-tight uppercase italic underline decoration-blue-500/50 underline-offset-4">
                                                    Izin Kegiatan
                                                </h4>
                                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest ${req.status === 'read' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                                    }`}>
                                                    {req.status === 'read' ? 'Dilihat Pelatih' : 'Pending'}
                                                </span>
                                            </div>
                                            <p className="text-slate-400 text-sm font-medium line-clamp-2 italic italic">&quot;{req.reason}&quot;</p>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest pt-1">
                                                Dikirim: {new Date(req.created_at).toLocaleDateString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handleDelete(req.id)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all opacity-0 group-hover:opacity-100 active:scale-95 shrink-0"
                                        title="Hapus Izin"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
