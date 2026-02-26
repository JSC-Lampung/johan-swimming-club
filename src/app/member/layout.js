'use client'
import MemberSidebar from '@/components/member/MemberSidebar'
import MemberGuard from '@/components/member/MemberGuard'

export default function MemberLayout({ children }) {
    return (
        <MemberGuard>
            <div className="flex h-screen bg-slate-900 overflow-hidden">
                <MemberSidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pt-16 lg:pt-8">
                        {children}
                    </div>
                </main>
            </div>
        </MemberGuard>
    )
}
