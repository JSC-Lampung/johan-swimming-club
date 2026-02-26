
'use client'
import { UIProvider } from '@/context/UIContext'
import { SettingsProvider } from '@/context/SettingsContext'

export function Providers({ children }) {
    return (
        <SettingsProvider>
            <UIProvider>{children}</UIProvider>
        </SettingsProvider>
    )
}
