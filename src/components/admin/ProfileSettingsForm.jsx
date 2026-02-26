
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from './ImageUpload'

export default function ProfileSettingsForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState(null)
    const [formData, setFormData] = useState({
        full_name: '',
        telepon: '',
        avatar_url: ''
    })
    const [newPass, setNewPass] = useState('')

    async function fetchProfile() {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUser(user)
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                if (profile) {
                    setFormData({
                        full_name: profile.full_name || '',
                        telepon: profile.telepon || '',
                        avatar_url: profile.avatar_url || ''
                    })
                }
            }
        } catch (err) {
            console.error('Error fetching profile:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchProfile()
    }, [])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: formData.full_name,
                    telepon: formData.telepon,
                    avatar_url: formData.avatar_url,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error
            alert('Profil berhasil diperbaharui!')
        } catch (err) {
            alert('Gagal update profil: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (!newPass) return
        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({ password: newPass })
            if (error) throw error
            alert('Password berhasil diubah!')
            setNewPass('')
        } catch (err) {
            alert('Gagal ubah password: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400">Memuat profil...</div>

    return (
        <div className="space-y-6 animate-slideIn">
            {/* Account Info */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Profil Admin</h3>
                        <p className="text-xs text-slate-400">Kelola informasi publik Anda</p>
                    </div>
                </div>

                <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Nama Lengkap</label>
                            <input type="text" value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Email (Login)</label>
                            <input type="email" value={user?.email} disabled
                                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Nomor Telepon</label>
                            <input type="text" value={formData.telepon} onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-slate-400 text-sm mb-4">Foto Profil (Avatar)</label>
                            <ImageUpload
                                value={formData.avatar_url}
                                onChange={url => setFormData({ ...formData, avatar_url: url })}
                                folder="profiles"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end pt-2">
                        <button type="submit" disabled={saving} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-50">
                            Simpan Profil
                        </button>
                    </div>
                </form>
            </div>

            {/* Security Section */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-red-600/20 text-red-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Keamanan Akun</h3>
                        <p className="text-xs text-slate-400">Ganti password secara berkala</p>
                    </div>
                </div>

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Password Baru</label>
                        <input type="password" value={newPass} onChange={e => setNewPass(e.target.value)} placeholder="Minimal 6 karakter"
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500" />
                    </div>
                    <button type="submit" disabled={saving || !newPass} className="px-6 py-2.5 bg-slate-700 text-white rounded-xl font-bold hover:bg-slate-600 transition-all disabled:opacity-50">
                        Update Password
                    </button>
                </form>
            </div>
        </div>
    )
}
