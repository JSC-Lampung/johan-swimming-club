
'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useUI } from '@/context/UIContext'
import { supabase } from '@/lib/supabaseClient'
import { useSettings } from '@/context/SettingsContext'

export default function MemberModal() {
    const { isMemberModalOpen, initialTab, closeMemberModal } = useUI()
    const { settings } = useSettings()
    const [activeTab, setActiveTab] = useState('login')

    useEffect(() => {
        if (isMemberModalOpen) {
            setActiveTab(initialTab || 'login')
            // Reset form states when modal opens
            setLoginEmail('')
            setLoginPass('')
            setRegName('')
            setRegEmail('')
            setRegPhone('')
            setRegBirthDate('')
            setRegGender('')
            setRegPass('')
            setRegProgram('')
        }
    }, [isMemberModalOpen, initialTab])

    const [loading, setLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false)
    const [successData, setSuccessData] = useState(null)

    // Login Form State
    const [loginEmail, setLoginEmail] = useState('')
    const [loginPass, setLoginPass] = useState('')

    // Register Form State
    const [regName, setRegName] = useState('')
    const [regEmail, setRegEmail] = useState('')
    const [regPhone, setRegPhone] = useState('')
    const [regBirthDate, setRegBirthDate] = useState('')
    const [regGender, setRegGender] = useState('')
    const [regPass, setRegPass] = useState('')
    const [regRole, setRegRole] = useState('member')
    const [regProgram, setRegProgram] = useState('')

    const router = useRouter()

    if (!isMemberModalOpen) return null

    const handleLogin = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error: authError } = await supabase.auth.signInWithPassword({ email: loginEmail, password: loginPass })

            if (authError) throw authError
            if (!data?.user) throw new Error('Email atau password salah atau akun tidak ditemukan.')

            const user = data.user

            const { data: profile, error: profileError } = await supabase
                .from('profiles')
                .select('role, status')
                .eq('id', user.id)
                .single()

            if (profileError) throw new Error('Data profile tidak ditemukan.')

            // Check if account is active (ignore this for admin)
            if (profile.role !== 'admin' && (profile.status || '').toLowerCase() !== 'active') {
                await supabase.auth.signOut()
                throw new Error('Akun Anda belum aktif / sedang diblokir. Mohon hubungi Admin untuk aktivasi.')
            }

            // Clear state before redirect
            setLoginEmail('')
            setLoginPass('')

            closeMemberModal()
            // Redirect based on role
            if (profile.role === 'admin') router.push('/admin')
            else if (profile.role === 'coach') router.push('/coach')
            else router.push('/member')

        } catch (err) {
            alert('Login Gagal: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const { data, error } = await supabase.auth.signUp({
                email: regEmail,
                password: regPass,
                options: { data: { full_name: regName, phone: regPhone, birth_date: regBirthDate, gender: regGender, program: regProgram, role: regRole } }
            })

            if (error) throw error
            if (!data?.user) throw new Error('Gagal membuat akun. Silakan coba lagi.')

            // Sync profile role
            await supabase.from('profiles').upsert({
                id: data.user.id,
                role: regRole,
                email: regEmail,
                full_name: regName,
                telepon: regPhone,
                birth_date: regBirthDate,
                gender: regGender,
                program_pilihan: regProgram,
                status: 'pending' // Ensure new registrations are pending
            })

            const adminPhone = '6285269062216'
            const waMessage = encodeURIComponent(`Halo Admin, murid baru mendaftar.\n\nNama: ${regName}\nRole: ${regRole.toUpperCase()}\nEmail: ${regEmail}`)
            const waUrl = `https://wa.me/${adminPhone}?text=${waMessage}`

            setSuccessData({ waUrl })
            setShowSuccess(true)

        } catch (err) {
            alert('Pendaftaran Gagal: ' + err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[1000] overflow-y-auto">
            <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md" onClick={closeMemberModal}></div>
            <div className="relative min-h-full w-full flex items-center justify-center p-4 pointer-events-none">
                <div className="relative bg-white rounded-3xl shadow-2xl max-w-[360px] w-full overflow-visible z-10 animate-fadeIn border border-white/20 pointer-events-auto my-14 transition-all duration-300">

                    {!showSuccess && (
                        <button
                            onClick={closeMemberModal}
                            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-all duration-300 hover:rotate-90 z-20"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    )}

                    <div className="p-6">
                        {!showSuccess ? (
                            <>
                                {/* Logo Section */}
                                <div className="flex flex-col items-center mb-10 animate-fadeIn">
                                    <div className="relative mb-4">
                                        <div className="w-20 h-20 rounded-[2rem] overflow-hidden flex items-center justify-center bg-white shadow-2xl shadow-blue-500/20 border border-slate-100 ring-8 ring-slate-50/50">
                                            {settings.club_logo ? (
                                                <img src={settings.club_logo} alt="Logo" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-400 flex items-center justify-center">
                                                    <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                        <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-cyan-400 rounded-[2.5rem] opacity-20 blur-md -z-10"></div>
                                    </div>
                                    <h2 className="font-display text-xl font-black text-slate-900 tracking-tight text-center leading-tight">
                                        {settings.club_name.split(' ').map((word, i) => (
                                            <span key={i} className={i === 0 ? "text-blue-600" : ""}>{word}{' '}</span>
                                        ))}
                                    </h2>
                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-2">Member Portal</p>
                                </div>

                                <div className="flex gap-2 mb-6 p-1 bg-slate-50 rounded-xl relative">
                                    <button
                                        onClick={() => setActiveTab('login')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all z-10 ${activeTab === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Masuk
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('register')}
                                        className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all z-10 ${activeTab === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                                    >
                                        Daftar
                                    </button>
                                </div>

                                {activeTab === 'login' ? (
                                    <form onSubmit={handleLogin} className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                                            <div className="relative group">
                                                <input type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} required
                                                    className="w-full pl-4 pr-3 py-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-900 font-medium" placeholder="nama@email.com" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-bold text-slate-700 ml-1">Kata Sandi</label>
                                            <div className="relative group">
                                                <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} required
                                                    className="w-full pl-4 pr-3 py-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:bg-white transition-all outline-none text-slate-900 font-medium" placeholder="••••••••" />
                                            </div>
                                        </div>
                                        <button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 rounded-xl font-bold text-sm shadow-lg hover:shadow-blue-500/40 transition-all disabled:opacity-70">
                                            {loading ? 'Memverifikasi...' : 'Masuk Sekarang'}
                                        </button>
                                    </form>
                                ) : (
                                    <form onSubmit={handleRegister} className="space-y-3">
                                        <input type="text" value={regName} onChange={e => setRegName(e.target.value)} required placeholder="Nama Lengkap" className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                        <input type="email" value={regEmail} onChange={e => setRegEmail(e.target.value)} required placeholder="nama@email.com" className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                        <input type="tel" value={regPhone} onChange={e => setRegPhone(e.target.value)} required placeholder="Nomor Telepon" className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />

                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Tanggal Lahir</label>
                                            <input type="date" value={regBirthDate} onChange={e => setRegBirthDate(e.target.value)} required className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <label className={`flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border-2 transition-colors ${regGender === 'L' ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                                                <input type="radio" name="gender" value="L" checked={regGender === 'L'} onChange={() => setRegGender('L')} required className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700">Laki-laki</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border-2 transition-colors ${regGender === 'P' ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                                                <input type="radio" name="gender" value="P" checked={regGender === 'P'} onChange={() => setRegGender('P')} required className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700">Perempuan</span>
                                            </label>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2">
                                            <label className={`flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border-2 transition-colors ${regRole === 'member' ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                                                <input type="radio" name="role" value="member" checked={regRole === 'member'} onChange={() => setRegRole('member')} className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700">Anggota</span>
                                            </label>
                                            <label className={`flex items-center gap-2 p-3 bg-slate-50 rounded-xl cursor-pointer border-2 transition-colors ${regRole === 'coach' ? 'border-blue-500 bg-blue-50' : 'border-transparent'}`}>
                                                <input type="radio" name="role" value="coach" checked={regRole === 'coach'} onChange={() => setRegRole('coach')} className="w-4 h-4 text-blue-600" />
                                                <span className="text-xs font-bold text-slate-700">Pelatih</span>
                                            </label>
                                        </div>

                                        {regRole === 'member' && (
                                            <select value={regProgram} onChange={e => setRegProgram(e.target.value)} className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none">
                                                <option value="">Pilih Program</option>
                                                <option value="pemula">Kelas Pemula</option>
                                                <option value="dasar">Kelas Dasar</option>
                                                <option value="menengah">Kelas Menengah</option>
                                                <option value="prestasi">Kelas Prestasi</option>
                                                <option value="privat">Kelas Privat Latihan Personal</option>
                                                <option value="fitness">Kelas Fitness (Umum)</option>
                                            </select>
                                        )}

                                        <input type="password" value={regPass} onChange={e => setRegPass(e.target.value)} required placeholder="Kata Sandi Baru" className="w-full p-3 text-sm bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500/20 outline-none" />

                                        <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-lg mt-1 disabled:opacity-70">
                                            {loading ? 'Memproses...' : 'Daftar Sekarang'}
                                        </button>
                                    </form>
                                )}
                            </>
                        ) : (
                            <div className="text-center space-y-5 py-2 animate-fadeIn">
                                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                                </div>
                                <h2 className="font-display text-xl font-bold text-slate-900">Pendaftaran Berhasil!</h2>
                                <p className="text-slate-600 text-xs leading-relaxed px-2">Akun Anda telah dibuat. Silakan hubungi Admin via WhatsApp untuk aktivasi.</p>
                                <div className="space-y-3 pt-2">
                                    <a href={successData?.waUrl} target="_blank" className="flex items-center justify-center gap-2 w-full bg-emerald-500 text-white py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg">
                                        Hubungi Admin via WA
                                    </a>
                                    <button onClick={() => window.location.reload()} className="w-full bg-slate-100 text-slate-600 py-3 rounded-xl font-medium hover:bg-slate-200 transition-all">Selesai</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
