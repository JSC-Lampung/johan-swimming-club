
'use client'
import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'
import { useUI } from '@/context/UIContext'

export default function Footer() {
    const { settings } = useSettings()
    const { openMemberModal } = useUI()

    return (
        <footer id="contact" className="bg-slate-900 text-white pt-20 pb-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
                {/* Column 1: Brand */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 group">
                        <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-blue-500/10 border border-slate-800 p-1 group-hover:scale-105 transition-transform duration-500">
                            {settings.club_logo ? (
                                <img src={settings.club_logo} alt="Logo" className="w-full h-full object-cover rounded-xl" />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-400 rounded-xl flex items-center justify-center">
                                    <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" /></svg>
                                </div>
                            )}
                        </div>
                        <div>
                            <h3 className="text-xl md:text-2xl font-black tracking-tight text-white leading-tight">
                                {settings.club_name.split(' ').map((word, i) => (
                                    <span key={i} className={i === 0 ? "text-blue-500" : ""}>{word}{' '}</span>
                                ))}
                            </h3>
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">{settings.club_slogan}</p>
                        </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed pr-4">
                        Klub renang profesional yang berkomitmen membangun karakter dan prestasi melalui pembinaan berkelanjutan.
                    </p>
                    <div className="flex gap-4">
                        {settings.social_instagram && (
                            <a href={settings.social_instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-gradient-to-tr from-purple-600 to-pink-500 transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c.796 0 1.441.645 1.441 1.44s-.645 1.44-1.441 1.44c-.795 0-1.439-.645-1.439-1.44s.644-1.44 1.439-1.44z" /></svg>
                            </a>
                        )}
                        {settings.social_facebook && (
                            <a href={settings.social_facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z" /></svg>
                            </a>
                        )}
                        {settings.social_tiktok && (
                            <a href={settings.social_tiktok} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-black transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.9-.32-1.89-.23-2.74.24-.88.48-1.45 1.38-1.54 2.39-.1 1.61 1.19 3.19 2.81 3.3.51.05 1.03.02 1.52-.14 1.13-.31 2.04-1.24 2.33-2.33.14-.52.14-1.08.14-1.63V.02z" /></svg>
                            </a>
                        )}
                        {settings.social_youtube && (
                            <a href={settings.social_youtube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-all group">
                                <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                            </a>
                        )}
                    </div>
                </div>

                {/* Column 2: Quick Links */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-blue-600 pl-4 uppercase tracking-widest text-xs">Akses Cepat</h4>
                    <ul className="space-y-3 text-slate-400">
                        <li><Link href="#landing-page" className="hover:text-blue-400 transition-colors flex items-center gap-2">Home</Link></li>
                        <li><Link href="#info-center" className="hover:text-blue-400 transition-colors flex items-center gap-2">Program Latihan</Link></li>
                        <li><button onClick={() => openMemberModal('login')} className="hover:text-blue-400 transition-colors flex items-center gap-2">Portal Anggota</button></li>
                    </ul>
                </div>

                {/* Column 3: Contact */}
                <div>
                    <h4 className="text-lg font-bold mb-6 text-white border-l-4 border-emerald-500 pl-4 uppercase tracking-widest text-xs">Hubungi Kami</h4>
                    <div className="space-y-4 text-slate-400 text-sm">
                        <div className="flex items-start gap-4">
                            <svg className="w-5 h-5 text-emerald-500 mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            <p>{settings.club_address || 'Alamat belum diatur'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                            <p>{settings.club_phone || '-'}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                            <p className="break-all">{settings.club_email || '-'}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4">
                <p className="text-slate-500 text-xs">
                    © {new Date().getFullYear()} {settings.club_name}. All rights reserved.
                </p>
                <div className="text-slate-500 text-[10px] uppercase tracking-widest font-black">
                    System support by <span className="text-blue-500">Ahsan Digital Media</span>
                </div>
            </div>
        </footer>
    )
}
