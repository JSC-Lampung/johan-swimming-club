'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Trophy,
    Award,
    Calendar,
    User,
    Printer,
    ArrowLeft,
    ShieldCheck,
    Star
} from 'lucide-react'
import { useParams, useSearchParams, useRouter } from 'next/navigation'
import { LEVEL_MAPPING } from '@/lib/constants'
import { useSettings } from '@/context/SettingsContext'

export default function PrintCertificatePage() {
    const params = useParams()
    const searchParams = useSearchParams()
    const router = useRouter()
    const { settings } = useSettings()
    const [loading, setLoading] = useState(true)
    const [member, setMember] = useState(null)
    const [levelData, setLevelData] = useState(null)

    const quarterId = searchParams.get('q')
    const year = searchParams.get('y')

    const quarters = [
        { id: '1', name: 'Triwulan I', period: 'Januari - Maret' },
        { id: '2', name: 'Triwulan II', period: 'April - Juni' },
        { id: '3', name: 'Triwulan III', period: 'Juli - September' },
        { id: '4', name: 'Triwulan IV', period: 'Oktober - Desember' }
    ]

    useEffect(() => {
        if (params.id) fetchMemberData()
    }, [params.id])

    const fetchMemberData = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', params.id)
                .single()

            if (data) {
                setMember(data)
                // Determine previous level (heuristic: if currently Dasar, previous was Pemula)
                // In a real app, this would be tracked in a history table
                const currentLevel = data.program_pilihan
                let prevLevel = '?'

                // Reverse mapping for display
                for (const [key, val] of Object.entries(LEVEL_MAPPING)) {
                    if (val.next === currentLevel) {
                        prevLevel = val.label
                        break
                    }
                }

                setLevelData({
                    current: LEVEL_MAPPING[currentLevel]?.label || currentLevel?.toUpperCase(),
                    previous: prevLevel,
                    next: LEVEL_MAPPING[LEVEL_MAPPING[currentLevel]?.next]?.label || 'Elite'
                })
            }
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handlePrint = () => {
        window.print()
    }

    if (loading) return <div className="p-20 text-center text-slate-500 font-bold animate-pulse uppercase tracking-[0.3em]">Meyiapkan Sertifikat...</div>

    const currentQuarter = quarters.find(q => q.id === quarterId)

    return (
        <div className="min-h-screen bg-slate-950 p-4 md:p-8 flex flex-col items-center">
            {/* Action Bar (Hidden on Print) */}
            <div className="w-full max-w-[210mm] mb-8 flex justify-between items-center print:hidden">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors font-black uppercase text-[10px] tracking-widest"
                >
                    <ArrowLeft size={16} /> Kembali
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-3 bg-emerald-600 hover:bg-emerald-500 text-white px-8 py-4 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl shadow-emerald-600/20 transition-all active:scale-95"
                >
                    <Printer size={18} /> Cetak Sertifikat
                </button>
            </div>

            {/* Certificate Paper */}
            <div className="certificate-paper relative w-full max-w-[210mm] aspect-[1/1.414] bg-white shadow-2xl overflow-hidden print:shadow-none print:m-0 print:border-0 border-[1px] border-slate-200 p-16 flex flex-col items-center text-center">

                {/* Background Watermark/Decorations */}
                <div className="absolute inset-0 opacity-[0.03] pointer-events-none flex items-center justify-center">
                    <Trophy size={600} className="text-blue-900" />
                </div>

                {/* Branding */}
                <div className="mb-10 relative">
                    <div className="flex flex-col items-center gap-2">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl overflow-hidden border border-slate-100">
                            {settings.club_logo ? (
                                <img src={settings.club_logo} alt="JSC Logo" className="w-full h-full object-cover" />
                            ) : (
                                <div className="bg-blue-600 w-full h-full flex items-center justify-center text-white">
                                    <Trophy size={40} />
                                </div>
                            )}
                        </div>
                        <h1 className="text-2xl font-black text-blue-900 tracking-tighter uppercase leading-none">{settings.club_name || 'Johan Swimming Club'}</h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 italic">{settings.club_slogan || 'Excellence in Every Stroke'}</p>
                    </div>
                </div>

                {/* Certificate Title */}
                <div className="space-y-2 mb-12">
                    <h2 className="text-5xl font-serif italic font-black text-slate-900 capitalize tracking-tight">Sertifikat Kelulusan Level</h2>
                    <div className="h-0.5 w-40 bg-blue-600 mx-auto rounded-full"></div>
                </div>

                {/* Body Text */}
                <div className="flex-1 space-y-10 relative">
                    <div>
                        <p className="text-slate-500 uppercase tracking-widest font-black text-[10px] mb-4">Diberikan Kepada :</p>
                        <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tight underline decoration-blue-500 decoration-4 underline-offset-8">
                            {member?.full_name}
                        </h3>
                    </div>

                    <div className="max-w-md mx-auto">
                        <p className="text-slate-600 font-medium leading-relaxed italic text-sm">
                            Telah berhasil menyelesaikan seluruh persyaratan program latihan dan evaluasi teknis serta kedisplinan pada {currentQuarter?.name} ({currentQuarter?.period}) Tahun {year}. Berdasarkan hasil penilaian evaluasi Johan Swimming Club, atlet tersebut dinyatakan :
                        </p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-slate-400 uppercase tracking-[0.2em] font-black text-[9px]">Lulus & Naik Ke Level :</p>
                        <div className="bg-blue-50 border-4 border-blue-600 p-6 rounded-3xl inline-block shadow-lg">
                            <h4 className="text-3xl font-black text-blue-700 uppercase tracking-tight">
                                {levelData?.current}
                            </h4>
                        </div>
                    </div>

                    {/* Meta Data */}
                    <div className="flex justify-center gap-12 pt-10">
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">ID Reg</p>
                            <p className="text-xs font-bold text-slate-800">#{member?.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Periode</p>
                            <p className="text-xs font-bold text-slate-800">{year}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-[9px] font-black uppercase text-slate-400">Status</p>
                            <p className="text-xs font-bold text-emerald-600">VERIFIED</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Signatures */}
                <div className="w-full flex justify-between items-end pt-12 pb-6 px-10 relative">
                    <div className="text-left space-y-1">
                        <p className="text-[10px] font-bold text-slate-400">Dikeluarkan pada :</p>
                        <p className="text-xs font-black text-slate-800">{new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>

                    <div className="flex flex-col items-center">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-wider">Kepala Pelatih</p>
                        <p className="text-[8px] font-bold text-slate-400 uppercase italic">Johan Swimming Club</p>
                    </div>

                    {/* Decorative Stamp */}
                    <div className="absolute right-10 bottom-24 opacity-20 rotate-[-15deg]">
                        <div className="w-24 h-24 border-4 border-blue-600 rounded-full flex flex-col items-center justify-center p-2">
                            <ShieldCheck size={32} className="text-blue-600 mb-1" />
                            <p className="text-[8px] font-black text-blue-700 leading-none">STAMP OF</p>
                            <p className="text-[8px] font-black text-blue-700 leading-none">APPROVAL</p>
                        </div>
                    </div>
                </div>

                {/* Corner Accents removed as per user request */}
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: auto;
                        margin: 0mm;
                    }
                    body {
                        background: white !important;
                        margin: 0 !important;
                        padding: 0 !important;
                    }
                    /* Hide everything by default */
                    body * {
                        visibility: hidden !important;
                    }
                    /* Show only the certificate paper and its children */
                    .certificate-paper, .certificate-paper * {
                        visibility: visible !important;
                    }
                    .certificate-paper {
                        position: fixed !important;
                        left: 0 !important;
                        top: 0 !important;
                        width: 210mm !important;
                        height: 297mm !important;
                        margin: 0 !important;
                        padding: 20mm !important;
                        border: none !important;
                        box-shadow: none !important;
                        box-sizing: border-box !important;
                    }
                    /* Action bar must stay hidden */
                    .print\:hidden {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
