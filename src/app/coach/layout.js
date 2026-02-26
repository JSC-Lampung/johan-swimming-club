
import CoachSidebar from '@/components/coach/CoachSidebar'
import CoachGuard from '@/components/coach/CoachGuard'
import AdminInstructionNotification from '@/components/coach/AdminInstructionNotification'

export default function CoachLayout({ children }) {
    return (
        <CoachGuard>
            <div className="flex h-screen bg-slate-900 overflow-hidden">
                <CoachSidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden relative">
                    <AdminInstructionNotification />
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pt-16 lg:pt-8">
                        {children}
                    </div>
                </main>
            </div>
        </CoachGuard>
    )
}
