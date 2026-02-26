import AdminContentTable from '@/components/admin/AdminContentTable'
import { BarChart3 } from 'lucide-react'

export default function AdminContentsPage() {
    return (
        <div className="space-y-6">
            <div className="animate-fadeIn">
                <h2 className="text-3xl font-display font-bold text-white tracking-tight text-shadow-sm">Pusat Postingan</h2>
                <p className="text-slate-400 mt-1 italic">Kelola program latihan, berita terbaru, medali prestasi, dan profil tim pelatih di satu tempat.</p>
            </div>
            <AdminContentTable />
        </div>
    )
}
