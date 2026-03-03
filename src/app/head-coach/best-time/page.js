'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Trophy,
    Search,
    Filter,
    BarChart3,
    Medal,
    TrendingUp,
    Download,
    Users
} from 'lucide-react'
import { PROGRAMS } from '@/lib/constants'
import BestTimeTable from '@/components/BestTimeTable'
import BestTimeModal from '@/components/BestTimeModal'

export default function HeadCoachBestTimePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [records, setRecords] = useState([])
    const [members, setMembers] = useState([])
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingRecord, setEditingRecord] = useState(null)
    const [filter, setFilter] = useState({
        stroke: 'All',
        category: 'All',
        distance: 'All',
        program: 'All'
    })

    useEffect(() => {
        const fetchData = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase.from('profiles').select('*').eq('id', authUser.id).single()
                setUser({ ...authUser, role: profile?.role || 'head_coach' })

                // Fetch members for the modal
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

    const getFilteredAndRankedRecords = () => {
        // 1. Filtering
        let filtered = records.filter(r => {
            const nameMatch = r.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase())
            const strokeMatch = filter.stroke === 'All' || r.stroke === filter.stroke
            const categoryMatch = filter.category === 'All' || r.category === filter.category
            const distanceMatch = filter.distance === 'All' || r.distance === parseInt(filter.distance)
            const programMatch = filter.program === 'All' || r.profiles?.program_pilihan === filter.program
            return nameMatch && strokeMatch && categoryMatch && distanceMatch && programMatch
        })

        // 2. Ranking Logic (only if stroke and distance are selected)
        const isRankable = filter.stroke !== 'All' && filter.distance !== 'All'

        if (isRankable) {
            // Sort by record_time (MM:SS.hh format)
            filtered.sort((a, b) => a.record_time.localeCompare(b.record_time))

            // Add rank to each record
            let currentRank = 0
            let lastTime = null

            return filtered.map((r, index) => {
                if (r.record_time !== lastTime) {
                    currentRank = index + 1
                    lastTime = r.record_time
                }
                return { ...r, rank: currentRank }
            })
        }

        return filtered
    }

    const filteredRecords = getFilteredAndRankedRecords()

    const handleEdit = (record) => {
        setEditingRecord(record)
        setIsModalOpen(true)
    }

    const handleDelete = async (id) => {
        if (!confirm('Hapus catatan waktu ini?')) return
        const { error } = await supabase.from('member_best_times').delete().eq('id', id)
        if (!error) fetchRecords()
    }

    // Dynamic Title Logic
    const getDynamicTitle = () => {
        let title = 'DAFTAR CATATAN WAKTU'
        if (filter.stroke !== 'All' && filter.distance !== 'All') {
            title = `RANKING GAYA ${filter.stroke.toUpperCase()} ${filter.distance}M`
        } else if (filter.stroke !== 'All') {
            title = `CATATAN GAYA ${filter.stroke.toUpperCase()}`
        }

        if (filter.program !== 'All') {
            const programMap = {
                pemula: 'KELAS PEMULA',
                dasar: 'KELAS DASAR',
                menengah: 'KELAS MENENGAH',
                prestasi: 'KELAS PRESTASI',
                privat: 'KELAS PRIVAT',
                fitness: 'KELAS FITNESS'
            }
            title += ` - ${programMap[filter.program] || filter.program.toUpperCase()}`
        }

        return title
    }

    return (
        <div className="space-y-8 pb-12 animate-fadeIn">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase flex items-center gap-3">
                        <Trophy className="text-blue-500" />
                        MANAJEMEN & ANALISIS BEST TIME
                    </h1>
                    <p className="text-slate-400 text-sm mt-1 font-medium italic">Dashboard pusat untuk memantau waktu terbaik dan perkembangan seluruh atlet klub.</p>
                </div>

                <div className="flex gap-3">
                    <button
                        onClick={() => {
                            setEditingRecord(null)
                            setIsModalOpen(true)
                        }}
                        className="flex items-center gap-3 bg-blue-600 hover:bg-blue-500 text-white font-black py-4 px-8 rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95 shrink-0 text-sm"
                    >
                        INPUT DATA
                    </button>
                </div>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-blue-500/10 group-hover:scale-110 transition-transform duration-500">
                        <Users size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Atlet Tercatat</p>
                    <h3 className="text-4xl font-black text-white italic">{new Set(filteredRecords.map(r => r.member_id)).size}</h3>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-amber-500/10 group-hover:scale-110 transition-transform duration-500">
                        <Medal size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Total Record Kejuaraan</p>
                    <h3 className="text-4xl font-black text-white italic text-amber-500">{filteredRecords.filter(r => r.category === 'Kejuaraan').length}</h3>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-md border border-slate-700 p-8 rounded-3xl relative overflow-hidden group">
                    <div className="absolute -right-4 -bottom-4 text-emerald-500/10 group-hover:scale-110 transition-transform duration-500">
                        <TrendingUp size={120} />
                    </div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Record Bulan Ini</p>
                    <h3 className="text-4xl font-black text-white italic text-emerald-400">
                        {filteredRecords.filter(r => new Date(r.event_date).getMonth() === new Date().getMonth()).length}
                    </h3>
                </div>
            </div>

            {/* Control Panel */}
            <div className="bg-slate-900/40 p-6 rounded-3xl border border-slate-700/50 space-y-4">
                <div className="flex flex-col lg:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Cari nama atlet..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl py-4 pl-12 pr-4 text-white font-bold text-sm outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    <div className="flex flex-wrap items-center gap-3">
                        <select
                            value={filter.program}
                            onChange={e => setFilter({ ...filter, program: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors min-w-[140px]"
                        >
                            <option value="All">Program: Semua</option>
                            {PROGRAMS.map(p => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                        <select
                            value={filter.stroke}
                            onChange={e => setFilter({ ...filter, stroke: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors min-w-[120px]"
                        >
                            <option value="All">Gaya: Semua</option>
                            {['Bebas', 'Dada', 'Punggung', 'Kupu-kupu'].map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select
                            value={filter.distance}
                            onChange={e => setFilter({ ...filter, distance: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors min-w-[100px]"
                        >
                            <option value="All">Jarak: Semua</option>
                            {[50, 100, 200].map(d => <option key={d} value={d}>{d}m</option>)}
                        </select>
                        <select
                            value={filter.category}
                            onChange={e => setFilter({ ...filter, category: e.target.value })}
                            className="bg-slate-800 border border-slate-700 text-white text-[10px] font-black uppercase tracking-widest px-3 py-4 rounded-2xl outline-none focus:border-blue-500 transition-colors min-w-[120px]"
                        >
                            <option value="All">Kategori: Semua</option>
                            <option value="Latihan">Latihan</option>
                            <option value="Kejuaraan">Kejuaraan</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="bg-slate-800/30 border border-slate-700/50 rounded-3xl p-6 min-h-[400px]">
                <div className="flex items-center justify-between mb-6 px-2">
                    <h2 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] italic border-l-4 border-blue-600 pl-4">
                        {getDynamicTitle()}
                    </h2>
                    {filter.stroke !== 'All' && filter.distance !== 'All' && (
                        <span className="text-[10px] font-bold text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full uppercase tracking-widest">
                            Urutan Berdasarkan Waktu Tercepat
                        </span>
                    )}
                </div>
                <BestTimeTable
                    data={filteredRecords}
                    loading={loading}
                    currentUser={user}
                    showMemberName={true}
                    showRank={filter.stroke !== 'All' && filter.distance !== 'All'}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
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
