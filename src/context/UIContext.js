
'use client'
import { createContext, useContext, useState } from 'react'

const UIContext = createContext()

export function UIProvider({ children }) {
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
    const [initialTab, setInitialTab] = useState('login')

    const openMemberModal = (tab = 'login') => {
        setInitialTab(tab)
        setIsMemberModalOpen(true)
    }
    const closeMemberModal = () => setIsMemberModalOpen(false)

    return (
        <UIContext.Provider value={{ isMemberModalOpen, initialTab, openMemberModal, closeMemberModal }}>
            {children}
        </UIContext.Provider>
    )
}

export const useUI = () => useContext(UIContext)
