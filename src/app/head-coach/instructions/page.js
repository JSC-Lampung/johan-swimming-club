
import { FileText, Info } from 'lucide-react'

export default function HeadCoachInstructionsPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 animate-fadeIn">
            <div className="p-6 bg-blue-600/10 rounded-3xl text-blue-500 shadow-xl shadow-blue-500/5">
                <FileText size={48} />
            </div>
            <div className="max-w-md">
                <h1 className="text-2xl font-black text-white uppercase tracking-tight">Instruksi Admin</h1>
                <p className="text-slate-400 text-sm mt-3 font-medium leading-relaxed">
                    Instruksi dan pengumuman dari Administrator akan muncul secara otomatis sebagai notifikasi di bagian atas layar Anda.
                </p>
            </div>
            <div className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 text-xs font-bold uppercase tracking-widest">
                <Info size={14} className="text-blue-500" />
                Selalu periksa bilah notifikasi biru
            </div>
        </div>
    )
}
