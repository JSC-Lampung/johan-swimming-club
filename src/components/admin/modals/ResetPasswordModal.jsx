
'use client'
import { useState } from 'react'
import { resetUserPasswordAdmin } from '@/app/actions/authActions'

export default function ResetPasswordModal({ isOpen, onClose, user }) {
    const [newPassword, setNewPassword] = useState('')
    const [loading, setLoading] = useState(false)

    if (!isOpen || !user) return null

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!newPassword || newPassword.length < 6) {
            return alert('Password minimal 6 karakter!')
        }

        setLoading(true)
        try {
            const result = await resetUserPasswordAdmin(user.id, newPassword)

            if (result.success) {
                alert(`Password untuk ${user.full_name} berhasil diubah secara manual!`)
                onClose()
                setNewPassword('')
            } else {
                alert('Gagal reset password: ' + result.error)
            }
        } catch (err) {
            alert('Terjadi kesalahan sistem.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm" onClick={onClose}></div>
            <div className="relative bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-sm p-8 shadow-2xl animate-fadeIn">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" /></svg>
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Reset Password</h3>
                        <p className="text-slate-400 text-xs">Untuk {user.full_name}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Password Baru</label>
                        <input
                            type="text"
                            required
                            value={newPassword}
                            onChange={e => setNewPassword(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-amber-500 font-mono"
                            placeholder="Ketik password baru..."
                        />
                        <p className="mt-2 text-[10px] text-slate-500 italic">* Admin mengatur password secara langsung (tanpa email).</p>
                    </div>

                    <div className="pt-4 flex items-center gap-3">
                        <button type="submit" disabled={loading}
                            className="flex-1 px-6 py-3 rounded-lg bg-amber-600 text-white font-bold hover:bg-amber-700 transition-all shadow-lg active:scale-95 disabled:opacity-50">
                            {loading ? 'Memproses...' : 'Simpan Password'}
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
