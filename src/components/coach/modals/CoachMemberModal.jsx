
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { updateUserEmailAdmin } from '@/app/actions/authActions'
import { X } from 'lucide-react'

export default function CoachMemberModal({ isOpen, onClose, member, coachProfile, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', birth_date: '', gender: '', password: '', status: 'active'
    })

    useEffect(() => {
        if (member) {
            setFormData({
                name: member.full_name || '',
                email: member.email || '',
                phone: member.telepon || member.phone || '',
                birth_date: member.birth_date || '',
                gender: member.gender || '',
                status: member.status || 'active',
                password: '' // Don't show password for edit
            })
        } else {
            setFormData({
                name: '', email: '', phone: '', birth_date: '', gender: '', password: '', status: 'active'
            })
        }
    }, [member, isOpen])

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (member) {
                // EDIT MODE
                const updates = {
                    full_name: formData.name,
                    email: formData.email,
                    telepon: formData.phone,
                    birth_date: formData.birth_date,
                    gender: formData.gender,
                    status: formData.status,
                    updated_at: new Date().toISOString()
                }

                if (formData.email !== member.email) {
                    const res = await updateUserEmailAdmin(member.id, formData.email)
                    if (!res.success) throw new Error('Gagal update Auth email: ' + res.error)
                }

                const { error } = await supabase
                    .from('profiles')
                    .update(updates)
                    .eq('id', member.id)

                if (error) throw error
                alert('Data anggota berhasil diperbarui!')
            } else {
                // ADD MODE
                if (!formData.password || formData.password.length < 6) {
                    throw new Error('Password minimal 6 karakter.')
                }

                const { data, error: signUpError } = await supabase.auth.signUp({
                    email: formData.email,
                    password: formData.password,
                    options: {
                        data: {
                            full_name: formData.name,
                            phone: formData.phone,
                            birth_date: formData.birth_date,
                            gender: formData.gender,
                            role: 'member'
                        }
                    }
                })

                if (signUpError) throw signUpError

                // Profile is automatically created by trigger usually, but we update the program
                const { error: profileError } = await supabase
                    .from('profiles')
                    .update({
                        status: 'active',
                        email: formData.email,
                        telepon: formData.phone,
                        birth_date: formData.birth_date,
                        gender: formData.gender,
                        program_pilihan: coachProfile.program_pilihan
                    })
                    .eq('id', data.user.id)

                if (profileError) console.warn('Profile update error:', profileError)
                alert('Anggota berhasil ditambahkan ke program ' + coachProfile.program_pilihan.toUpperCase())
            }

            onSuccess()
            onClose()
        } catch (err) {
            alert('Gagal: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-3xl w-full max-w-md p-8 shadow-2xl animate-fadeIn custom-scrollbar">
                <button onClick={onClose} className="absolute top-6 right-6 text-slate-500 hover:text-white transition-colors">
                    <X size={24} />
                </button>

                <h3 className="text-2xl font-bold text-white mb-2">{member ? 'Edit Data Anggota' : 'Tambah Anggota Baru'}</h3>
                <p className="text-slate-400 text-sm mb-8">Program: <span className="text-blue-400 font-bold">{coachProfile?.program_pilihan?.toUpperCase()}</span></p>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                        <input type="text" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Contoh: Budi Santoso" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Email</label>
                        <input type="email" required
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="budi@email.com" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nomor Telepon</label>
                        <input type="tel" required
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="08..." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tgl Lahir</label>
                            <input type="date" required
                                value={formData.birth_date} onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                            <select required value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all">
                                <option value="">Pilih</option>
                                <option value="L">Laki-laki</option>
                                <option value="P">Perempuan</option>
                            </select>
                        </div>
                    </div>

                    {!member && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Password Awal</label>
                            <input type="password" required
                                value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all" placeholder="Min. 6 Karakter" />
                        </div>
                    )}

                    {member && (
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Status Keaktifan</label>
                            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all">
                                <option value="active">Aktif</option>
                                <option value="pending">Tertunda</option>
                            </select>
                        </div>
                    )}

                    <div className="pt-6 flex flex-col gap-3">
                        <button type="submit" disabled={loading}
                            className="w-full px-6 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-widest text-xs hover:bg-blue-700 transition-all shadow-xl shadow-blue-600/20 disabled:opacity-50">
                            {loading ? 'Memproses...' : (member ? 'Simpan Perubahan' : 'Daftarkan Anggota')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
