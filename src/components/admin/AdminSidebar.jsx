'use client'

import {
    LayoutDashboard,
    Users,
    UserCheck,
    FileText,
    BarChart3,
    Settings,
    LogOut,
    Menu,
    X,
    Shield
} from 'lucide-react'
import { supabase } from '@/lib/supabaseClient'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSettings } from '@/context/SettingsContext'

export default function AdminSidebar() {
    const [isOpen, setIsOpen] = useState(false)
    const [user, setUser] = useState(null)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const pathname = usePathname()
    const router = useRouter()
    const { settings } = useSettings()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()
                setUser(profile)
            }
        }
        getUser()
    }, [])

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true)
            await supabase.auth.signOut()
            // Use window.location.href for a full clean redirect
            window.location.href = '/'
        } catch (error) {
            console.error('Logout error:', error)
            router.push('/')
        }
    }

    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
        { name: 'Daftar Pelatih', icon: Users, href: '/admin/coaches' },
        { name: 'Daftar Anggota', icon: UserCheck, href: '/admin/members' },
        { name: 'Instruksi Admin', icon: FileText, href: '/admin/instructions' },
        { name: 'Pusat Postingan', icon: FileText, href: '/admin/contents' },
        { name: 'Monitoring Pelatih', icon: BarChart3, href: '/admin/reports' },
        { name: 'Pengaturan Site', icon: Settings, href: '/admin/settings' },
    ]

    const toggleSidebar = () => setIsOpen(!isOpen)

    return (
        <>
            {/* Mobile Toggle Button */}
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-4 left-4 z-[60] p-2 bg-slate-800 rounded-lg text-white border border-slate-700 shadow-xl"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {/* Backdrop for mobile */}
            {isOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[50]"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-[55]
                w-72 bg-slate-800 border-r border-slate-700 flex flex-col h-full
                transform transition-transform duration-300 ease-in-out
                ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                {/* Brand / Logo Section */}
                <div className="p-6 border-b border-slate-700/50">
                    <Link href="/admin" className="flex items-center gap-3 group/logo">
                        <div className="relative">
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-lg border border-slate-700 flex items-center justify-center group-hover/logo:scale-105 transition-transform duration-300">
                                {settings.club_logo ? (
                                    <img src={settings.club_logo} alt="JSC Logo" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-xl">J</div>
                                )}
                            </div>
                            <div className="absolute -inset-1 bg-blue-500/20 blur-sm rounded-full -z-10 group-hover/logo:bg-blue-500/30 transition-colors"></div>
                        </div>
                        <div className="flex flex-col">
                            <h1 className="text-white font-black text-sm tracking-tight leading-none">JOHAN SWIMMING</h1>
                            <p className="text-blue-400 text-[9px] font-black uppercase tracking-[0.2em] mt-1">Administrator</p>
                        </div>
                    </Link>
                </div>

                {/* Navigation Links */}
                <nav className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`
                                    flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                                    ${isActive
                                        ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-600/20'
                                        : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}
                                `}
                            >
                                <item.icon size={20} className={isActive ? 'text-white' : 'text-slate-500 group-hover:text-white'} />
                                <span className="font-bold text-sm tracking-tight">{item.name}</span>
                            </Link>
                        )
                    })}
                </nav>

                {/* Footer Section (Logout) */}
                <div className="p-4 border-t border-slate-700 bg-slate-800/80 mt-auto">
                    {/* Integrated Profile Section at bottom */}
                    <div className="flex items-center gap-3 bg-slate-900/40 p-3 rounded-2xl border border-slate-700/30 mb-4">
                        <div className="w-9 h-9 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 overflow-hidden shadow-inner shrink-0 font-bold">
                            {user?.avatar_url ? (
                                <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <Shield size={18} />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className="text-white font-bold text-[11px] truncate whitespace-nowrap">{user?.full_name || 'Admin JSC'}</h2>
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
                                <p className="text-emerald-400 text-[8px] font-bold uppercase tracking-widest">
                                    Online
                                </p>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:bg-red-500/10 hover:text-red-400 font-bold transition-all duration-200 group disabled:opacity-50"
                    >
                        <LogOut size={18} className={`group-hover:-translate-x-1 transition-transform ${isLoggingOut ? 'animate-pulse' : ''}`} />
                        <span className="text-xs">{isLoggingOut ? 'Memproses...' : 'Logout Panel'}</span>
                    </button>
                    <div className="mt-4 pb-2 px-2 text-[9px] text-slate-500 text-center font-bold uppercase tracking-widest opacity-40">
                        Admin JSC v2.0
                    </div>
                </div>
            </aside>
        </>
    )
}
