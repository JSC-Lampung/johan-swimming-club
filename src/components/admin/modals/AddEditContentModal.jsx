
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from '../ImageUpload'

export default function AddEditContentModal({ isOpen, onClose, content, onSuccess, categories = [] }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        category: 'program',
        title: '',
        content: '',
        image_url: '',
        order_index: 0,
        is_active: true
    })

    // Filter out 'all' category for the select option
    const activeCategories = categories.filter(c => c.id !== 'all')

    useEffect(() => {
        if (content) {
            setFormData({
                category: content.category || 'program',
                title: content.title || '',
                content: content.content || '',
                image_url: content.image_url || '',
                order_index: content.order_index || 0,
                is_active: content.is_active ?? true
            })
        } else {
            setFormData({
                category: activeCategories[0]?.id || 'program',
                title: '',
                content: '',
                image_url: '',
                order_index: 0,
                is_active: true
            })
        }
    }, [content, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const payload = {
                ...formData,
                updated_at: new Date().toISOString()
            }

            if (content?.id) {
                const { error } = await supabase
                    .from('landing_contents')
                    .update(payload)
                    .eq('id', content.id)
                if (error) throw error
            } else {
                const { error } = await supabase
                    .from('landing_contents')
                    .insert([payload])
                if (error) throw error
            }

            alert('Konten berhasil disimpan!')
            onSuccess()
            onClose()
        } catch (err) {
            alert('Gagal menyimpan konten: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-2xl p-8 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] custom-scrollbar">
                <h3 className="text-2xl font-bold text-white mb-6">
                    {content ? 'Edit Konten' : 'Tambah Konten Baru'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Kategori</label>
                            <select
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            >
                                {activeCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Urutan Tampil (Index)</label>
                            <input
                                type="number"
                                value={isNaN(formData.order_index) ? 0 : formData.order_index}
                                onChange={e => setFormData({ ...formData, order_index: e.target.value === '' ? '' : parseInt(e.target.value) || 0 })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Judul Konten</label>
                        <input
                            type="text"
                            required
                            value={formData.title}
                            onChange={e => setFormData({ ...formData, title: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Contoh: Kelas Renang Pagi"
                        />
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Deskripsi / Isi Konten</label>
                        <textarea
                            required
                            value={formData.content}
                            onChange={e => setFormData({ ...formData, content: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 resize-none"
                            placeholder="Tuliskan deskripsi lengkap di sini..."
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-4 uppercase font-black tracking-widest text-[10px] text-blue-400">Gambar Konten</label>
                        <ImageUpload
                            value={formData.image_url}
                            onChange={url => setFormData({ ...formData, image_url: url })}
                            folder="contents"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="is_active"
                            checked={formData.is_active}
                            onChange={e => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-5 h-5 rounded bg-slate-700 border-slate-600 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="is_active" className="text-slate-300 text-sm">Aktifkan konten ini agar muncul di website</label>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-3 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70"
                        >
                            {loading ? 'Menyimpan...' : 'Simpan Konten'}
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition-all"
                        >
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
