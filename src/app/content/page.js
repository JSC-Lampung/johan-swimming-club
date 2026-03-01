import { supabaseAdmin as supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import Link from 'next/link'
import Image from 'next/image'
import ShareButton from '@/components/ShareButton'

export const revalidate = 3600 // Revalidate every hour

export default async function ContentListPage({ searchParams }) {
    const { category } = await searchParams

    let queryBuilder = supabase.from('landing_contents').select('*').eq('is_active', true).order('order_index', { ascending: true })
    if (category) {
        queryBuilder = queryBuilder.eq('category', category)
    }

    const { data: items, error } = await queryBuilder

    if (error) {
        console.error('Supabase Error:', error.message)
    }
    const displayItems = items || []

    const { data: categories } = await supabase.from('content_categories').select('*')
    const currentCategory = categories?.find(c => c.slug === category)
    const title = currentCategory ? currentCategory.name : 'JSC Info Center'

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <Navbar />
            <main className="flex-grow pt-32 pb-24 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8 animate-fadeIn">
                        <div className="space-y-6">
                            <Link href="/" className="inline-flex items-center gap-2 text-blue-600 font-bold text-xs uppercase tracking-widest hover:translate-x-[-4px] transition-transform">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                                Kembali ke Beranda
                            </Link>
                            <h1 className="text-2xl md:text-4xl font-display font-black text-slate-900 tracking-tighter leading-none">
                                {title}
                            </h1>
                            <p className="text-lg text-slate-500 max-w-2xl leading-relaxed">
                                Temukan informasi eksklusif, update terbaru, dan rincian lengkap mengenai {title.toLowerCase()} dari <span className="text-blue-600 font-bold">Johan Swimming Club</span>.
                            </p>
                            <div className="w-24 h-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full"></div>
                        </div>
                    </div>

                    {displayItems.length === 0 ? (
                        <div className="py-24 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200 animate-pulse">
                            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                            </div>
                            <p className="text-slate-400 text-lg font-medium italic">Konten untuk kategori ini belum tersedia.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {displayItems.map((item, idx) => (
                                <div
                                    key={item.id}
                                    className="group relative bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-xl shadow-slate-200/50 hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-500 hover:-translate-y-3 flex flex-col"
                                >
                                    {/* Link covers the entire card area */}
                                    <Link href={`/content/${item.id}`} className="absolute inset-0 z-0" aria-label={`View ${item.title}`} />

                                    <div className="h-64 relative overflow-hidden bg-slate-50 pointer-events-none">
                                        {item.image_url ? (
                                            <Image
                                                src={item.image_url}
                                                alt={item.title}
                                                fill
                                                className="object-cover group-hover:scale-110 transition-transform duration-1000"
                                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                                <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                            </div>
                                        )}
                                        <div className="absolute top-6 left-6">
                                            <span className="px-4 py-1.5 rounded-full bg-white/95 backdrop-blur-md text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-lg">
                                                Post #{idx + 1}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-10 flex-grow flex flex-col relative z-10 pointer-events-none">
                                        <div className="flex items-center gap-4 mb-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru Saja'}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                                {item.view_count || 0} Views
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight mb-4 tracking-tight">
                                            {item.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 flex-grow italic mb-8">
                                            {item.content}
                                        </p>
                                        <div className="flex items-center justify-between mt-auto">
                                            <div className="flex items-center text-blue-600 text-[10px] font-black uppercase tracking-[0.2em] gap-3 group-hover:gap-5 transition-all">
                                                Baca Selengkapnya
                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center group-hover:bg-blue-600 text-blue-700 group-hover:text-white transition-all shadow-sm">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                                </div>
                                            </div>
                                            <div className="pointer-events-auto relative z-20">
                                                <ShareButton
                                                    title={item.title}
                                                    text={item.content?.substring(0, 50)}
                                                    url={`${typeof window !== 'undefined' ? window.location.origin : ''}/content/${item.id}`}
                                                    className="!bg-transparent !border-none !p-2 hover:!bg-blue-50"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </div>
    )
}
