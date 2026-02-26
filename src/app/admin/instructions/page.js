
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Send,
    MessageSquare,
    Users,
    Filter,
    Clock,
    CheckCircle2,
    Trash2,
    Plus,
    Layout,
    ChevronDown,
    X
} from 'lucide-react'

import { PROGRAMS } from '@/lib/constants'

export default function AdminInstructionsPage() {
    const [loading, setLoading] = useState(true)
    const [instructions, setInstructions] = useState([])
    const [title, setTitle] = useState('')
    const [content, setContent] = useState('')
    const [targetProgram, setTargetProgram] = useState('all')
    const [sending, setSending] = useState(false)
    const [showForm, setShowForm] = useState(false)

    useEffect(() => {
        fetchInstructions()
    }, [])

    const fetchInstructions = async () => {
        setLoading(true)
        try {
            const { data, error } = await supabase
                .from('admin_instructions')
                .select('*')
                .order('created_at', { ascending: false })

            if (error) {
                console.error('ADMIN_FETCH_ERROR:', {
                    message: error.message,
                    details: error.details,
                    hint: error.hint,
                    code: error.code
                })
                return
            }
            setInstructions(data || [])
        } catch (error) {
            console.error('ADMIN_FETCH_CRITICAL:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!title || !content) return alert('Judul dan isi instruksi wajib diisi!')

        setSending(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            const { error } = await supabase
                .from('admin_instructions')
                .insert([{
                    sender_id: user.id,
                    title,
                    content,
                    target_program: targetProgram === 'all' ? null : targetProgram
                }])

            if (error) throw error

            setTitle('')
            setContent('')
            setTargetProgram('all')
            setShowForm(false)
            fetchInstructions()
            alert('Instruksi berhasil dikirim ke pelatih!')
        } catch (error) {
            alert('Gagal mengirim instruksi: ' + error.message)
        } finally {
            setSending(false)
        }
    }

    const deleteInstruction = async (id) => {
        if (!confirm('Hapus instruksi ini?')) return
        try {
            const { error } = await supabase.from('admin_instructions').delete().eq('id', id)
            if (error) throw error
            setInstructions(instructions.filter(i => i.id !== id))
        } catch (error) {
            alert('Gagal menghapus: ' + error.message)
        }
    }

    const clearAllInstructions = async () => {
        if (!confirm('Hapus SEMUA riwayat instruksi? Tindakan ini tidak dapat dibatalkan.')) return
        try {
            const { error } = await supabase.from('admin_instructions').delete().neq('id', '00000000-0000-0000-0000-000000000000') // Efficient "delete all" hack
            if (error) throw error
            setInstructions([])
            alert('Semua riwayat berhasil dibersihkan.')
        } catch (error) {
            alert('Gagal membersihkan riwayat: ' + error.message)
        }
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header Area */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-2xl font-black text-white flex items-center gap-3">
                        <MessageSquare className="text-blue-500" />
                        Instruksi & Pesan Admin
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">
                        Kirim instruksi khusus ke pelatih berdasarkan program binaan.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    {instructions.length > 0 && (
                        <button
                            onClick={clearAllInstructions}
                            className="flex items-center gap-2 px-4 py-3 bg-red-500/10 hover:bg-red-500 border border-red-500/20 text-red-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all"
                        >
                            <Trash2 size={16} />
                            Hapus Riwayat
                        </button>
                    )}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                    >
                        {showForm ? <X size={16} /> : <Plus size={16} />}
                        {showForm ? 'Batal' : 'Buat Instruksi Baru'}
                    </button>
                </div>
            </div>

            {/* Form Section */}
            {showForm && (
                <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 shadow-2xl animate-slideDown">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Target Program</label>
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select
                                        value={targetProgram}
                                        onChange={(e) => setTargetProgram(e.target.value)}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white text-sm font-bold focus:outline-none focus:border-blue-500 appearance-none transition-all"
                                    >
                                        <option value="all">Semua Pelatih & Program</option>
                                        {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={16} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Judul Instruksi</label>
                                <input
                                    type="text"
                                    placeholder="Misal: Persiapan Lomba Akhir Bulan..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white text-sm font-bold focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Isi Pesan / Instruksi</label>
                            <textarea
                                rows="5"
                                placeholder="Tuliskan detail instruksi Anda di sini..."
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-2xl py-4 px-4 text-white text-sm font-medium focus:outline-none focus:border-blue-500 transition-all placeholder:text-slate-600 resize-none"
                            ></textarea>
                        </div>

                        <div className="flex justify-end">
                            <button
                                disabled={sending}
                                type="submit"
                                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:shadow-xl hover:shadow-blue-500/30 transition-all disabled:opacity-50 active:scale-95"
                            >
                                <Send size={18} />
                                {sending ? 'Mengirim...' : 'Kirim Instruksi Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* History Section */}
            <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Clock size={16} className="text-slate-500" />
                    <h2 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Riwayat Instruksi Terkirim</h2>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2].map(i => <div key={i} className="h-40 bg-slate-800/50 rounded-3xl animate-pulse border border-slate-700/50"></div>)}
                    </div>
                ) : instructions.length === 0 ? (
                    <div className="py-20 text-center bg-slate-800/20 rounded-3xl border border-dashed border-slate-700 text-slate-500 font-bold uppercase tracking-widest text-xs">Belum ada riwayat instruksi.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {instructions.map((inst) => (
                            <div key={inst.id} className="bg-slate-800/50 border border-slate-700 rounded-3xl p-6 hover:border-slate-500 transition-all group">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-widest border ${inst.target_program ? 'text-blue-400 border-blue-500/30 bg-blue-500/5' : 'text-purple-400 border-purple-500/30 bg-purple-500/5'}`}>
                                        {inst.target_program ? `Program: ${inst.target_program}` : 'Semua Program'}
                                    </div>
                                    <button
                                        onClick={() => deleteInstruction(inst.id)}
                                        className="text-slate-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                                <h3 className="text-white font-black text-sm mb-2 uppercase tracking-tight">{inst.title}</h3>
                                <p className="text-slate-400 text-xs font-medium leading-relaxed mb-4 line-clamp-3 italic">"{inst.content}"</p>
                                <div className="flex items-center gap-2 text-[8px] text-slate-500 font-black uppercase tracking-widest mt-auto">
                                    <Layout size={10} />
                                    {new Date(inst.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
