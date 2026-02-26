'use client'
import { Waves, Trophy, Users, Newspaper, Layout } from 'lucide-react'
import Link from 'next/link'

const iconMap = {
    Waves,
    Trophy,
    Users,
    Newspaper,
    Layout
}

export default function CategorySection({ categories = [] }) {
    if (!categories || categories.length === 0) return null

    // Filter out hero_intro as it usually has its own section
    const displayCategories = categories.filter(cat => cat.slug !== 'hero_intro')

    return (
        <section id="info-center" className="py-24 px-4 sm:px-6 lg:px-8 bg-blue-50/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-100/50 blur-3xl rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-100/50 blur-3xl rounded-full translate-y-1/2 -translate-x-1/2"></div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-20 space-y-4">
                    <h2 className="font-display text-2xl md:text-3xl font-bold tracking-tight text-slate-900 tracking-tighter italic">Pusat Informasi & <span className="text-blue-600">Konten</span></h2>
                    <p className="text-slate-500 font-display italic text-lg max-w-2xl mx-auto leading-relaxed">Pilih kategori di bawah ini untuk melihat jadwal, berita terbaru, medali prestasi, dan profil tim pelatih kami.</p>
                    <div className="w-24 h-1.5 bg-gradient-to-r from-blue-600 to-cyan-400 mx-auto rounded-full shadow-sm"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {displayCategories.map((cat, idx) => {
                        const Icon = iconMap[cat.icon] || Layout

                        // Dynamic colors based on index for variety
                        const colors = [
                            { bg: 'bg-blue-50', text: 'text-blue-600', shadow: 'hover:shadow-blue-500/10', iconBg: 'group-hover:bg-blue-600', arrowBg: 'bg-blue-600' },
                            { bg: 'bg-cyan-50', text: 'text-cyan-600', shadow: 'hover:shadow-cyan-500/10', iconBg: 'group-hover:bg-cyan-600', arrowBg: 'bg-cyan-600' },
                            { bg: 'bg-purple-50', text: 'text-purple-600', shadow: 'hover:shadow-purple-500/10', iconBg: 'group-hover:bg-purple-600', arrowBg: 'bg-purple-600' }
                        ]
                        const color = colors[idx % colors.length]

                        return (
                            <Link
                                key={cat.id}
                                href={`/content?category=${cat.slug}`}
                                className={`group relative bg-white rounded-[3rem] p-10 border border-slate-200/60 shadow-xl shadow-slate-200/50 ${color.shadow} transition-all duration-500 hover:-translate-y-4 active:animate-bounce-soft flex flex-col`}
                            >
                                <div className="mb-8 flex justify-between items-start">
                                    <div className={`w-14 h-14 rounded-2xl ${color.bg} ${color.text} flex items-center justify-center ${color.iconBg} group-hover:text-white transition-all duration-500 shadow-sm`}>
                                        <Icon className="w-7 h-7" />
                                    </div>
                                    <span className={`text-[10px] font-black tracking-widest uppercase ${color.text} ${color.bg} px-3 py-1 rounded-full`}>
                                        {idx === 0 ? 'Explore' : idx === 1 ? 'Certified' : 'Latest'}
                                    </span>
                                </div>
                                <h3 className="text-xl font-bold mb-4 tracking-tight text-slate-900 tracking-tight leading-tight">{cat.name}</h3>
                                <p className="text-slate-500 text-sm leading-relaxed mb-12 flex-grow">
                                    {cat.description || `Lihat semua konten dalam kategori ${cat.name}.`}
                                </p>
                                <div className={`absolute bottom-10 right-10 w-12 h-12 rounded-full ${color.arrowBg} text-white flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            </div>
        </section>
    )
}
