'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    TrendingUp,
    Plus,
    Filter,
    Activity,
    Medal,
    Trophy
} from 'lucide-react'
import BestTimeModal from '@/components/BestTimeModal'
import BestTimeTable from '@/components/BestTimeTable'

export default function MemberBestTimePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [filter, setFilter] = useState({ stroke: 'All', category: 'All' })

    useEffect(() => {
        const fetchUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
                setUser({ ...authUser, role: profile?.role || 'member' })
                fetchRecords(authUser.id)
            }
            setLoading(false)
        }
        fetchUser()
    }, [])

    const fetchRecords = async (userId) => {
        let query = supabase
            .from('member_best_times')
            .select('*')
            .eq('member_id', userId)
            .order('event_date', { ascending: false })

        const { data, error } = await query
        if (!error) setRecords(data)
    }

    const filteredRecords = records.filter(r => {
        const strokeMatch = filter.stroke === 'All' || r.stroke === filter.stroke
        const categoryMatch = filter.category === 'All' || r.category === filter.category
        return strokeMatch && categoryMatch
    })

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Trophy className="text-blue-500" />
                        CATATAN WAKTU TERBAIK
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Monitor pencapaian waktu renang Anda dari setiap event dan latihan.</p>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    TAMBAH CATATAN
                </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                        <Activity size={24} />
                    </div>
                    <div>
                        <p className="text-white font-black text-xl italic leading-none">{records.length}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Record</p>
                    </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-6 rounded-3xl flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <Medal size={24} />
                    </div>
                    <div>
                        <p className="text-white font-black text-xl italic leading-none">
                            {records.filter(r => r.category === 'Kejuaraan').length}
                        </p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Kejuaraan</p>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-4 bg-slate-900/40 p-3 rounded-2xl border border-slate-700/50">
                <div className="flex items-center gap-2 px-3 text-slate-500">
                    <Filter size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
                </div>
                <select
                    value={filter.stroke}
                    onChange={e => setFilter({ ...filter, stroke: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                    <option value="All">Semua Gaya</option>
                    {['Bebas', 'Dada', 'Punggung', 'Kupu-kupu'].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select
                    value={filter.category}
                    onChange={e => setFilter({ ...filter, category: e.target.value })}
                    className="bg-slate-800 border border-slate-700 text-white text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer"
                >
                    <option value="All">Semua Kategori</option>
                    <option value="Latihan">Latihan</option>
                    <option value="Kejuaraan">Kejuaraan</option>
                </select>
            </div>

            <BestTimeTable
                data={filteredRecords}
                loading={loading}
                currentUser={user}
                onDelete={async (id) => {
                    if (confirm('Hapus catatan waktu ini?')) {
                        await supabase.from('member_best_times').delete().eq('id', id)
                        fetchRecords(user.id)
                    }
                }}
            />

            <BestTimeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => fetchRecords(user.id)}
                currentUser={user}
            />
        </div>
    )
}
