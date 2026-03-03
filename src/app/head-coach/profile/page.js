'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { User, Phone, Mail, Lock, Save, Camera, Globe, MapPin, Download, Waves, Calendar, ShieldCheck, CreditCard, X } from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'
import { useSettings } from '@/context/SettingsContext'
import { toJpeg } from 'html-to-image'

export default function HeadCoachProfilePage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [user, setUser] = useState(null)
    const [profile, setProfile] = useState(null)
    const { settings } = useSettings()
    const [downloading, setDownloading] = useState(false)
    const [formData, setFormData] = useState({
        full_name: '',
        telepon: '',
        birth_date: '',
        gender: '',
        avatar_url: ''
    })
    const [newPass, setNewPass] = useState('')
    const [showCardPreview, setShowCardPreview] = useState(false)

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
                    setProfile(profile)
                    setFormData({
                        full_name: profile.full_name || '',
                        telepon: profile.telepon || '',
                        birth_date: profile.birth_date || '',
                        gender: profile.gender || '',
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
                    birth_date: formData.birth_date,
                    gender: formData.gender,
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

    const handleDownload = async () => {
        const node = document.getElementById('coach-id-card-modern')
        if (!node) return

        setDownloading(true)
        try {
            await new Promise(resolve => setTimeout(resolve, 500))
            const dataUrl = await toJpeg(node, {
                quality: 0.95,
                pixelRatio: 3,
                backgroundColor: '#0f172a'
            })

            const link = document.createElement('a')
            link.download = `JSC-Head-Coach-Card-${formData.full_name?.replace(/\s+/g, '-') || 'Head-Coach'}.jpg`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Error downloading Head Coach card:', error)
            alert('Gagal mendownload kartu. Mohon coba lagi.')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return <div className="p-8 text-slate-400">Memuat profil...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-4xl">
            <div className="relative overflow-hidden p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 blur-[100px] rounded-full -mr-20 -mt-20"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-600/10 blur-[100px] rounded-full -ml-20 -mb-20"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-black text-white flex items-center gap-4 uppercase tracking-tight">
                        <div className="p-3 bg-blue-600/20 rounded-2xl border border-blue-500/20">
                            <User className="text-blue-500" size={28} />
                        </div>
                        Profil Kepala Pelatih
                    </h1>
                    <p className="text-slate-400 text-sm mt-3 ml-16 font-medium">
                        Kelola informasi akun dan pengaturan keamanan panel Kepala Pelatih Anda.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Info Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 text-center shadow-2xl relative group">
                        <div className="relative w-40 h-40 mx-auto mb-6">
                            <div className="w-full h-full rounded-3xl bg-slate-800 border-4 border-slate-700/50 overflow-hidden flex items-center justify-center text-slate-500 shadow-inner group-hover:scale-[1.02] transition-transform duration-500">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={80} />
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 p-3 bg-blue-600 rounded-2xl border-4 border-slate-900 text-white shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                <Camera size={18} />
                            </div>
                        </div>

                        <h2 className="text-white font-black text-2xl tracking-tight uppercase leading-none">{formData.full_name || 'Kepala Pelatih'}</h2>
                        <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em] mt-3 bg-blue-500/10 py-1.5 px-3 rounded-full border border-blue-500/20 inline-block">
                            {profile?.position_title || 'Head Coach JSC'}
                        </p>

                        <div className="mt-8 space-y-3">
                            <button
                                onClick={() => setShowCardPreview(true)}
                                className="w-full bg-slate-800 hover:bg-slate-700 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 border border-slate-700 shadow-lg active:scale-95"
                            >
                                <CreditCard size={16} className="text-blue-500" />
                                Review ID Card
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-500/20 active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Download size={16} />
                                )}
                                Download Card
                            </button>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 space-y-4 text-left">
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-7">Email Akun</span>
                                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-white/5">
                                    <Mail size={14} className="text-blue-500 shrink-0" />
                                    <span className="truncate">{user?.email}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-1">
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-7">Hubungi Pelatih</span>
                                <div className="flex items-center gap-3 text-xs text-slate-300 bg-slate-800/50 p-2.5 rounded-xl border border-white/5">
                                    <Phone size={14} className="text-emerald-500 shrink-0" />
                                    <span>{formData.telepon || '-'}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-8">
                    {/* General Settings */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none">
                            <User size={150} />
                        </div>

                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
                            <div className="p-2.5 bg-blue-600/10 rounded-xl border border-blue-500/10">
                                <User size={20} className="text-blue-500" />
                            </div>
                            Data Personal
                        </h3>

                        <form onSubmit={handleUpdateProfile} className="space-y-8 relative z-10">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Masukkan nama lengkap"
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Whatsapp Pelatih</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="Contoh: 081234..."
                                        value={formData.telepon}
                                        onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                                        className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.birth_date}
                                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-inner"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Gender</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-blue-500 transition-all font-bold text-sm shadow-inner"
                                    >
                                        <option value="">Pilih Gender</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-4 bg-slate-800/50 p-6 rounded-[2rem] border border-white/5 shadow-inner">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Update Foto Profil (Sistem Cloud)</label>
                                <ImageUpload
                                    value={formData.avatar_url}
                                    onChange={url => setFormData({ ...formData, avatar_url: url })}
                                    folder="coach_profiles"
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-2xl shadow-xl shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-3 text-xs font-black uppercase tracking-widest"
                                >
                                    <Save size={18} />
                                    {saving ? 'Processing...' : 'Simpan Pembaruan'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-slate-900 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-10 opacity-5 grayscale pointer-events-none group-hover:scale-110 transition-transform duration-700 leading-none">
                            <Lock size={150} />
                        </div>

                        <h3 className="text-xl font-black text-white mb-8 flex items-center gap-4 uppercase tracking-tighter">
                            <div className="p-2.5 bg-red-600/10 rounded-xl border border-red-500/10">
                                <Lock size={20} className="text-red-500" />
                            </div>
                            Proteksi Akun
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-8 max-w-md relative z-10">
                            <div className="space-y-3">
                                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest ml-1">Password Baru Panel</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Gunakan minimal 6 karakter unik"
                                    value={newPass}
                                    onChange={e => setNewPass(e.target.value)}
                                    className="w-full bg-slate-800 border-2 border-slate-700/50 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-red-500/50 transition-all font-bold text-sm shadow-inner"
                                />
                                <p className="text-[8px] text-slate-500 font-bold italic tracking-wide">
                                    *Pastikan Anda mengingat password ini untuk login berikutnya.
                                </p>
                            </div>

                            <div className="flex justify-start pt-2">
                                <button
                                    type="submit"
                                    disabled={saving || !newPass}
                                    className="bg-slate-800 hover:bg-slate-700 text-white px-10 py-4 rounded-2xl shadow-lg active:scale-95 transition-all disabled:opacity-50 text-xs font-black uppercase tracking-widest border border-slate-700"
                                >
                                    {saving ? 'Changing...' : 'Update Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modern ID Card Preview Modal */}
            {showCardPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
                    <div className="relative max-w-sm w-full">
                        <button
                            onClick={() => setShowCardPreview(false)}
                            className="absolute -top-16 right-0 text-white hover:text-slate-300 transition-colors p-3 bg-slate-800 rounded-full border-4 border-slate-700 shadow-2xl active:scale-95"
                        >
                            <X size={28} />
                        </button>

                        <div className="flex flex-col items-center gap-8">
                            <div id="coach-id-card-modern" className="w-[350px] h-[580px] bg-slate-900 rounded-[2.5rem] border-[12px] border-slate-800 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden relative flex flex-col transition-all duration-500">
                                {/* Background Design */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 opacity-90"></div>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse"></div>
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.03] pointer-events-none">
                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-[size:20px_20px]"></div>
                                </div>

                                {/* Header Branding */}
                                <div className="relative z-10 p-10 flex flex-col items-center text-center">
                                    <div className="w-16 h-16 rounded-full bg-white shadow-2xl flex items-center justify-center overflow-hidden mb-4 border-4 border-slate-700">
                                        {settings.club_logo ? (
                                            <img src={settings.club_logo} alt="JSC Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl leading-none">J</div>
                                        )}
                                    </div>
                                    <h2 className="text-white font-black text-lg tracking-tighter leading-[0.9] uppercase">
                                        {settings.club_name || 'JOHAN SWIMMING CLUB'}
                                    </h2>
                                    <div className="mt-3 flex items-center gap-2 text-white/80">
                                        <div className="h-[2px] w-4 bg-white/50 rounded-full"></div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] italic">Official ID Card</p>
                                        <div className="h-[2px] w-4 bg-white/50 rounded-full"></div>
                                    </div>
                                </div>

                                {/* Profile Photo Area */}
                                <div className="relative z-10 flex flex-col items-center px-10">
                                    <div className="relative">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-slate-800 border-[6px] border-slate-700/50 overflow-hidden shadow-2xl relative z-10 flex items-center justify-center">
                                            {formData.avatar_url ? (
                                                <img src={formData.avatar_url} alt="Coach" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                                                    <User size={50} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -inset-4 bg-blue-500/30 blur-2xl rounded-full -z-10 opacity-50"></div>
                                    </div>

                                    <div className="mt-6 text-center">
                                        <h3 className="text-white font-black text-2xl tracking-tight uppercase leading-none">{formData.full_name || 'Coach Name'}</h3>
                                        <div className="mt-3 flex items-center justify-center">
                                            <span className="px-5 py-2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-500/30 italic border border-white/10">
                                                ID: KP-{user?.id?.slice(0, 5).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Details */}
                                <div className="relative z-10 px-10 mt-8 flex-1">
                                    <div className="bg-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/10 shadow-inner">
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-1.5">
                                                <p className="text-[8px] font-black text-slate-100 uppercase tracking-widest leading-none">Position</p>
                                                <p className="text-white font-black text-xs flex items-center gap-2 uppercase tracking-tighter italic">
                                                    <Waves size={12} className="text-blue-300" />
                                                    {profile?.position_title || 'Head Coach'}
                                                </p>
                                            </div>
                                            <div className="space-y-1.5">
                                                <p className="text-[8px] font-black text-slate-100 uppercase tracking-widest leading-none">Joined Since</p>
                                                <p className="text-white font-black text-xs flex items-center gap-2 uppercase tracking-tighter italic">
                                                    <Calendar size={12} className="text-white" />
                                                    {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('id-ID', { month: 'short', year: 'numeric' }) : '-'}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="mt-6 flex items-center justify-center border-t border-white/10 pt-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
                                                    <ShieldCheck size={18} />
                                                </div>
                                                <div className="text-left">
                                                    <p className="text-[7px] font-black text-slate-200 uppercase tracking-widest leading-none">Auth Status</p>
                                                    <p className="text-emerald-400 font-black text-[10px] uppercase italic tracking-[0.1em] mt-1 leading-none">Verified Staff</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Bar */}
                                <div className="p-8 relative z-10 flex flex-col items-center gap-3">
                                    <div className="flex items-center gap-1.5">
                                        {[...Array(3)].map((_, i) => (
                                            <div key={i} className="w-1 h-1 bg-white/20 rounded-full"></div>
                                        ))}
                                    </div>
                                    <p className="text-[8px] text-white/30 font-bold uppercase tracking-[0.5em] leading-none">Kepala Pelatih Profesional</p>
                                </div>
                            </div>

                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full bg-white hover:bg-slate-100 text-slate-900 px-8 py-5 rounded-[2rem] text-[11px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <div className="w-5 h-5 border-3 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
                                ) : (
                                    <Download size={20} />
                                )}
                                Simpan Versi JPG
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
}
