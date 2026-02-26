
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { BarChart3 } from 'lucide-react'
import Link from 'next/link'
import AddEditContentModal from './modals/AddEditContentModal'
import CategoryManagementModal from './modals/CategoryManagementModal'

export default function AdminContentTable() {
    const [contents, setContents] = useState([])
    const [loading, setLoading] = useState(true)
    const [categoryFilter, setCategoryFilter] = useState('program')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false)
    const [editingContent, setEditingContent] = useState(null)

    const [categories, setCategories] = useState([
        { id: 'program', label: 'Program' },
        { id: 'achievement', label: 'Prestasi Anggota' },
        { id: 'team', label: 'Team Pelatih' },
        { id: 'news', label: 'Berita / Info' }
    ])

    async function fetchCategories() {
        try {
            const { data, error } = await supabase
                .from('content_categories')
                .select('*')
                .order('order_index', { ascending: true })

            if (error) {
                // If table doesn't exist yet, it's fine, we use default hardcoded ones
                console.warn('Categories table not found or error, using defaults:', error.message)
                return
            }

            if (data && data.length > 0) {
                const dynamicCategories = data.map(cat => ({ id: cat.slug, label: cat.name }))
                setCategories(dynamicCategories)
            }
        } catch (err) {
            console.error('Error fetching categories:', err)
        }
    }

    async function fetchContents() {
        setLoading(true)
        try {
            let query = supabase.from('landing_contents').select('*').order('order_index', { ascending: true })

            if (categoryFilter !== 'all') {
                query = query.eq('category', categoryFilter)
            }

            const { data, error } = await query
            if (error) throw error
            setContents(data || [])
        } catch (err) {
            console.error('Error fetching contents:', err)
            alert('Gagal memuat konten')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCategories()
    }, [])

    useEffect(() => {
        fetchContents()
    }, [categoryFilter])

    const handleDelete = async (id, title) => {
        if (!confirm(`Hapus konten "${title}"?`)) return
        try {
            const { error } = await supabase.from('landing_contents').delete().eq('id', id)
            if (error) throw error
            fetchContents()
        } catch (err) {
            alert('Gagal menghapus: ' + err.message)
        }
    }

    const openEditModal = (item) => {
        setEditingContent(item)
        setIsModalOpen(true)
    }

    const openAddModal = () => {
        setEditingContent(null)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3 bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700/50">
                    <span className="pl-3 text-xs font-black uppercase tracking-widest text-slate-500">Kategori:</span>
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="bg-slate-900 border-none text-blue-400 text-sm font-bold py-2.5 px-4 pr-10 rounded-xl focus:ring-2 focus:ring-blue-500/20 cursor-pointer appearance-none shadow-inner"
                        style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%233B82F6\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\'%3E%3C/path%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.25rem' }}
                    >
                        {categories.map(cat => (
                            <option key={cat.id} value={cat.id} className="bg-slate-900 text-white font-medium py-2">
                                {cat.label}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="flex items-center gap-3">
                    <Link
                        href="/admin/contents/slides"
                        className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <BarChart3 size={18} className="rotate-90" />
                        Kelola Slide Hero
                    </Link>
                    <button
                        onClick={() => setIsCategoryModalOpen(true)}
                        className="px-6 py-2.5 rounded-xl bg-slate-800 text-slate-300 font-bold hover:bg-slate-700 transition-all border border-slate-700 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        Kelola Kategori
                    </button>
                    <button
                        onClick={openAddModal}
                        className="px-6 py-2.5 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95 flex items-center justify-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" /></svg>
                        Tambah Konten
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 rounded-2xl border border-slate-700 overflow-hidden shadow-2xl animate-slideIn">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-700/50 bg-slate-900/30">
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Kategori</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Judul & Cuplikan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Urutan</th>
                                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center">
                                        <div className="inline-block w-8 h-8 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin"></div>
                                        <p className="mt-2 text-slate-500 font-medium">Memuat data...</p>
                                    </td>
                                </tr>
                            ) : contents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-medium">
                                        Data tidak ditemukan di kategori ini.
                                    </td>
                                </tr>
                            ) : contents.map(item => (
                                <tr key={item.id} className="hover:bg-slate-700/30 transition-all group">
                                    <td className="px-6 py-4">
                                        <span className="px-2.5 py-1 rounded-md bg-slate-700 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-slate-600/50">
                                            {categories.find(c => c.id === item.category)?.label || item.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            {item.image_url && (
                                                <div className="w-12 h-12 rounded-lg bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0">
                                                    <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="max-w-xs md:max-w-md">
                                                <p className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-1">{item.title}</p>
                                                <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">{item.content || '-'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border ${item.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-slate-700/50 text-slate-500 border-slate-700'}`}>
                                            {item.is_active ? 'Aktif' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-slate-300">
                                        #{item.order_index}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="p-2 rounded-lg bg-slate-700 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                                title="Edit Konten"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id, item.title)}
                                                className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-red-600 hover:text-white transition-all shadow-sm"
                                                title="Hapus Konten"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEditContentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                content={editingContent}
                onSuccess={fetchContents}
                categories={categories}
            />

            <CategoryManagementModal
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                onSuccess={fetchCategories}
            />
        </div>
    )
}
