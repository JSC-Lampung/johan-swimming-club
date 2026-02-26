
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminGuard from '@/components/admin/AdminGuard'

export default function AdminLayout({ children }) {
    return (
        <AdminGuard>
            <div className="flex h-screen bg-slate-900 overflow-hidden">
                <AdminSidebar />
                <main className="flex-1 flex flex-col min-w-0 bg-slate-900 overflow-hidden relative">
                    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar pt-16 lg:pt-8">
                        {children}
                    </div>
                </main>
            </div>
        </AdminGuard>
    )
}
