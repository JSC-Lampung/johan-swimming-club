
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'

const SettingsContext = createContext()

export function SettingsProvider({ children }) {
    const [settings, setSettings] = useState({
        club_name: 'Johan Swimming Club',
        club_slogan: 'Membangun Generasi Juara Melalui Olahraga Renang',
        club_logo: '',
        club_phone: '',
        club_email: '',
        club_whatsapp: '',
        club_address: '',
        social_instagram: '',
        social_facebook: '',
        social_tiktok: '',
        social_youtube: ''
    })
    const [loading, setLoading] = useState(true)

    async function fetchSettings() {
        try {
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
            console.error('SettingsContext fetch error:', err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSettings()
    }, [])

    return (
        <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => useContext(SettingsContext)
