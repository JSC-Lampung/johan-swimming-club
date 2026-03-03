'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Trophy,
    Plus,
    Search,
    Filter,
    Users,
    Activity,
    Medal,
    ChevronRight
} from 'lucide-react'
import BestTimeModal from '@/components/BestTimeModal'
import BestTimeTable from '@/components/BestTimeTable'
import { PROGRAMS } from '@/lib/constants'

export default function CoachBestTimePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState([])
    const [members, setMembers] = useState([])
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [userRole, setUserRole] = useState('')
    const [filter, setFilter] = useState({
        stroke: 'All',
        category: 'All',
        program: 'All',
        distance: 'All'
    })

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
                setUserRole(profile?.role || 'coach')
                setUser({ ...authUser, role: profile?.role || 'coach', ...profile })

                // Fetch members for the dropdown (including program_pilihan for modal filtering)
                const { data: membersData } = await supabase
                    .from('profiles')
                    .select('id, full_name, program_pilihan')
                    .eq('role', 'member')
                    .order('full_name')
                setMembers(membersData || [])

                fetchRecords()
            }
            setLoading(false)
        }
        fetchData()
    }, [])

    const fetchRecords = async () => {
        const { data, error } = await supabase
            .from('member_best_times')
            .select('*, profiles(full_name, program_pilihan)')
            .order('event_date', { ascending: false })

        if (!error) setRecords(data)
    }

    const filteredRecords = records.filter(r => {
        const nameMatch = r.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
        const strokeMatch = filter.stroke === 'All' || r.stroke === filter.stroke
        const categoryMatch = filter.category === 'All' || r.category === filter.category
        const programMatch = filter.program === 'All' || r.profiles?.program_pilihan === filter.program
        const distanceMatch = filter.distance === 'All' || r.distance === parseInt(filter.distance)
        return nameMatch && strokeMatch && categoryMatch && programMatch && distanceMatch
    })

    const handleDelete = async (id) => {
        if (!confirm('Hapus catatan waktu ini?')) return
        const { error } = await supabase.from('member_best_times').delete().eq('id', id)
        if (!error) fetchRecords()
    }

    const handleEdit = (record) => {
        setEditingRecord(record)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Trophy className="text-blue-500" />
                        MANAJEMEN BEST TIME
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Kelola dan pantau catatan waktu terbaik seluruh atlet.</p>
                </div>

                <button
                    onClick={() => {
                        setEditingRecord(null)
                        setIsModalOpen(true)
                    }}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 shrink-0"
                >
                    <Plus size={20} />
                    INPUT WAKTU BARU
                </button>
            </div>

            {/* Controls */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                    <input
                        type="text"
                        placeholder="Cari nama atlet..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                    />
                </div>
                <div className="lg:col-span-2 flex flex-wrap items-center gap-3 bg-slate-900/40 p-2 rounded-2xl border border-slate-700/50">
                    <div className="flex items-center gap-2 px-3 text-slate-500 shrink-0">
                        <Filter size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Filter:</span>
                    </div>
                    {userRole === 'head_coach' && (
                        <select
                            value={filter.program}
                            onChange={e => setFilter({ ...filter, program: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[140px]"
                        >
                            <option value="All">Semua Program</option>
                            {PROGRAMS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    )}
                    <select
                        value={filter.stroke}
                        onChange={e => setFilter({ ...filter, stroke: e.target.value })}
                        className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[120px]"
                    >
                        <option value="All">Semua Gaya</option>
                        {['Bebas', 'Dada', 'Punggung', 'Kupu-kupu'].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select
                        value={filter.distance}
                        onChange={e => setFilter({ ...filter, distance: e.target.value })}
                        className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[100px]"
                    >
                        <option value="All">Semua Jarak</option>
                        {[50, 100, 200].map(d => <option key={d} value={d}>{d}m</option>)}
                    </select>
                    <select
                        value={filter.category}
                        onChange={e => setFilter({ ...filter, category: e.target.value })}
                        className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-xl outline-none focus:border-blue-500 transition-colors cursor-pointer min-w-[120px]"
                    >
                        <option value="All">Semua Kategori</option>
                        <option value="Latihan">Latihan</option>
                        <option value="Kejuaraan">Kejuaraan</option>
                    </select>
                </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-2">
                <BestTimeTable
                    data={filteredRecords}
                    loading={loading}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    currentUser={user}
                    showMemberName={true}
                />
            </div>

            <BestTimeModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false)
                    setEditingRecord(null)
                }}
                onSuccess={fetchRecords}
                currentUser={user}
                initialData={editingRecord}
                members={members}
            />
        </div>
    )
}
