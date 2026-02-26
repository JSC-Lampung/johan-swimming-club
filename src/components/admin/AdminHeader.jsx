
'use client'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default function AdminHeader() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()
    const router = useRouter()

    const handleLogout = async () => {
        await supabase.auth.signOut()
        router.push('/')
    }

    const links = [
        {
            name: 'Dashboard', href: '/admin', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-3m0 0l7-4 7 4M5 9v7a1 1 0 001 1h12a1 1 0 001-1V9m-9 6l4-4m0 0l4 4m-4-4v8" /></svg>
            )
        },
        {
            name: 'Daftar Pelatih', href: '/admin/coaches', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 8.646 4 4 0 010-8.646M9 9H4.5A2.5 2.5 0 002 11.5v8A2.5 2.5 0 004.5 22h15A2.5 2.5 0 0022 19.5v-8a2.5 2.5 0 00-2.5-2.5H15m0-2a4 4 0 110 8 4 4 0 010-8z" /></svg>
            )
        },
        {
            name: 'Daftar Anggota', href: '/admin/members', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
            )
        },
        {
            name: 'Pusat Postingan', href: '/admin/contents', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            )
        },
        {
            name: 'Pengaturan Site', href: '/admin/settings', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            )
        },
        {
            name: 'Laporan & Absensi', href: '/admin/reports', icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )
        },
        // Add other links similarly...
    ]

    const currentTitle = links.find(l => l.href === pathname)?.name || 'Dashboard'

    return (
        <header className="h-20 bg-slate-900/50 backdrop-blur-xl border-b border-slate-700/50 px-4 md:px-8 flex items-center justify-between sticky top-0 z-40">
            <div className="flex items-center gap-4 relative">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" /></svg>
                </button>

                {/* Dropdown Sidebar */}
                {isOpen && (
                    <div
                        className="fixed inset-0 z-40 cursor-default"
                        onClick={() => setIsOpen(false)}
                    />
                )}
                <div className={`absolute top-16 left-0 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 transition-all duration-300 transform origin-top-left ${isOpen ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 translate-y-2 pointer-events-none'}`}>
                    <nav className="space-y-1">
                        {links.map(link => (
                            <Link
                                key={link.href}
                                href={link.href}
                                onClick={() => setIsOpen(false)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${pathname === link.href ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg' : 'text-slate-400 hover:bg-slate-700/50'}`}
                            >
                                {link.icon}
                                {link.name}
                            </Link>
                        ))}
                        <div className="pt-2 mt-2 border-t border-slate-700/50">
                            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-semibold transition-all group">
                                <svg className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                Logout
                            </button>
                        </div>
                    </nav>
                </div>

                <h2 className="text-xl md:text-2xl font-display font-bold text-white tracking-tight">{currentTitle}</h2>
            </div>

            <div className="flex items-center gap-3 md:gap-5">
                <div className="hidden sm:flex flex-col text-right">
                    <p className="text-sm font-bold text-white leading-tight">Admin JSC</p>
                    <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">System Online</p>
                </div>
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 p-[2px]">
                    <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-blue-400 font-bold">AJ</div>
                </div>
            </div>
        </header>
    )
}
