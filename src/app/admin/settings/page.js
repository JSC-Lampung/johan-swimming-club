
'use client'
import { useState } from 'react'
import SiteSettingsForm from '@/components/admin/SiteSettingsForm'
import ProfileSettingsForm from '@/components/admin/ProfileSettingsForm'

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('site')

    return (
        <div className="space-y-8 pb-12">
            {/* Tabs */}
            <div className="flex items-center gap-2 p-1 bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700/50 w-fit">
                <button
                    onClick={() => setActiveTab('site')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'site' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Konfigurasi Site
                </button>
                <button
                    onClick={() => setActiveTab('profile')}
                    className={`px-6 py-2.5 rounded-xl font-bold transition-all ${activeTab === 'profile' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                >
                    Profil & Keamanan
                </button>
            </div>

            {/* Content */}
            <div className="transition-all duration-300">
                {activeTab === 'site' ? <SiteSettingsForm /> : <ProfileSettingsForm />}
            </div>
        </div>
    )
}
