'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default function RecentMembers() {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchRecentMembers() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('role', 'member')
                    .order('created_at', { ascending: false })
                    .limit(5)

                if (data) setMembers(data)
            } catch (err) {
                console.error('Error fetching recent members:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchRecentMembers()
    }, [])

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl h-full flex flex-col">
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] flex items-center gap-2">
                    <div className="w-2 h-4 bg-emerald-600 rounded-full"></div>
                    Anggota Baru
                </h3>
                <Link href="/admin/members" className="text-[10px] text-blue-400 font-bold uppercase tracking-widest hover:text-blue-300 transition-colors flex items-center gap-1">
                    Semua <ArrowRight size={12} />
                </Link>
            </div>

            <div className="flex-1 space-y-4">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-2 border-slate-700 border-t-emerald-500 rounded-full animate-spin"></div>
                    </div>
                ) : members.length > 0 ? (
                    members.map((member) => (
                        <div key={member.id} className="flex items-center gap-4 group cursor-default p-2 rounded-xl hover:bg-slate-700/30 transition-colors">
                            <div className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600 overflow-hidden flex items-center justify-center text-slate-400">
                                {member.avatar_url ? (
                                    <img src={member.avatar_url} alt="" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={20} />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-white font-bold text-sm truncate uppercase tracking-tight">{member.full_name}</p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <span className="text-[10px] font-black p-0.5 px-2 bg-blue-500/10 text-blue-400 rounded uppercase">
                                        {member.program_pilihan || 'Umum'}
                                    </span>
                                    <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1">
                                        <Calendar size={10} />
                                        {new Date(member.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center p-8 text-center bg-slate-900/40 rounded-xl border border-slate-700/50">
                        <User size={32} className="text-slate-600 mb-2" />
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Belum ada anggota</p>
                    </div>
                )}
            </div>
        </div>
    )
}
