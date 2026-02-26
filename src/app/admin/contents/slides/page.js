'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Image as ImageIcon,
    Plus,
    Trash2,
    Download,
    AlertCircle,
    CheckCircle2,
    ArrowLeft,
    Monitor,
    Smartphone,
    Layers,
    Info
} from 'lucide-react'
import Link from 'next/link'

export default function AdminSlidesPage() {
    const [slides, setSlides] = useState([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [message, setMessage] = useState({ type: '', text: '' })

    useEffect(() => {
        fetchSlides()
    }, [])

    const fetchSlides = async () => {
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('order_index', { ascending: true })

        if (!error) setSlides(data)
        setLoading(false)
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        if (slides.length >= 7) {
            setMessage({ type: 'error', text: 'Maksimal 7 slide diperbolehkan untuk menjaga kecepatan website.' })
            return
        }

        setUploading(true)
        setMessage({ type: '', text: '' })

        try {
            // 1. Upload to Storage
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `hero-slides/${fileName}`

            const { error: uploadError } = await supabase.storage
                .from('site-assets')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            const { data: { publicUrl } } = supabase.storage
                .from('site-assets')
                .getPublicUrl(filePath)

            // 2. Save to Database
            const { error: dbError } = await supabase
                .from('hero_slides')
                .insert({
                    image_url: publicUrl,
                    order_index: slides.length
                })

            if (dbError) throw dbError

            setMessage({ type: 'success', text: 'Slide berhasil ditambahkan! ✨' })
            fetchSlides()
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal upload: ' + error.message })
        } finally {
            setUploading(false)
        }
    }

    const handleDelete = async (slide) => {
        if (!confirm('Hapus slide ini secara permanen?')) return

        try {
            // 1. Delete from Storage (Extract path from URL)
            const urlParts = slide.image_url.split('/')
            const fileName = urlParts[urlParts.length - 1]
            await supabase.storage
                .from('site-assets')
                .remove([`hero-slides/${fileName}`])

            // 2. Delete from DB
            const { error } = await supabase
                .from('hero_slides')
                .delete()
                .eq('id', slide.id)

            if (error) throw error
            fetchSlides()
        } catch (error) {
            alert('Gagal menghapus: ' + error.message)
        }
    }

    const toggleActive = async (slide) => {
        try {
            const { error } = await supabase
                .from('hero_slides')
                .update({ is_active: !slide.is_active })
                .eq('id', slide.id)

            if (error) throw error
            fetchSlides()
        } catch (error) {
            alert('Gagal memperbarui status: ' + error.message)
        }
    }

    if (loading) return <div className="p-8 text-slate-400 font-bold uppercase animate-pulse tracking-widest text-center mt-20">Memuat slide...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link href="/admin/contents" className="text-blue-500 flex items-center gap-2 text-xs font-black uppercase tracking-widest mb-4 hover:gap-3 transition-all">
                        <ArrowLeft size={14} /> Kembali ke Postingan
                    </Link>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase">Manajemen Slide Hero</h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Atur gambar promosi utama yang muncul di halaman depan website.</p>
                </div>

                <div className="flex items-center gap-4">
                    <label className={`
                        relative group flex items-center gap-3 px-8 py-4 bg-blue-600 rounded-2xl text-white font-black text-sm uppercase tracking-widest cursor-pointer
                        hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 active:scale-95
                        ${uploading || slides.length >= 7 ? 'opacity-50 grayscale pointer-events-none' : ''}
                    `}>
                        <Plus size={20} />
                        {uploading ? 'MEMPROSES...' : 'TAMBAH SLIDE'}
                        <input type="file" accept="image/*" onChange={handleUpload} className="hidden" />
                    </label>
                </div>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slideIn ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
                    <p className="font-bold text-xs tracking-tight">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Visual List Section */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                            <Layers size={18} className="text-blue-500" />
                            Daftar Slide ({slides.length}/7)
                        </h3>
                    </div>

                    {slides.length === 0 ? (
                        <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-[3rem] p-24 text-center">
                            <ImageIcon className="mx-auto text-slate-700 mb-6 opacity-20" size={80} />
                            <p className="text-slate-500 font-bold italic uppercase tracking-widest text-sm">Belum ada slide gambar.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {slides.map((slide, idx) => (
                                <div key={slide.id} className="bg-slate-800/50 backdrop-blur-md rounded-[2.5rem] border border-slate-700 overflow-hidden flex flex-col md:flex-row shadow-2xl hover:border-slate-600 transition-all group">
                                    <div className="md:w-72 h-44 shrink-0 relative overflow-hidden">
                                        <img src={slide.image_url} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute top-4 left-4 w-10 h-10 bg-slate-900/80 backdrop-blur-md rounded-xl flex items-center justify-center text-white font-black text-sm border border-white/20">
                                            {idx + 1}
                                        </div>
                                    </div>

                                    <div className="flex-1 p-8 flex flex-col justify-between">
                                        <div className="flex justify-between items-start">
                                            <div className="space-y-1">
                                                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">Asset URL</p>
                                                <p className="text-slate-300 font-bold text-xs truncate max-w-[300px] font-mono">{slide.image_url}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => toggleActive(slide)}
                                                    className={`px-3 py-1.5 rounded-full text-[8px] font-black uppercase tracking-widest border transition-all ${slide.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                                                        }`}
                                                >
                                                    {slide.is_active ? 'AKTIF' : 'NON-AKTIF'}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-slate-700/50 mt-6">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Monitor size={14} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">Perfect on Web</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-500">
                                                    <Smartphone size={14} />
                                                    <span className="text-[9px] font-bold uppercase tracking-tighter">Optimized on HP</span>
                                                </div>
                                            </div>

                                            <div className="flex gap-3">
                                                <a href={slide.image_url} target="_blank" download className="p-3 bg-slate-700/50 text-slate-400 rounded-xl hover:bg-slate-700 hover:text-white transition-all">
                                                    <Download size={18} />
                                                </a>
                                                <button onClick={() => handleDelete(slide)} className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all">
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Optimization Tips Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-800/80 border border-slate-700/50 rounded-[2rem] p-8 backdrop-blur-md shadow-2xl sticky top-24">
                        <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-3">
                            <Info size={18} className="text-blue-500" />
                            Tip Optimasi Gambar
                        </h3>

                        <div className="space-y-8">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-blue-600/10 rounded-xl flex items-center justify-center shrink-0 border border-blue-500/20">
                                    <ImageIcon size={20} className="text-blue-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-blue-400 font-black text-[10px] uppercase tracking-widest italic">Dimensi & Rasio</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                                        Gunakan gambar berukuran <strong>1600 x 800 pixel</strong>. Ini memastikan gambar tidak pecah di monitor besar tapi juga tidak terlalu berat untuk HP.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-amber-600/10 rounded-xl flex items-center justify-center shrink-0 border border-amber-500/20">
                                    <Layers size={20} className="text-amber-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-amber-400 font-black text-[10px] uppercase tracking-widest italic">Komposisi Tengah</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                                        Pastikan <strong>objek utama berada di tengah</strong>. Di perangkat mobile, bagian samping gambar mungkin akan terpotong (cropped) untuk mengisi layar.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-4">
                                <div className="w-10 h-10 bg-emerald-600/10 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                                    <Download size={20} className="text-emerald-400" />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-emerald-400 font-black text-[10px] uppercase tracking-widest italic">Kecilkan Ukuran File</h4>
                                    <p className="text-slate-400 text-xs font-medium leading-relaxed italic">
                                        Usahakan file gambar di bawah <strong>500 KB</strong>. Gunakan format <strong>WebP</strong> jika memungkinkan, atau JPG dengan kualitas 80%.
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-700 border-dashed">
                                <p className="text-[9px] text-slate-500 font-bold uppercase leading-relaxed text-center">
                                    Tip: Gunakan website gratis seperti <a href="https://tinypng.com" target="_blank" className="text-blue-500 underline">TinyPNG</a> atau <a href="https://squoosh.app" target="_blank" className="text-blue-500 underline">Squoosh.app</a> untuk mengecilkan ukuran gambar sebelum diunggah.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
