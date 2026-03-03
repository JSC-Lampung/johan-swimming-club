'use client'
import { Plus, Users, FileText, BarChart3, Settings } from 'lucide-react'
import Link from 'next/link'

export default function QuickActions() {
    const actions = [
        {
            name: 'Tambah Anggota',
            href: '/admin/members',
            icon: Plus,
            color: 'bg-blue-600',
            hover: 'hover:bg-blue-700'
        },
        {
            name: 'Tambah Pelatih',
            href: '/admin/coaches',
            icon: Users,
            color: 'bg-emerald-600',
            hover: 'hover:bg-emerald-700'
        },
        {
            name: 'Buat Postingan',
            href: '/admin/contents',
            icon: FileText,
            color: 'bg-purple-600',
            hover: 'hover:bg-purple-700'
        },
        {
            name: 'Monitoring Pelatih',
            href: '/admin/reports',
            icon: BarChart3,
            color: 'bg-amber-600',
            hover: 'hover:bg-amber-700'
        }
    ]

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                Akses Cepat
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {actions.map((action, i) => (
                    <Link
                        key={i}
                        href={action.href}
                        className={`flex flex-col items-center justify-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 transition-all duration-300 group hover:border-slate-500 hover:scale-[1.05] active:scale-95`}
                    >
                        <div className={`p-3 rounded-2xl ${action.color} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                            <action.icon size={24} />
                        </div>
                        <span className="text-slate-300 font-bold text-xs uppercase tracking-wider text-center">{action.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    )
}
