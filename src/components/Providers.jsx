
'use client'
import { UIProvider } from '@/context/UIContext'
import { SettingsProvider } from '@/context/SettingsContext'
import ShareModal from '@/components/ShareModal'

export function Providers({ children }) {
    return (
        <SettingsProvider>
            <UIProvider>
                {children}
                <ShareModal />
            </UIProvider>
        </SettingsProvider>
    )
}
