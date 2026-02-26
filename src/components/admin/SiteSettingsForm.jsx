
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import ImageUpload from './ImageUpload'

export default function SiteSettingsForm() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        club_name: 'Johan Swimming Club',
        club_slogan: 'Membangun Generasi Juara Melalui Olahraga Renang',
        club_logo: '',
        club_phone: '',
        club_email: '',
        club_whatsapp: '',
        club_address: '',
        club_chairman: '',
        social_instagram: '',
        social_facebook: '',
        social_tiktok: '',
        social_youtube: ''
    })

    async function fetchSettings() {
        try {
            // We'll use landing_contents with category 'site_config' to store these key-values
            // as it's the safest way without knowing if a new table can be created.
            const { data, error } = await supabase
                .from('landing_contents')
                .select('*')
                .eq('category', 'site_config')

            if (data && data.length > 0) {
                const newSettings = { ...settings }
                data.forEach(item => {
                    if (newSettings.hasOwnProperty(item.title)) {
                        newSettings[item.title] = item.content
                    }
                })
                setSettings(newSettings)
            }
        } catch (err) {
            console.error('Error fetching site settings:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    const handleSave = async (e) => {
        e.preventDefault()
        setSaving(true)
        try {
            // Update or Insert each setting
            const promises = Object.entries(settings).map(async ([key, value]) => {
                // Check if exists
                const { data } = await supabase
                    .from('landing_contents')
                    .select('id')
                    .eq('category', 'site_config')
                    .eq('title', key)
                    .single()

                if (data) {
                    return supabase.from('landing_contents').update({
                        content: value,
                        updated_at: new Date().toISOString()
                    }).eq('id', data.id)
                } else {
                    return supabase.from('landing_contents').insert([{
                        category: 'site_config',
                        title: key,
                        content: value,
                        is_active: true
                    }])
                }
            })

            await Promise.all(promises)
            alert('Konfigurasi berhasil disimpan!')
        } catch (err) {
            alert('Gagal menyimpan: ' + err.message)
        } finally {
            setSaving(false)
        }
    }

    if (loading) return <div className="p-8 text-center text-slate-400 font-medium overflow-hidden">Memuat konfigurasi...</div>

    return (
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-slideIn">
            {/* Club Identity */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Identitas Club</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Nama Club</label>
                        <input type="text" value={settings.club_name} onChange={e => setSettings({ ...settings, club_name: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all font-medium" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Slogan Club (Muncul di bawah Nama)</label>
                        <input type="text" value={settings.club_slogan} onChange={e => setSettings({ ...settings, club_slogan: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="Slogan club..." />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Ketua Club (Tanda Tangan Laporan)</label>
                        <input type="text" value={settings.club_chairman} onChange={e => setSettings({ ...settings, club_chairman: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="Nama Ketua Club..." />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-4">Logo Club</label>
                        <ImageUpload
                            value={settings.club_logo}
                            onChange={url => setSettings({ ...settings, club_logo: url })}
                            folder="branding"
                        />
                    </div>
                </div>
            </div>

            {/* Contact Info */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Kontak & Alamat</h3>
                </div>

                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">Telepon</label>
                            <input type="text" value={settings.club_phone} onChange={e => setSettings({ ...settings, club_phone: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" />
                        </div>
                        <div>
                            <label className="block text-slate-400 text-sm mb-2">WhatsApp</label>
                            <input type="text" value={settings.club_whatsapp} onChange={e => setSettings({ ...settings, club_whatsapp: e.target.value })}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Email</label>
                        <input type="email" value={settings.club_email} onChange={e => setSettings({ ...settings, club_email: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Alamat Lengkap</label>
                        <textarea value={settings.club_address} onChange={e => setSettings({ ...settings, club_address: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm h-20 resize-none"></textarea>
                    </div>
                </div>
            </div>

            {/* Social Media */}
            <div className="bg-slate-800 rounded-2xl p-6 border border-slate-700 shadow-lg space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-600/20 text-purple-400 flex items-center justify-center">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                    </div>
                    <h3 className="text-xl font-bold text-white">Media Sosial</h3>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Instagram (Link)</label>
                        <input type="text" value={settings.social_instagram} onChange={e => setSettings({ ...settings, social_instagram: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">Facebook (Link)</label>
                        <input type="text" value={settings.social_facebook} onChange={e => setSettings({ ...settings, social_facebook: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">TikTok (Link)</label>
                        <input type="text" value={settings.social_tiktok} onChange={e => setSettings({ ...settings, social_tiktok: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="https://tiktok.com/@..." />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-sm mb-2">YouTube (Link)</label>
                        <input type="text" value={settings.social_youtube} onChange={e => setSettings({ ...settings, social_youtube: e.target.value })}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-all text-sm" placeholder="https://youtube.com/@..." />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="lg:col-span-2 flex justify-end pt-4">
                <button type="submit" disabled={saving}
                    className="px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold shadow-xl shadow-blue-600/20 hover:bg-blue-700 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50">
                    {saving ? 'Menyimpan...' : 'Simpan Semua Pengaturan'}
                </button>
            </div>
        </form>
    )
}
