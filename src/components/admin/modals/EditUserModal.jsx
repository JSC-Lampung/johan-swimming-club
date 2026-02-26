
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { updateUserEmailAdmin } from '@/app/actions/authActions'

export default function EditUserModal({ isOpen, onClose, user, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', program: '', birth_date: '', gender: '', position: '', avatar: '', status: 'active'
    })

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.full_name || '',
                email: user.email || '',
                phone: user.telepon || user.phone || '',
                program: user.program_pilihan || user.program || '',
                birth_date: user.birth_date || '',
                gender: user.gender || '',
                position: user.position_title || '',
                avatar: user.avatar_url || '',
                status: user.status || 'active'
            })
        }
    }, [user])

    if (!isOpen || !user) return null

    const isCoach = user.role === 'coach'

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const updates = {
                full_name: formData.name,
                email: formData.email,
                telepon: formData.phone,
                birth_date: formData.birth_date,
                gender: formData.gender,
                avatar_url: formData.avatar,
                status: formData.status,
                updated_at: new Date().toISOString()
            }

            // Update Email in Auth if changed
            if (formData.email !== user.email) {
                const res = await updateUserEmailAdmin(user.id, formData.email)
                if (!res.success) throw new Error('Gagal update Auth email: ' + res.error)
            }

            // Use 'program_pilihan' for both coach and member now, as requested
            // For coaches, we also auto-generate a title if they selected a program
            updates.program_pilihan = formData.program

            if (isCoach) {
                if (formData.program) {
                    const programMap = {
                        pemula: 'Kelas Pemula',
                        dasar: 'Kelas Dasar',
                        menengah: 'Kelas Menengah',
                        prestasi: 'Kelas Prestasi',
                        privat: 'Kelas Privat',
                        fitness: 'Kelas Fitness (Umum)'
                    }
                    const programLabel = programMap[formData.program] || 'Umum'
                    updates.position_title = `Pelatih ${programLabel}`
                } else {
                    updates.position_title = formData.position
                }
            }

            const { error } = await supabase
                .from('profiles')
                .update(updates)
                .eq('id', user.id)

            if (error) throw error

            alert('Data berhasil diperbarui!')
            onSuccess()
            onClose()
        } catch (err) {
            alert('Gagal menyimpan perubahan: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fadeIn overflow-y-auto max-h-[90vh] custom-scrollbar">
                <h3 className="text-2xl font-bold text-white mb-6">Edit Data User</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
                        <input type="text" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Alamat Email</label>
                        <input type="email" required
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Nomor Telepon</label>
                        <input type="tel" required
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Tgl Lahir</label>
                            <input type="date" required
                                value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Gender</label>
                            <select required
                                value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                                <option value="">Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Status Akun</label>
                        <select
                            value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                            <option value="active">Aktif (Verified)</option>
                            <option value="pending">Non-Aktif (Pending)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">{isCoach ? 'Program Melatih' : 'Program Anggota'}</label>
                        <select
                            value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                            <option value="">Pilih Program</option>
                            <option value="pemula">Kelas Pemula</option>
                            <option value="dasar">Kelas Dasar</option>
                            <option value="menengah">Kelas Menengah</option>
                            <option value="prestasi">Kelas Prestasi</option>
                            <option value="privat">Kelas Privat Latihan Personal</option>
                            <option value="fitness">Kelas Fitness (Umum)</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Avatar URL (Opsional)</label>
                        <input type="text"
                            value={formData.avatar} onChange={e => setFormData({ ...formData, avatar: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="https://..." />
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button type="submit" disabled={loading}
                            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70">
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                        <button type="button" onClick={onClose}
                            className="px-6 py-3 rounded-lg border border-slate-600 text-slate-300 font-medium hover:bg-slate-700 transition-all">
                            Batal
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
