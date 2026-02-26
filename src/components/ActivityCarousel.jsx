
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'


export default function ActivityCarousel() {
    const [images, setImages] = useState([
        "https://images.unsplash.com/photo-1519315901367-f34ff9154487?q=80&w=1200",
        "https://images.unsplash.com/photo-1438029071396-1e831a7fa6d8?q=80&w=1200"
    ])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSlides = async () => {
            if (!supabase) {
                setLoading(false)
                return
            }
            const { data, error } = await supabase
                .from('hero_slides')
                .select('image_url')
                .eq('is_active', true)
                .order('order_index', { ascending: true })

            if (!error && data && data.length > 0) {
                setImages(data.map(d => d.image_url))
            }
            setLoading(false)
        }
        fetchSlides()
    }, [])

    useEffect(() => {
        if (images.length <= 1) return
        const timer = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length)
        }, 5000)
        return () => clearInterval(timer)
    }, [images])

    return (
        <div className="relative group lg:col-span-7 h-[300px] md:h-[450px]">
            <div className="absolute -inset-4 bg-gradient-to-tr from-blue-600/20 to-cyan-400/20 blur-2xl rounded-3xl group-hover:opacity-75 transition-opacity"></div>

            <div className="relative h-full rounded-[2.5rem] overflow-hidden shadow-2xl border border-white/20 bg-slate-200">
                {images.map((img, idx) => (
                    <div
                        key={idx}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out transform ${idx === currentIndex ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-110 -rotate-1'}`}
                    >
                        <img
                            src={img}
                            alt={`Aktivitas Latihan Johan Swimming Club - Slide ${idx + 1}`}
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent"></div>
                    </div>
                ))}

                {/* Indicators */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => setCurrentIndex(idx)}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentIndex ? 'w-8 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]' : 'w-2 bg-white/40 hover:bg-white/60'}`}
                        />
                    ))}
                </div>

                {/* Floating Badge */}
                <div className="absolute top-6 right-6 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-[10px] font-bold uppercase tracking-widest animate-pulse">
                    Live Activities
                </div>
            </div>
        </div>
    )
}
