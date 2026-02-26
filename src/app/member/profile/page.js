'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    User,
    Mail,
    Phone,
    Calendar,
    MapPin,
    Lock,
    Save,
    Camera,
    ShieldCheck,
    CheckCircle2,
    AlertCircle,
    Download,
    CreditCard,
    X,
    Waves
} from 'lucide-react'
import ImageUpload from '@/components/admin/ImageUpload'
import { useSettings } from '@/context/SettingsContext'
import { toJpeg } from 'html-to-image'

export default function MemberProfilePage() {
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [downloading, setDownloading] = useState(false)
    const [showCardPreview, setShowCardPreview] = useState(false)
    const { settings } = useSettings()
    const [message, setMessage] = useState({ type: '', text: '' })

    // Form States
    const [formData, setFormData] = useState({
        full_name: '',
        telepon: '',
        birth_date: '',
        gender: '',
        address: '',
        avatar_url: ''
    })

    const [passwordData, setPasswordData] = useState({
        newPassword: '',
        confirmPassword: ''
    })

    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser()
            if (authUser) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()

                if (profile) {
                    setUser(profile)
                    setFormData({
                        full_name: profile.full_name || '',
                        telepon: profile.telepon || '',
                        birth_date: profile.birth_date || '',
                        gender: profile.gender || '',
                        address: profile.address || '',
                        avatar_url: profile.avatar_url || ''
                    })
                }
            }
            setLoading(false)
        }
        fetchProfile()
    }, [])

    const handleUpdateProfile = async (e) => {
        e.preventDefault()
        setSaving(true)
        setMessage({ type: '', text: '' })

        try {
            const { error } = await supabase
                .from('profiles')
                .update({
                    ...formData,
                    updated_at: new Date().toISOString()
                })
                .eq('id', user.id)

            if (error) throw error
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui! ✨' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal memperbarui profil: ' + error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleChangePassword = async (e) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'Konfirmasi kata sandi tidak cocok!' })
            return
        }

        setSaving(true)
        try {
            const { error } = await supabase.auth.updateUser({
                password: passwordData.newPassword
            })
            if (error) throw error
            setMessage({ type: 'success', text: 'Kata sandi berhasil diubah! 🔐' })
            setPasswordData({ newPassword: '', confirmPassword: '' })
        } catch (error) {
            setMessage({ type: 'error', text: 'Gagal mengubah kata sandi: ' + error.message })
        } finally {
            setSaving(false)
        }
    }

    const handleDownload = async () => {
        const node = document.getElementById('member-id-card-modern')
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
            link.download = `JSC-Member-Card-${formData.full_name?.replace(/\s+/g, '-') || 'Member'}.jpg`
            link.href = dataUrl
            link.click()
        } catch (error) {
            console.error('Error downloading member card:', error)
            alert('Gagal mendownload kartu. Mohon coba lagi.')
        } finally {
            setDownloading(false)
        }
    }

    if (loading) return <div className="p-8 text-slate-400">Memuat profil...</div>

    return (
        <div className="space-y-8 animate-fadeIn pb-20 max-w-4xl">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <User className="text-blue-500" />
                    Profil Saya
                </h1>
                <p className="text-slate-400 text-sm mt-1">
                    Kelola informasi akun dan keamanan Anda.
                </p>
            </div>

            {message.text && (
                <div className={`p-4 rounded-2xl flex items-center gap-3 animate-slideIn ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
                    <p className="font-bold text-sm tracking-tight">{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Avatar & Info Summary */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 text-center shadow-xl">
                        <div className="relative w-32 h-32 mx-auto mb-4 group font-bold">
                            <div className="w-full h-full rounded-full bg-slate-700 border-4 border-slate-600 overflow-hidden flex items-center justify-center text-slate-500">
                                {formData.avatar_url ? (
                                    <img src={formData.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                                ) : (
                                    <User size={64} />
                                )}
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <Camera size={24} className="text-white" />
                            </div>
                        </div>
                        <h2 className="text-white font-bold text-xl">{formData.full_name || 'Anggota'}</h2>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">
                            {user?.program_pilihan || 'Member JSC'}
                        </p>

                        <div className="mt-4 px-4 space-y-3">
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50"
                            >
                                {downloading ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <Download size={14} />
                                )}
                                Simpan JPG
                            </button>
                            <button
                                onClick={() => setShowCardPreview(true)}
                                className="w-full bg-slate-700 hover:bg-slate-600 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 border border-slate-600"
                            >
                                <CreditCard size={14} />
                                Lihat ID Card
                            </button>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-700 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <Phone size={16} className="text-emerald-500/50" />
                                <span>{formData.telepon || '-'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400">
                                <ShieldCheck size={16} className="text-blue-500/50" />
                                <span className="uppercase tracking-tighter font-bold italic">Member Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Forms */}
                <div className="lg:col-span-2 space-y-6">
                    {/* General Settings */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl">
                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <User size={20} className="text-blue-500" />
                            Informasi Pribadi
                        </h3>

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.full_name}
                                        onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Nomor WhatsApp</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.telepon}
                                        onChange={e => setFormData({ ...formData, telepon: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.birth_date}
                                        onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Jenis Kelamin</label>
                                    <select
                                        required
                                        value={formData.gender}
                                        onChange={e => setFormData({ ...formData, gender: e.target.value })}
                                        className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                    >
                                        <option value="">Pilih Gender</option>
                                        <option value="L">Laki-laki</option>
                                        <option value="P">Perempuan</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Alamat Domisili</label>
                                <textarea
                                    rows="3"
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium resize-none"
                                ></textarea>
                            </div>

                            <div className="space-y-4">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Foto Profil (Avatar URL)</label>
                                <ImageUpload
                                    value={formData.avatar_url}
                                    onChange={url => setFormData({ ...formData, avatar_url: url })}
                                    folder="member_profiles"
                                />
                            </div>

                            <div className="flex justify-end pt-4 font-bold">
                                <button
                                    type="submit"
                                    disabled={saving}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50 flex items-center gap-2"
                                >
                                    <Save size={18} />
                                    {saving ? 'Menyimpan...' : 'Simpan Profil'}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password */}
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8 opacity-5">
                            <Lock size={120} />
                        </div>

                        <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Lock size={20} className="text-amber-500" />
                            Keamanan Akun
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Kata Sandi Baru</label>
                                <input
                                    type="password"
                                    required
                                    placeholder="Minimal 6 karakter"
                                    value={passwordData.newPassword}
                                    onChange={e => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Konfirmasi Kata Sandi</label>
                                <input
                                    type="password"
                                    required
                                    value={passwordData.confirmPassword}
                                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium"
                                />
                            </div>

                            <div className="flex justify-start pt-2 font-bold">
                                <button
                                    type="submit"
                                    disabled={saving || !passwordData.newPassword}
                                    className="bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-xl shadow-lg active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {saving ? 'Memproses...' : 'Ubah Password'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Modern ID Card Preview Modal */}
            {showCardPreview && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
                    <div className="relative max-w-sm w-full">
                        <button
                            onClick={() => setShowCardPreview(false)}
                            className="absolute -top-12 right-0 text-white hover:text-slate-300 transition-colors p-2 bg-slate-800 rounded-full border border-slate-700 shadow-xl"
                        >
                            <X size={24} />
                        </button>

                        <div className="flex flex-col items-center gap-6">
                            <div id="member-id-card-modern" className="w-[350px] h-[580px] bg-slate-900 rounded-[2.5rem] border-[12px] border-slate-800 shadow-2xl overflow-hidden relative flex flex-col transition-all duration-500">
                                {/* Background Design */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-700 via-purple-600 to-pink-500 opacity-90"></div>
                                <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 animate-pulse-soft"></div>
                                <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl -ml-20 -mb-20"></div>

                                {/* Header Branding */}
                                <div className="relative z-10 p-6 flex flex-col items-center text-center">
                                    <div className="w-14 h-14 rounded-2xl bg-white shadow-xl flex items-center justify-center overflow-hidden mb-3 border-2 border-slate-700">
                                        {settings.club_logo ? (
                                            <img src={settings.club_logo} alt="JSC Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-blue-600 flex items-center justify-center text-white font-black text-xl">J</div>
                                        )}
                                    </div>
                                    <h2 className="text-white font-black text-base tracking-tighter leading-tight uppercase">
                                        {settings.club_name || 'JOHAN SWIMMING CLUB'}
                                    </h2>
                                    <p className="text-blue-400 text-[8px] font-black uppercase tracking-[0.3em] mt-1 italic">Official Member Card</p>
                                </div>

                                {/* Profile Photo Area */}
                                <div className="relative z-10 flex flex-col items-center px-8 mt-1">
                                    <div className="relative">
                                        <div className="w-28 h-28 rounded-3xl bg-slate-800 border-4 border-slate-700 overflow-hidden shadow-2xl relative z-10 flex items-center justify-center">
                                            {formData.avatar_url ? (
                                                <img src={formData.avatar_url} alt="Member" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-slate-800 flex items-center justify-center text-slate-600">
                                                    <CreditCard size={40} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -inset-2 bg-blue-500/20 blur-md rounded-[2.2rem] -z-10 animate-pulse"></div>
                                    </div>

                                    <div className="mt-4 text-center">
                                        <h3 className="text-white font-black text-lg tracking-tight uppercase leading-none">{formData.full_name || 'Member Name'}</h3>
                                        <div className="mt-2 flex items-center justify-center gap-2">
                                            <span className="px-3 py-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full shadow-lg shadow-blue-600/20 italic">
                                                MEMBER ID: #{user?.id?.slice(0, 5).toUpperCase()}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Body Details */}
                                <div className="relative z-10 px-8 py-2 mt-2 flex-1">
                                    <div className="grid grid-cols-2 gap-4 border-t border-slate-700/50 pt-4">
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black text-slate-300 uppercase tracking-widest">Program</p>
                                            <p className="text-white font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-tighter italic">
                                                <Waves size={10} className="text-blue-400" />
                                                {user?.program_pilihan || 'Umum'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[7px] font-black text-white/50 uppercase tracking-widest">Bergabung</p>
                                            <p className="text-white font-bold text-[10px] flex items-center gap-1.5 uppercase tracking-tighter italic">
                                                <Calendar size={10} className="text-white" />
                                                {user?.created_at ? new Date(user.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : '-'}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Verification/Authenticity Section */}
                                    <div className="mt-4 flex items-center justify-center">
                                        <div className="p-2.5 bg-slate-800/80 rounded-2xl border border-slate-700/50 flex items-center gap-3">
                                            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                                                <ShieldCheck size={16} />
                                            </div>
                                            <div className="text-left">
                                                <p className="text-[6px] font-black text-slate-400 uppercase tracking-widest leading-none">Status Anggota</p>
                                                <p className="text-emerald-400 font-bold text-[9px] uppercase italic tracking-tighter mt-0.5">Verified Active</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Bar Styling */}
                                <div className="h-2 bg-white/20 backdrop-blur-md relative z-10 w-full mt-auto flex items-center justify-center">
                                    <div className="w-16 h-0.5 bg-white/30 rounded-full"></div>
                                </div>
                            </div>

                            <div className="w-full px-4">
                                <button
                                    onClick={handleDownload}
                                    disabled={downloading}
                                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 disabled:opacity-50"
                                >
                                    {downloading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        <Download size={16} />
                                    )}
                                    Download JPG
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style jsx global>{`
                @keyframes pulse-soft {
                    0%, 100% { opacity: 0.2; transform: scale(1); }
                    50% { opacity: 0.4; transform: scale(1.05); }
                }
            `}</style>

        </div>
    )
}
