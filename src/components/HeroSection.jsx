'use client'
import { useUI } from '@/context/UIContext'
import ActivityCarousel from './ActivityCarousel'
import Image from 'next/image'

export default function HeroSection({ clubSlogan, heroIntro }) {
    const { openMemberModal } = useUI()

    return (
        <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
                <div className="space-y-6 lg:col-span-5 animate-fadeIn">
                    <div className="space-y-2">
                        <p className="text-blue-600 font-bold uppercase tracking-[0.3em] text-[10px] md:text-xs">
                            {clubSlogan}
                        </p>
                        <h1 className="font-display text-2xl md:text-4xl font-extrabold leading-tight text-slate-900 tracking-tighter"
                            dangerouslySetInnerHTML={{ __html: heroIntro.title }}
                        />
                    </div>
                    <p className="text-lg md:text-xl text-slate-600 leading-relaxed max-w-lg">
                        {heroIntro.content}
                    </p>
                    <div className="flex flex-wrap gap-4 pt-2">
                        <button
                            onClick={() => openMemberModal('register')}
                            className="px-8 py-4 rounded-2xl bg-slate-900 text-white font-bold hover:bg-slate-800 transition-all shadow-xl hover:-translate-y-2 hover:animate-bounce-soft active:scale-95"
                        >
                            Mulai Sekarang
                        </button>
                        <div className="flex -space-x-3 items-center ml-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className={`w-10 h-10 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden relative`}>
                                    <Image
                                        src={`https://i.pravatar.cc/100?u=${i}`}
                                        alt={`Member Johan Swimming Club ${i}`}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                            <span className="ml-6 text-sm font-semibold text-slate-500">500+ Member Aktif</span>
                        </div>
                    </div>
                </div>

                <ActivityCarousel />
            </div>
        </section>
    )
}
