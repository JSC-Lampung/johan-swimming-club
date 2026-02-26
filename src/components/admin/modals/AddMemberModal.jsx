
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function AddMemberModal({ isOpen, onClose, onSuccess }) {
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', birth_date: '', gender: '', program: 'pemula', password: ''
    })

    if (!isOpen) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
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

            const { error: profileError } = await supabase
                .from('profiles')
                .update({
                    status: 'active',
                    email: formData.email,
                    telepon: formData.phone,
                    birth_date: formData.birth_date,
                    gender: formData.gender,
                    program_pilihan: formData.program
                })
                .eq('id', data.user.id)

            if (profileError) console.warn('Profile update error:', profileError)

            alert("Anggota berhasil didaftarkan secara manual!")
            onSuccess()
            onClose()
            setFormData({ name: '', email: '', phone: '', birth_date: '', gender: '', program: 'pemula', password: '' })
        } catch (err) {
            alert('Gagal menambah anggota: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-8 shadow-2xl animate-fadeIn">
                <h3 className="text-2xl font-bold text-white mb-6">Tambah Anggota Baru</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
                        <input type="text" required
                            value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="Nama Lengkap" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Email</label>
                        <input type="email" required
                            value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="email@example.com" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Nomor Telepon</label>
                        <input type="tel" required
                            value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="0812..." />
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
                        <label className="block text-slate-400 text-sm mb-2">Program</label>
                        <select required
                            value={formData.program} onChange={e => setFormData({ ...formData, program: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500">
                            <option value="pemula">Kelas Pemula</option>
                            <option value="dasar">Kelas Dasar</option>
                            <option value="menengah">Kelas Menengah</option>
                            <option value="prestasi">Kelas Prestasi</option>
                            <option value="privat">Kelas Privat Latihan Personal</option>
                            <option value="fitness">Kelas Fitness (Umum)</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Password Awal</label>
                        <input type="password" required
                            value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500" placeholder="Minimal 6 karakter" />
                    </div>
                    <div className="pt-4 flex items-center gap-3">
                        <button type="submit" disabled={loading}
                            className="flex-1 px-6 py-3 rounded-lg bg-blue-600 text-white font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 disabled:opacity-70">
                            {loading ? 'Memproses...' : 'Tambah Anggota'}
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
