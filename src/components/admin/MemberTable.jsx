
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AddMemberModal from './modals/AddMemberModal'
import EditUserModal from './modals/EditUserModal'
import ResetPasswordModal from './modals/ResetPasswordModal'

export default function MemberTable() {
    const [members, setMembers] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [resettingUser, setResettingUser] = useState(null)
    const [programFilter, setProgramFilter] = useState('all')

    async function fetchMembers() {
        try {
            const { data, error } = await supabase.from('profiles').select('*').eq('role', 'member').order('full_name', { ascending: true })
            if (error) throw error
            setMembers(data || [])
        } catch (err) {
            console.error(err)
            alert('Gagal memuat member')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchMembers() }, [])

    const verifyUser = async (id, currentStatus) => {
        const isActive = (currentStatus || '').toLowerCase().trim() === 'active'
        const newStatus = isActive ? 'pending' : 'active'
        const action = isActive ? 'Batalkan Verifikasi' : 'Verifikasi'

        if (!confirm(`Apakah Anda yakin ingin ${action} user ini?`)) return

        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
        if (error) alert('Gagal update: ' + error.message)
        else fetchMembers()
    }

    const promoteToCoach = async (id) => {
        if (!confirm('Apakah Anda yakin ingin mengubah user ini menjadi Pelatih?')) return
        const { error } = await supabase.from('profiles').update({ role: 'coach' }).eq('id', id)
        if (error) alert('Gagal mengubah role: ' + error.message)
        else fetchMembers()
    }

    const handleResetPassword = (user) => {
        setResettingUser(user)
    }

    const deleteUser = async (id, name) => {
        if (!confirm(`PERINGATAN: Menghapus "${name}" akan menghapus SELURUH data terkait (absensi, nilai, dll). Tindakan ini tidak dapat dibatalkan.\n\nApakah Anda yakin?`)) return

        setLoading(true)
        try {
            // 1. Clean up member_attendance
            await supabase.from('member_attendance').delete().eq('member_id', id)

            // 2. Clean up member_assessments
            await supabase.from('member_assessments').delete().eq('member_id', id)

            // 3. Clean up member_leave_requests
            await supabase.from('member_leave_requests').delete().eq('member_id', id)

            // 4. Finally delete from profiles
            const { error } = await supabase.from('profiles').delete().eq('id', id)

            if (error) throw error

            alert(`Berhasil menghapus member: ${name}`)
            fetchMembers()
        } catch (err) {
            console.error('Delete error:', err)
            alert('Gagal menghapus user: ' + (err.message || 'Terjadi kesalahan saat menghapus data.'))
            setLoading(false)
        }
    }

    const filteredMembers = members.filter(m => {
        if (programFilter === 'all') return true
        const prog = (m.program_pilihan || m.program || '').toLowerCase()
        return prog === programFilter
    })

    if (loading) return <div className="p-8 text-center text-slate-400">Loading members...</div>

    return (
        <>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-slideIn">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-xl font-bold text-white">Daftar Anggota Aktif <span className="text-blue-400 ml-2">({filteredMembers.length})</span></h3>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Total: {members.length} Member</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <select
                            value={programFilter}
                            onChange={(e) => setProgramFilter(e.target.value)}
                            className="bg-slate-900 border border-slate-700 text-white text-xs font-bold rounded-xl px-4 py-2 outline-none focus:border-blue-500 transition-all"
                        >
                            <option value="all">Semua Program</option>
                            <option value="pemula">Kelas Pemula</option>
                            <option value="dasar">Kelas Dasar</option>
                            <option value="menengah">Kelas Menengah</option>
                            <option value="prestasi">Kelas Prestasi</option>
                            <option value="privat">Kelas Privat</option>
                            <option value="fitness">Kelas Fitness</option>
                        </select>
                        <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all active:scale-95 shadow-lg">
                            + Tambah Anggota Manual
                        </button>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-200">
                        <thead className="border-b border-slate-700 text-slate-400 text-sm">
                            <tr>
                                <th className="pb-4 font-semibold w-10">No.</th>
                                <th className="pb-4 font-semibold">Nama Lengkap</th>
                                <th className="pb-4 font-semibold text-xs">Email</th>
                                <th className="pb-4 font-semibold">Info</th>
                                <th className="pb-4 font-semibold">Program</th>
                                <th className="pb-4 font-semibold">Status</th>
                                <th className="pb-4 font-semibold">Telepon</th>
                                <th className="pb-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredMembers.length === 0 ? (
                                <tr><td colSpan="8" className="py-8 text-center text-slate-500">Belum ada anggota ditemukan dengan filter ini.</td></tr>
                            ) : filteredMembers.map((m, index) => {
                                const isVerified = (m.status || '').toLowerCase() === 'active'
                                return (
                                    <tr key={m.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4 text-xs font-bold text-slate-500">{index + 1}</td>
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{m.full_name || 'Tanpa Nama'}</span>
                                                <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400/80 mt-1 flex items-center gap-1">
                                                    <span className="w-1 h-1 rounded-full bg-emerald-400"></span> Anggota
                                                </span>
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs text-slate-400 font-medium lowercase italic block truncate max-w-[140px]">{m.email || m.email_auth || '-'}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col text-[10px] font-bold uppercase tracking-wider gap-0.5">
                                                <span className="text-slate-300">{m.gender === 'L' ? 'Laki-laki' : m.gender === 'P' ? 'Perempuan' : '-'}</span>
                                                <span className="text-slate-500">{m.birth_date || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-blue-300">
                                            {(() => {
                                                const p = (m.program_pilihan || m.program || '').toLowerCase()
                                                const map = {
                                                    pemula: 'Kelas Pemula',
                                                    dasar: 'Kelas Dasar',
                                                    menengah: 'Kelas Menengah',
                                                    prestasi: 'Kelas Prestasi',
                                                    privat: 'Kelas Privat',
                                                    fitness: 'Kelas Fitness'
                                                }
                                                return map[p] || p.toUpperCase() || '-'
                                            })()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {isVerified ? 'Aktif' : 'Tertunda'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-slate-400">{m.telepon || m.phone || '-'}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => verifyUser(m.id, m.status)} className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ${isVerified ? 'text-emerald-400' : 'text-slate-400'}`} title={isVerified ? 'Batalkan Verifikasi' : 'Verifikasi'}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                                <button onClick={() => setEditingUser(m)} className="p-2 rounded-lg bg-slate-700 text-blue-400 hover:bg-slate-600 transition-colors" title="Edit">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                                </button>
                                                <button onClick={() => promoteToCoach(m.id)} className="p-2 rounded-lg bg-slate-700 text-emerald-400 hover:bg-slate-600 transition-colors" title="Ubah ke Coach">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                                </button>
                                                <button onClick={() => handleResetPassword(m)} className="p-2 rounded-lg bg-slate-700 text-amber-400 hover:bg-slate-600 transition-colors" title="Reset Password Manual">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                </button>
                                                <button onClick={() => deleteUser(m.id, m.full_name)} className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-slate-600 transition-colors" title="Hapus">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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

            <AddMemberModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchMembers} />
            <EditUserModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} user={editingUser} onSuccess={fetchMembers} />
            <ResetPasswordModal isOpen={!!resettingUser} onClose={() => setResettingUser(null)} user={resettingUser} />
        </>
    )
}
