
import HeadCoachSidebar from '@/components/head-coach/HeadCoachSidebar'
import HeadCoachGuard from '@/components/head-coach/HeadCoachGuard'
import AdminInstructionNotification from '@/components/coach/AdminInstructionNotification'

export default function HeadCoachLayout({ children }) {
    return (
        <HeadCoachGuard>
            <div className="flex h-screen bg-slate-950 overflow-hidden">
                <HeadCoachSidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-slate-950 overflow-hidden relative">
                    <AdminInstructionNotification />
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8 custom-scrollbar pt-16 lg:pt-8 relative">
                        {/* Background elements */}
                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>
                        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-cyan-600/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

                        <div className="max-w-7xl mx-auto min-h-full">
                            {children}
                        </div>
                    </div>
                </main>
            </div>
        </HeadCoachGuard>
    )
}
