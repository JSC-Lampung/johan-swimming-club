
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Users, Phone, Mail, Search, Plus, Edit2, Trash2, Smartphone } from 'lucide-react'
import CoachMemberModal from '@/components/coach/modals/CoachMemberModal'
import { deleteUserAdmin } from '@/app/actions/authActions'

export default function CoachMembersPage() {
    const [members, setMembers] = useState([])
    const [coachProfile, setCoachProfile] = useState(null)
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [selectedMember, setSelectedMember] = useState(null)

    const fetchProgramMembers = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setCoachProfile(profile)

            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'member')
                .eq('program_pilihan', profile.program_pilihan)
                .order('full_name', { ascending: true })

            if (error) throw error
            setMembers(data || [])
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProgramMembers()
    }, [])

    const handleDelete = async (memberId, name) => {
        if (!confirm(`Apakah Anda yakin ingin menghapus anggota "${name}"? Tindakan ini permanen.`)) return

        try {
            const res = await deleteUserAdmin(memberId)
            if (!res.success) throw new Error(res.error)

            // Delete profile too (though Auth delete usually triggers profile delete if set up, or we do it manual)
            await supabase.from('profiles').delete().eq('id', memberId)

            alert('Anggota berhasil dihapus.')
            fetchProgramMembers()
        } catch (err) {
            alert('Gagal menghapus: ' + err.message)
        }
    }

    const filteredMembers = members.filter(m =>
        m.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    if (loading) return <div className="p-8 text-slate-400">Loading data anggota...</div>

    return (
        <div className="space-y-6 animate-fadeIn pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                        <Users className="text-blue-500" />
                        Daftar Anggota Binaaan
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">
                        Melatih di Program: <span className="text-blue-400 font-semibold">{coachProfile?.program_pilihan?.toUpperCase() || '-'}</span>
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative flex-1 md:flex-none">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Cari nama..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="bg-slate-800 border border-slate-700 rounded-xl py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 w-full md:w-64 transition-all text-sm"
                        />
                    </div>
                    <button
                        onClick={() => { setSelectedMember(null); setIsModalOpen(true); }}
                        className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-95 flex items-center gap-2 font-bold text-xs uppercase"
                    >
                        <Plus size={18} /> <span className="hidden sm:inline">Tambah</span>
                    </button>
                </div>
            </div>

            <div className="bg-slate-800 border border-slate-700 rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-200 border-collapse">
                        <thead>
                            <tr className="bg-slate-700/30 text-slate-400 text-xs font-black uppercase tracking-[0.2em] border-b border-slate-700">
                                <th className="px-8 py-6">Anggota</th>
                                <th className="px-8 py-6">Profil</th>
                                <th className="px-8 py-6">Kontak</th>
                                <th className="px-8 py-6">Status</th>
                                <th className="px-8 py-6 text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredMembers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="py-24 text-center">
                                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                                        <p className="text-slate-500 font-medium">Tidak ada anggota yang ditemukan di program ini.</p>
                                    </td>
                                </tr>
                            ) : filteredMembers.map(m => {
                                const isVerified = (m.status || '').toLowerCase() === 'active'
                                return (
                                    <tr key={m.id} className="hover:bg-slate-700/20 transition-all group">
                                        <td className="px-8 py-5">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-400 overflow-hidden group-hover:scale-105 transition-transform shadow-lg flex-shrink-0">
                                                    {m.avatar_url ? (
                                                        <img src={m.avatar_url} alt={m.full_name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <Users size={20} />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="text-white font-bold truncate group-hover:text-blue-400 transition-colors uppercase tracking-tight text-sm">{m.full_name}</h3>
                                                    <p className="text-[10px] text-slate-500 mt-0.5 font-bold uppercase tracking-widest italic">{coachProfile?.program_pilihan}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-300 font-bold uppercase tracking-widest">
                                                    {m.gender === 'L' ? '♂ Laki-laki' : m.gender === 'P' ? '♀ Perempuan' : '-'}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-medium">
                                                    {m.birth_date ? new Date(m.birth_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <Mail size={12} className="text-blue-500/50" />
                                                    <span className="truncate">{m.email || m.email_auth || '-'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                                                    <Smartphone size={12} className="text-emerald-500/50" />
                                                    <span>{m.telepon || m.phone || '-'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-5 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_15px_-5px_theme(colors.emerald.500)]' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {isVerified ? '● Aktif' : '● Menunggu'}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5 text-right whitespace-nowrap">
                                            <div className="flex items-center justify-end gap-2">
                                                <a
                                                    href={`https://wa.me/${(m.telepon || m.phone || '').replace(/\D/g, '')}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="w-9 h-9 rounded-xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center border border-emerald-500/20 group/wa"
                                                    title="Hubungi WhatsApp"
                                                >
                                                    <Phone size={16} className="group-hover/wa:scale-110 transition-transform" />
                                                </a>
                                                <button
                                                    onClick={() => { setSelectedMember(m); setIsModalOpen(true); }}
                                                    className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center border border-blue-500/20"
                                                    title="Edit Data"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(m.id, m.full_name)}
                                                    className="w-9 h-9 rounded-xl bg-red-600/10 text-red-400 hover:bg-red-600 hover:text-white transition-all flex items-center justify-center border border-red-500/20"
                                                    title="Hapus Anggota"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            </div>


            <CoachMemberModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                member={selectedMember}
                coachProfile={coachProfile}
                onSuccess={fetchProgramMembers}
            />
        </div>
    )
}
