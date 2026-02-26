
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'

export default async function ContentDetailPage({ params }) {
    const { id } = await params
    const { data: item } = await supabase.from('landing_contents').select('*').eq('id', id).single()

    // Increment view count
    if (item) {
        await supabase.from('landing_contents')
            .update({ view_count: (item.view_count || 0) + 1 })
            .eq('id', id)
    }

    if (!item) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">Konten Tidak Ditemukan</h1>
                <Link href="/" className="text-blue-600 font-bold hover:underline">Kembali ke Beranda</Link>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <Navbar />
            <main className="flex-grow pt-32 pb-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <Link href={`/content?category=${item.category}`} className="inline-flex items-center gap-2 text-slate-500 hover:text-blue-600 font-bold mb-8 transition-colors group">
                        <svg className="w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                        Kembali ke Daftar
                    </Link>

                    <article className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-200 shadow-xl">
                        {item.image_url && (
                            <div className="w-full h-64 md:h-[450px] relative">
                                <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                <div className="absolute top-8 left-8">
                                    <span className="px-5 py-2 rounded-full bg-blue-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-lg">
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="p-8 md:p-16 space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-6 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Baru Saja'}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        {item.view_count || 0} Pembaca
                                    </div>
                                </div>
                                <h1 className="text-2xl md:text-4xl font-display font-extrabold text-slate-900 tracking-tighter leading-tight">
                                    {item.title}
                                </h1>
                                <div className="w-24 h-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"></div>
                            </div>

                            <div className="prose prose-slate prose-xl max-w-none text-slate-600 leading-relaxed whitespace-pre-wrap font-normal">
                                {item.content}
                            </div>

                            <div className="pt-10 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Diposting oleh</p>
                                        <p className="text-sm font-bold text-slate-900">Admin Johan Swimming</p>
                                    </div>
                                </div>
                                <Link href="#contact" className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-center">
                                    Daftar / Hubungi Kami
                                </Link>
                            </div>
                        </div>
                    </article>
                </div>
            </main>
            <Footer />
        </div>
    )
}
