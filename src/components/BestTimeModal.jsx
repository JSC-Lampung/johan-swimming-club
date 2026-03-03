'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    X,
    Trophy,
    Calendar,
    Target,
    Zap,
    Clock,
    AlertCircle,
    CheckCircle2,
    Users,
    Activity,
    Filter
} from 'lucide-react'
import { PROGRAMS } from '@/lib/constants'

export default function BestTimeModal({ isOpen, onClose, onSuccess, initialData = null, currentUser, members = [] }) {
    const [submitting, setSubmitting] = useState(false)
    const [error, setError] = useState('')
    const [formData, setFormData] = useState({
        member_id: '',
        event_name: '',
        event_date: new Date().toISOString().split('T')[0],
        category: 'Latihan',
        stroke: 'Bebas',
        distance: 50,
        record_time: '',
        notes: ''
    })
    const [selectedProgram, setSelectedProgram] = useState('All')

    useEffect(() => {
        if (initialData) {
            setFormData(initialData)
        } else {
            // Reset form for new entry
            setFormData({
                member_id: currentUser?.role === 'member' ? currentUser.id : '',
                event_name: '',
                event_date: new Date().toISOString().split('T')[0],
                category: 'Latihan',
                stroke: 'Bebas',
                distance: 50,
                record_time: '',
                notes: ''
            })
        }
        setError('')
        setSelectedProgram('All')
    }, [initialData, isOpen, currentUser])

    const validateTime = (time) => {
        // Format: MM:SS.hh
        const regex = /^([0-5][0-9]):([0-5][0-9])\.([0-9][0-9])$/
        return regex.test(time)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setSubmitting(true)
        setError('')

        if (!validateTime(formData.record_time)) {
            setError('Format waktu harus MM:SS.hh (Contoh: 01:25.45)')
            setSubmitting(false)
            return
        }

        try {
            // 1. Check for duplicates (Unique constraint check)
            const { data: existing, error: fetchError } = await supabase
                .from('member_best_times')
                .select('id')
                .eq('member_id', formData.member_id)
                .eq('event_name', formData.event_name)
                .eq('event_date', formData.event_date)
                .eq('stroke', formData.stroke)
                .eq('distance', formData.distance)
                .maybeSingle()

            if (existing && (!initialData || existing.id !== initialData.id)) {
                setError('Data ini sudah pernah diinput sebelumnya (Double Data Prevention)')
                setSubmitting(false)
                return
            }

            // 2. Insert or Update
            const payload = {
                ...formData,
                created_by: currentUser.id
            }

            const { error: submitError } = initialData
                ? await supabase.from('member_best_times').update(payload).eq('id', initialData.id)
                : await supabase.from('member_best_times').insert(payload)

            if (submitError) throw submitError

            onSuccess()
            onClose()
        } catch (err) {
            setError(err.message)
        } finally {
            setSubmitting(false)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-fadeIn">
            <div className="bg-slate-800 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-slideUp">
                {/* Header */}
                <div className="p-6 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-blue-600/10 to-transparent">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase tracking-tight">
                                {initialData ? 'UBAH CATATAN WAKTU' : 'TAMBAH CATATAN WAKTU'}
                            </h3>
                            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest italic">Input data performa renang</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400 animate-shake">
                            <AlertCircle size={18} />
                            <p className="text-xs font-bold">{error}</p>
                        </div>
                    )}

                    {/* Member Selection (Only for Coach/Admin) */}
                    {currentUser?.role !== 'member' && !initialData && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Filter Program</label>
                                <div className="relative">
                                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select
                                        value={selectedProgram}
                                        onChange={e => {
                                            setSelectedProgram(e.target.value)
                                            setFormData({ ...formData, member_id: '' }) // Reset selected member when program changes
                                        }}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors appearance-none"
                                    >
                                        <option value="All" className="bg-slate-800">Semua Program</option>
                                        {PROGRAMS.map(p => (
                                            <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nama Atlet</label>
                                <div className="relative">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                    <select
                                        required
                                        value={formData.member_id}
                                        onChange={e => setFormData({ ...formData, member_id: e.target.value })}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors appearance-none"
                                    >
                                        <option value="" disabled className="bg-slate-800 text-slate-500">Pilih Atlet...</option>
                                        {members.filter(m => selectedProgram === 'All' || m.program_pilihan === selectedProgram).length === 0 ? (
                                            <option value="" disabled className="bg-slate-800 text-red-400">Tidak ada atlet di program ini</option>
                                        ) : (
                                            members
                                                .filter(m => selectedProgram === 'All' || m.program_pilihan === selectedProgram)
                                                .map(m => (
                                                    <option key={m.id} value={m.id} className="bg-slate-800 text-white">{m.full_name}</option>
                                                ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Nama Event / Latihan</label>
                            <input
                                required
                                placeholder="Misal: Kejurda 2024"
                                value={formData.event_name}
                                onChange={e => setFormData({ ...formData, event_name: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Tanggal</label>
                            <input
                                type="date"
                                required
                                value={formData.event_date}
                                onChange={e => setFormData({ ...formData, event_date: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Kategori</label>
                        <div className="flex gap-2">
                            {['Latihan', 'Kejuaraan'].map((cat) => (
                                <button
                                    key={cat}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, category: cat })}
                                    className={`flex-1 py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all ${formData.category === cat
                                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                        : 'bg-slate-900/50 border border-slate-700 text-slate-500 hover:border-slate-500'
                                        }`}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Gaya Renang</label>
                            <select
                                value={formData.stroke}
                                onChange={e => setFormData({ ...formData, stroke: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                {['Bebas', 'Dada', 'Punggung', 'Kupu-kupu'].map(s => (
                                    <option key={s} value={s} className="bg-slate-800">{s}</option>
                                ))}
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Jarak (Meter)</label>
                            <select
                                value={formData.distance}
                                onChange={e => setFormData({ ...formData, distance: parseInt(e.target.value) })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors appearance-none"
                            >
                                {[50, 100, 200].map(d => (
                                    <option key={d} value={d} className="bg-slate-800">{d} Meter</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <div className="flex items-center justify-between px-1">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">Catatan Waktu</label>
                            <span className="text-[9px] font-bold text-blue-400 uppercase tracking-widest bg-blue-400/10 px-2 py-0.5 rounded-full">Format: MM:SS.hh</span>
                        </div>
                        <div className="relative">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                required
                                placeholder="00:28.45"
                                value={formData.record_time}
                                onChange={e => setFormData({ ...formData, record_time: e.target.value })}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white font-black text-lg outline-none focus:border-blue-500 transition-colors placeholder:text-slate-700"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1 italic text-slate-400 flex items-center gap-1.5 font-medium leading-relaxed italic border-t border-slate-700/50 pt-1">Catatan Tambahan (Opsional)</label>
                        <textarea
                            rows="2"
                            placeholder="Kondisi kolam, cuaca, dll..."
                            value={formData.notes}
                            onChange={e => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-medium text-sm outline-none focus:border-blue-500 transition-colors resize-none italic"
                        ></textarea>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        {submitting ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <>
                                <Zap size={20} />
                                {initialData ? 'SIMPAN PERUBAHAN' : 'SIMPAN CATATAN WAKTU'}
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    )
}
