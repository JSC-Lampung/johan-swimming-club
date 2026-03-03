
'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useUI } from '@/context/UIContext'
import { useSettings } from '@/context/SettingsContext'

export default function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
    const { openMemberModal } = useUI()
    const { settings } = useSettings()

    return (
        <nav className="fixed top-0 left-0 right-0 z-[999] bg-white/98 backdrop-blur-xl border-b border-slate-200 shadow-md py-4 transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
                <Link href="/" className="flex items-center gap-4 group">
                    <div className="relative">
                        <div className="w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden flex items-center justify-center bg-white shadow-xl shadow-blue-500/10 border border-slate-100 group-hover:scale-110 transition-transform duration-500 flex-shrink-0">
                            {settings.club_logo ? (
                                <img src={settings.club_logo} alt="Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                    </svg>
                                </div>
                            )}
                        </div>
                        {/* Decorative background element for the logo */}
                        <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-full opacity-20 blur-sm group-hover:opacity-40 transition-opacity -z-10"></div>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="font-display text-base md:text-xl font-black text-slate-900 leading-tight tracking-tighter">
                            {settings.club_name.split(' ').map((word, i) => (
                                <span key={i} className={i === 0 ? "text-blue-600" : ""}>{word}{' '}</span>
                            ))}
                        </h1>
                        {settings.club_slogan && (
                            <p className="text-[9px] md:text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] leading-none mt-1">
                                {settings.club_slogan}
                            </p>
                        )}
                    </div>
                </Link>

                {/* Desktop Nav */}
                <div className="hidden md:flex items-center gap-8">
                    <Link href="/" className="group flex items-center gap-1.5 text-slate-600 hover:text-blue-600 font-semibold nav-link">
                        <svg className="w-5 h-5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                        </svg>
                        Home
                    </Link>
                    <Link href="#info-center" className="text-slate-600 hover:text-blue-600 font-semibold nav-link">Program</Link>
                    <Link href="#contact" className="text-slate-600 hover:text-blue-600 font-semibold nav-link">Kontak</Link>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => openMemberModal('login')}
                        className="hidden md:block px-6 py-2.5 rounded-full bg-blue-600 text-white font-bold shadow-lg hover:bg-blue-700 active:scale-95 transition-all"
                    >
                        Masuk
                    </button>

                    {/* Burger Menu Toggle */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2 text-slate-600"
                    >
                        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Mobile Menu Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 top-[73px] bg-slate-900/20 backdrop-blur-sm z-40 md:hidden animate-fadeIn"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Menu Container */}
            <div className={`fixed inset-x-0 top-[73px] z-50 bg-white border-b border-slate-100 p-6 flex flex-col gap-4 md:hidden transform transition-all duration-300 ${isMobileMenuOpen ? 'translate-y-0 opacity-100 pointer-events-auto' : '-translate-y-full opacity-0 pointer-events-none'}`}>
                <div className="flex flex-col gap-4">
                    <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="group flex items-center gap-3 text-slate-900 font-bold py-3 border-b border-slate-50 active:bg-slate-50 px-2 rounded-xl transition-colors">
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                        </div>
                        Home
                    </Link>
                    <Link href="#info-center" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-900 font-bold py-2 border-b border-slate-50 px-2">Program</Link>
                    <Link href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-slate-900 font-bold py-2 border-b border-slate-50 px-2">Kontak</Link>
                </div>
                <button
                    onClick={() => { setIsMobileMenuOpen(false); openMemberModal('login'); }}
                    className="w-full py-4 rounded-2xl bg-blue-600 text-white font-bold mt-2"
                >
                    Masuk Anggota
                </button>
            </div>
        </nav>
    )
}
