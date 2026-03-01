'use client'
import { createContext, useContext, useState } from 'react'

const UIContext = createContext({
    isMemberModalOpen: false,
    initialTab: 'login',
    openMemberModal: () => { },
    closeMemberModal: () => { },
    isShareModalOpen: false,
    shareData: { title: '', text: '', url: '' },
    openShareModal: () => { },
    closeShareModal: () => { }
})

export function UIProvider({ children }) {
    const [isMemberModalOpen, setIsMemberModalOpen] = useState(false)
    const [initialTab, setInitialTab] = useState('login')

    // Share Modal State
    const [isShareModalOpen, setIsShareModalOpen] = useState(false)
    const [shareData, setShareData] = useState({ title: '', text: '', url: '' })

    const openMemberModal = (tab = 'login') => {
        setInitialTab(tab)
        setIsMemberModalOpen(true)
    }
    const closeMemberModal = () => setIsMemberModalOpen(false)

    const openShareModal = (data) => {
        setShareData(data)
        setIsShareModalOpen(true)
    }
    const closeShareModal = () => setIsShareModalOpen(false)

    return (
        <UIContext.Provider value={{
            isMemberModalOpen, initialTab, openMemberModal, closeMemberModal,
            isShareModalOpen, shareData, openShareModal, closeShareModal
        }}>
            {children}
        </UIContext.Provider>
    )
}

export const useUI = () => useContext(UIContext)
