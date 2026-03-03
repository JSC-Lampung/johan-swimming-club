'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Mail,
    Trash2,
    CheckCircle2,
    Clock,
    Search,
    User,
    Calendar,
    MessageSquare,
    AlertCircle
} from 'lucide-react'

export default function HeadCoachLeaveRequestsPage() {
    const [requests, setRequests] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [deleting, setDeleting] = useState(false)

    useEffect(() => {
        fetchRequests()
    }, [])

    const fetchRequests = async () => {
        try {
            const { data, error } = await supabase
                .from('member_leave_requests')
                .select(`
                    *,
                    member:profiles!member_id(id, full_name, avatar_url, program_pilihan)
                `)
                .order('created_at', { ascending: false })

            if (error) {
                console.error('Database Error Details:', error)
                throw error
            }

            setRequests(data || [])

            // Mark unread as read when head coach views the list
            if (data && data.length > 0) {
                const unreadIds = data.filter(r => r.status === 'pending').map(r => r.id)
                if (unreadIds.length > 0) {
                    await supabase
                        .from('member_leave_requests')
                        .update({ status: 'read' })
                        .in('id', unreadIds)
                }
            }
        } catch (error) {
            console.error('Error fetching leave requests:', error.message || error)
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus pesan izin ini dari database? Tindakan ini tidak dapat dibatalkan.')) return

        setDeleting(true)
        try {
            const { error } = await supabase
                .from('member_leave_requests')
                .delete()
                .eq('id', id)

            if (error) throw error
            setRequests(requests.filter(r => r.id !== id))
        } catch (error) {
            alert('Gagal menghapus: ' + error.message)
        } finally {
            setDeleting(false)
        }
    }

    const filteredRequests = requests.filter(req =>
        req.member?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.reason?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return <div className="p-8 text-slate-400 font-bold uppercase tracking-widest animate-pulse text-center">Memuat pesan izin...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">PESAN IZIN MEMBER</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic text-blue-400/80">Pantau seluruh pemberitahuan ketidakhadiran anggota dari semua program.</p>
                </div>

                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atau alasan..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-6 text-white text-sm font-bold w-full md:w-80 outline-none focus:border-blue-500 transition-all shadow-xl"
                    />
                </div>
            </div>

            {filteredRequests.length === 0 ? (
                <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-[3rem] p-20 text-center">
                    <Mail className="mx-auto text-slate-800 mb-6 opacity-20" size={80} />
                    <p className="text-slate-600 font-black text-xl uppercase tracking-[0.2em] italic text-slate-500/50">Tidak ada pesan izin ditemukan.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredRequests.map((req) => (
                        <div key={req.id} className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-2xl hover:border-slate-700 transition-all flex flex-col lg:flex-row gap-8 items-start lg:items-center relative overflow-hidden group">
                            {/* Status Indicator Bar */}
                            <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-600 shadow-[0_0_15px_rgba(37,99,235,0.4)]"></div>

                            {/* Member Info */}
                            <div className="flex items-center gap-5 min-w-[280px]">
                                <div className="relative">
                                    <div className="w-16 h-16 rounded-2xl bg-slate-950 border-2 border-slate-800 overflow-hidden shadow-xl flex items-center justify-center">
                                        {req.member?.avatar_url ? (
                                            <img src={req.member.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <User size={32} className="text-slate-800" />
                                        )}
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-600 rounded-lg flex items-center justify-center text-white border-2 border-slate-900 shadow-lg">
                                        <MessageSquare size={12} />
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-white font-black text-lg tracking-tight uppercase leading-none">{req.member?.full_name}</h3>
                                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest mt-1.5 italic underline decoration-blue-500/30 underline-offset-4">
                                        {req.member?.program_pilihan || 'Reguler Member'}
                                    </p>
                                </div>
                            </div>

                            {/* Separator / Decoration Line (Desktop) */}
                            <div className="hidden lg:block w-px h-12 bg-slate-800"></div>

                            {/* Date & Reason */}
                            <div className="flex-1 space-y-4">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-950/80 rounded-full border border-slate-800">
                                    <Calendar size={14} className="text-blue-400" />
                                    <span className="text-[10px] font-black text-white uppercase tracking-widest italic">
                                        Izin Tanggal: {new Date(req.leave_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-slate-300 font-bold text-base leading-relaxed italic">
                                        &quot;{req.reason}&quot;
                                    </p>
                                    <div className="flex items-center gap-4 pt-1">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                                            <Clock size={12} />
                                            Diterima: {new Date(req.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1`}>
                                            <CheckCircle2 size={10} />
                                            Sudah Dibaca
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex lg:flex-col gap-3 w-full lg:w-fit pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                                <button
                                    onClick={() => handleDelete(req.id)}
                                    disabled={deleting}
                                    className="flex-1 lg:w-14 lg:h-14 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all shadow-lg active:scale-95 group/btn border border-red-500/20 hover:border-red-500"
                                    title="Bersihkan dari Database"
                                >
                                    <Trash2 size={24} className="group-hover/btn:rotate-12 transition-transform" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-blue-600/5 border border-blue-600/20 rounded-[2rem] p-8 flex items-start gap-4">
                <AlertCircle className="text-blue-500 shrink-0 mt-1" size={24} />
                <div>
                    <h4 className="text-blue-400 font-black text-sm uppercase tracking-widest">Informasi Kepala Pelatih</h4>
                    <p className="text-slate-400 text-xs font-medium mt-1 leading-relaxed">
                        Anda dapat memantau seluruh izin dari anggota di semua program. Menghapus pesan di sini akan menghapus data dari database permanen. Gunakan data ini untuk koordinasi dengan pelatih program masing-masing.
                    </p>
                </div>
            </div>
        </div>
    )
}
