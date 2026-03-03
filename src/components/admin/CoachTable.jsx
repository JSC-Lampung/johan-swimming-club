
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import AddCoachModal from './modals/AddCoachModal'
import EditUserModal from './modals/EditUserModal'
import ResetPasswordModal from './modals/ResetPasswordModal'

export default function CoachTable() {
    const [coaches, setCoaches] = useState([])
    const [loading, setLoading] = useState(true)
    const [isAddModalOpen, setIsAddModalOpen] = useState(false)
    const [editingUser, setEditingUser] = useState(null)
    const [resettingUser, setResettingUser] = useState(null)

    async function fetchCoaches() {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .in('role', ['coach', 'head_coach'])
                .order('full_name', { ascending: true })
            if (error) throw error
            setCoaches(data || [])
        } catch (err) {
            console.error(err)
            alert('Gagal memuat data pelatih')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchCoaches() }, [])

    const toggleHeadCoach = async (id, currentRole) => {
        const isHeadCoach = currentRole === 'head_coach'
        const newRole = isHeadCoach ? 'coach' : 'head_coach'
        const action = isHeadCoach ? 'Turunkan menjadi Pelatih Biasa' : 'Jadikan Kepala Pelatih'

        if (!confirm(`Apakah Anda yakin ingin ${action}?`)) return

        const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', id)
        if (error) alert('Gagal update role: ' + error.message)
        else fetchCoaches()
    }

    const verifyUser = async (id, currentStatus) => {
        const isActive = (currentStatus || '').toLowerCase().trim() === 'active'
        const newStatus = isActive ? 'pending' : 'active'
        const action = isActive ? 'Batalkan Verifikasi' : 'Verifikasi'

        if (!confirm(`Apakah Anda yakin ingin ${action} user ini?`)) return

        const { error } = await supabase.from('profiles').update({ status: newStatus }).eq('id', id)
        if (error) alert('Gagal update: ' + error.message)
        else fetchCoaches()
    }

    const demoteToMember = async (id) => {
        if (!confirm('Apakah Anda yakin ingin mengubah coach ini menjadi Anggota Biasa?')) return
        const { error } = await supabase.from('profiles').update({ role: 'member' }).eq('id', id)
        if (error) alert('Gagal mengubah role: ' + error.message)
        else fetchCoaches()
    }

    const handleResetPassword = (user) => {
        setResettingUser(user)
    }

    const deleteUser = async (id, name) => {
        if (!confirm(`PERINGATAN: Menghapus Pelatih "${name}" akan menghapus SELURUH data terkait (laporan, absensi pelatih, dan absensi murid yang pernah diinput). Tindakan ini tidak dapat dibatalkan.\n\nApakah Anda yakin?`)) return

        setLoading(true)
        try {
            // 1. Clean up coach_attendance
            await supabase.from('coach_attendance').delete().eq('coach_id', id)

            // 2. Clean up coach_reports
            await supabase.from('coach_reports').delete().eq('coach_id', id)

            // 3. Clean up instruction_reads
            await supabase.from('instruction_reads').delete().eq('coach_id', id)

            // 4. Clean up member_attendance records entered by this coach
            await supabase.from('member_attendance').delete().eq('coach_id', id)

            // 5. Finally delete from profiles
            const { error } = await supabase.from('profiles').delete().eq('id', id)

            if (error) throw error

            alert(`Berhasil menghapus pelatih: ${name}`)
            fetchCoaches()
        } catch (err) {
            console.error('Delete error:', err)
            alert('Gagal menghapus pelatih: ' + (err.message || 'Terjadi kesalahan saat menghapus data.'))
            setLoading(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Loading coaches...</div>

    return (
        <>
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 animate-slideIn">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-white">Manajemen Pelatih <span className="text-blue-400 ml-2">({coaches.length})</span></h3>
                    <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
                        + Tambah Pelatih
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-slate-200">
                        <thead className="border-b border-slate-700 text-slate-400 text-sm">
                            <tr>
                                <th className="pb-4 font-semibold">Nama Pelatih</th>
                                <th className="pb-4 font-semibold text-xs">Email</th>
                                <th className="pb-4 font-semibold">Info</th>
                                <th className="pb-4 font-semibold">Spesialisasi</th>
                                <th className="pb-4 font-semibold">Status</th>
                                <th className="pb-4 font-semibold">Telepon</th>
                                <th className="pb-4 font-semibold text-right">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {coaches.length === 0 ? (
                                <tr><td colSpan="5" className="py-8 text-center text-slate-500">Belum ada pelatih.</td></tr>
                            ) : coaches.map(c => {
                                const isVerified = (c.status || '').toLowerCase() === 'active'
                                return (
                                    <tr key={c.id} className="hover:bg-slate-700/30 transition-colors">
                                        <td className="py-4">
                                            <div className="flex flex-col">
                                                <span className="font-medium text-white">{c.full_name}</span>
                                                {c.role === 'head_coach' ? (
                                                    <span className="text-[10px] uppercase tracking-wider font-black text-blue-400 mt-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse"></span> Kepala Pelatih
                                                    </span>
                                                ) : (
                                                    <span className="text-[10px] uppercase tracking-wider font-bold text-purple-400/80 mt-1 flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-purple-400"></span> Pelatih Program
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="py-4">
                                            <span className="text-xs text-slate-400 font-medium lowercase italic block truncate max-w-[140px]">{c.email || '-'}</span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-col text-[10px] font-bold uppercase tracking-wider gap-0.5">
                                                <span className="text-slate-300">{c.gender === 'L' ? 'Laki-laki' : c.gender === 'P' ? 'Perempuan' : '-'}</span>
                                                <span className="text-slate-500">{c.birth_date || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 text-sm text-slate-400">
                                            {(() => {
                                                const p = (c.program_pilihan || c.spesialisasi || '').toLowerCase()
                                                const map = {
                                                    pemula: 'Kelas Pemula',
                                                    dasar: 'Kelas Dasar',
                                                    menengah: 'Kelas Menengah',
                                                    prestasi: 'Kelas Prestasi',
                                                    privat: 'Kelas Privat',
                                                    fitness: 'Kelas Fitness'
                                                }
                                                return map[p] || c.position_title || c.spesialisasi || 'Umum'
                                            })()}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-2 py-1 rounded-md text-xs font-bold border ${isVerified ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                                {isVerified ? 'Aktif' : 'Tertunda'}
                                            </span>
                                        </td>
                                        <td className="py-4 text-sm text-slate-400">{c.telepon || '-'}</td>
                                        <td className="py-4 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button onClick={() => toggleHeadCoach(c.id, c.role)} className={`p-2 rounded-lg bg-slate-700 transition-colors ${c.role === 'head_coach' ? 'text-blue-400 hover:bg-blue-600/20' : 'text-slate-400 hover:hover:bg-blue-600/10'}`} title={c.role === 'head_coach' ? 'Turunkan ke Pelatih Biasa' : 'Jadikan Kepala Pelatih'}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                                </button>
                                                <button onClick={() => verifyUser(c.id, c.status)} className={`p-2 rounded-lg bg-slate-700 hover:bg-slate-600 transition-colors ${isVerified ? 'text-emerald-400' : 'text-slate-400'}`} title={isVerified ? 'Batalkan Verifikasi' : 'Verifikasi'}>
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                </button>
                                                <button onClick={() => setEditingUser(c)} className="p-2 rounded-lg bg-slate-700 text-blue-400 hover:bg-slate-600 transition-colors" title="Edit">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                                </button>
                                                <button onClick={() => demoteToMember(c.id)} className="p-2 rounded-lg bg-slate-700 text-amber-500 hover:bg-slate-600 transition-colors" title="Ubah ke Member">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                                </button>
                                                <button onClick={() => handleResetPassword(c)} className="p-2 rounded-lg bg-slate-700 text-amber-400 hover:bg-slate-600 transition-colors" title="Reset Password Manual">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                                                </button>
                                                <button onClick={() => deleteUser(c.id, c.full_name)} className="p-2 rounded-lg bg-slate-700 text-red-400 hover:bg-slate-600 transition-colors" title="Hapus">
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

            <AddCoachModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSuccess={fetchCoaches} />
            <EditUserModal isOpen={!!editingUser} onClose={() => setEditingUser(null)} user={editingUser} onSuccess={fetchCoaches} />
            <ResetPasswordModal isOpen={!!resettingUser} onClose={() => setResettingUser(null)} user={resettingUser} />
        </>
    )
}
