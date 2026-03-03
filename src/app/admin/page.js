
import DashboardStats from '@/components/admin/DashboardStats'
import QuickActions from '@/components/admin/QuickActions'
import ActivityHighlight from '@/components/admin/ActivityHighlight'
import ProgramOverview from '@/components/admin/ProgramOverview'

export default function AdminDashboard() {
    return (
        <div className="space-y-8 pb-12">
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight">DASHBOARD ADMIN</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">Selamat datang kembali di pusat kendali Johan Swimming Club.</p>
            </div>

            <DashboardStats />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <QuickActions />
                    <ActivityHighlight />
                </div>
                <div className="lg:col-span-1">
                    <ProgramOverview />
                </div>
            </div>
        </div>
    )
}
