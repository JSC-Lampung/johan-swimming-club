
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { X, Plus, Trash2, Edit2, Save, MoveUp, MoveDown } from 'lucide-react'

export default function CategoryManagementModal({ isOpen, onClose, onSuccess }) {
    const [categories, setCategories] = useState([])
    const [loading, setLoading] = useState(true)
    const [editingId, setEditingId] = useState(null)
    const [formData, setFormData] = useState({ name: '', icon: 'Layout', order_index: 0 })
    const [isAdding, setIsAdding] = useState(false)

    const iconOptions = ['Waves', 'Trophy', 'Users', 'Newspaper', 'Layout', 'Star', 'Calendar', 'Info']

    async function fetchCategories() {
        setLoading(true)
        const { data, error } = await supabase
            .from('content_categories')
            .select('*')
            .order('order_index', { ascending: true })
        if (!error) setCategories(data || [])
        setLoading(false)
    }

    useEffect(() => {
        if (isOpen) {
            fetchCategories()
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen])

    const handleAdd = async (e) => {
        e.preventDefault()
        const slug = formData.name.toLowerCase().replace(/[^a-z0-9]/g, '_')
        const { error } = await supabase.from('content_categories').insert([{ ...formData, slug }])
        if (error) alert('Gagal menambah kategori: ' + error.message)
        else {
            setFormData({ name: '', icon: 'Layout', order_index: categories.length })
            setIsAdding(false)
            fetchCategories()
            onSuccess()
        }
    }

    const handleUpdate = async (id) => {
        const cat = categories.find(c => c.id === id)
        const { error } = await supabase.from('content_categories').update({
            name: cat.name,
            icon: cat.icon,
            order_index: cat.order_index
        }).eq('id', id)

        if (error) alert('Gagal update: ' + error.message)
        else {
            setEditingId(null)
            fetchCategories()
            onSuccess()
        }
    }

    const handleDelete = async (id, name) => {
        if (!confirm(`Hapus kategori "${name}"? Konten di kategori ini mungkin tidak akan muncul di landing page.`)) return
        const { error } = await supabase.from('content_categories').delete().eq('id', id)
        if (error) alert('Gagal hapus: ' + error.message)
        else {
            fetchCategories()
            onSuccess()
        }
    }

    const moveCategory = async (id, direction) => {
        const index = categories.findIndex(c => c.id === id)
        if ((direction === -1 && index === 0) || (direction === 1 && index === categories.length - 1)) return

        const newCategories = [...categories]
        const temp = newCategories[index].order_index
        newCategories[index].order_index = newCategories[index + direction].order_index
        newCategories[index + direction].order_index = temp

        const updates = [
            supabase.from('content_categories').update({ order_index: newCategories[index].order_index }).eq('id', newCategories[index].id),
            supabase.from('content_categories').update({ order_index: newCategories[index + direction].order_index }).eq('id', newCategories[index + direction].id)
        ]

        await Promise.all(updates)
        fetchCategories()
        onSuccess()
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-[2rem] w-full max-w-2xl p-8 shadow-2xl animate-fadeIn overflow-hidden flex flex-col max-h-[85vh]">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight uppercase">Kelola Kategori</h3>
                        <p className="text-slate-400 text-sm italic">Atur kategori yang akan muncul di website.</p>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-slate-700 text-slate-400 transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 -mr-2 space-y-4">
                    {loading ? (
                        <div className="py-20 text-center text-slate-500 italic">Memuat kategori...</div>
                    ) : (
                        categories.map((cat, idx) => (
                            <div key={cat.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-4 flex items-center gap-4 group">
                                <div className="flex flex-col gap-1">
                                    <button onClick={() => moveCategory(cat.id, -1)} disabled={idx === 0} className="p-1 hover:text-blue-400 disabled:opacity-20 transition-colors">
                                        <MoveUp className="w-4 h-4" />
                                    </button>
                                    <button onClick={() => moveCategory(cat.id, 1)} disabled={idx === categories.length - 1} className="p-1 hover:text-blue-400 disabled:opacity-20 transition-colors">
                                        <MoveDown className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center text-blue-400 font-bold border border-slate-700">
                                    {cat.icon}
                                </div>

                                <div className="flex-1">
                                    {editingId === cat.id ? (
                                        <input
                                            type="text"
                                            value={cat.name}
                                            onChange={(e) => {
                                                const updated = categories.map(c => c.id === cat.id ? { ...c, name: e.target.value } : c)
                                                setCategories(updated)
                                            }}
                                            className="w-full bg-slate-800 border border-blue-500 rounded-lg px-3 py-1.5 text-white outline-none"
                                            autoFocus
                                        />
                                    ) : (
                                        <div>
                                            <p className="font-bold text-white text-lg">{cat.name}</p>
                                            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{cat.slug}</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2">
                                    {editingId === cat.id ? (
                                        <button onClick={() => handleUpdate(cat.id)} className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                            <Save className="w-4 h-4" />
                                        </button>
                                    ) : (
                                        <button onClick={() => setEditingId(cat.id)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-700">
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                    )}
                                    <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-red-400 border border-slate-700">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}

                    {isAdding ? (
                        <form onSubmit={handleAdd} className="bg-blue-600/10 border border-blue-500/30 rounded-2xl p-6 space-y-4 animate-slideIn">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">Nama Kategori</label>
                                    <input
                                        required
                                        type="text"
                                        placeholder="Misal: Event"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500"
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-1 block">Icon</label>
                                    <select
                                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-2 text-white outline-none focus:border-blue-500 appearance-none"
                                        value={formData.icon}
                                        onChange={e => setFormData({ ...formData, icon: e.target.value })}
                                    >
                                        {iconOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-xl transition-all shadow-lg shadow-blue-600/20">Simpan</button>
                                <button type="button" onClick={() => setIsAdding(false)} className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 rounded-xl transition-all">Batal</button>
                            </div>
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAdding(true)}
                            className="w-full py-4 border-2 border-dashed border-slate-700 rounded-2xl text-slate-500 font-bold hover:border-blue-500 hover:text-blue-500 transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Tambah Kategori Baru
                        </button>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-slate-700 flex justify-end">
                    <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-slate-700 text-white font-bold hover:bg-slate-600 transition-all">
                        Selesai
                    </button>
                </div>
            </div>
        </div>
    )
}
