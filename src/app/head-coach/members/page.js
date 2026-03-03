
import MemberTable from '@/components/admin/MemberTable'

export default function HeadCoachMembersPage() {
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-black text-white tracking-tight uppercase">Manajemen Seluruh Anggota</h1>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">Data lengkap seluruh atlet dari semua program Johan Swimming Club.</p>
            </div>
            <MemberTable />
        </div>
    )
}
