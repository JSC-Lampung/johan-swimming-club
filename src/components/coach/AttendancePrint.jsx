'use client'
import { Printer } from 'lucide-react'

export default function AttendancePrint({ members, attendanceData, period, settings, coachName, type }) {
    if (!members || members.length === 0) return null

    const handlePrint = () => {
        window.print()
    }

    return (
        <div className="hidden print:block fixed inset-0 bg-white z-[9999] overflow-y-auto p-10 font-sans text-slate-900 border-0">
            {/* Header / Kop */}
            <div className="flex items-center justify-between border-b-4 border-slate-900 pb-6 mb-8">
                <div className="flex items-center gap-6">
                    {settings.club_logo && (
                        <img src={settings.club_logo} alt="Logo" className="w-24 h-24 object-contain" />
                    )}
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tight text-slate-900">{settings.club_name}</h1>
                        <p className="text-sm font-bold text-slate-600 italic mt-0.5">{settings.club_slogan}</p>
                        <div className="text-xs text-slate-500 mt-2 space-y-0.5 font-medium">
                            <p>{settings.club_address}</p>
                            <p>WA: {settings.club_whatsapp} | Email: {settings.club_email}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Title */}
            <div className="text-center mb-10">
                <h2 className="text-2xl font-black uppercase text-slate-900 underline underline-offset-8 decoration-4 decoration-blue-500">
                    Laporan Presensi {type === 'weekly' ? 'Mingguan' : 'Bulanan'}
                </h2>
                <p className="text-sm font-bold text-slate-500 mt-4 uppercase tracking-[0.2em]">{period}</p>
            </div>

            {/* Table */}
            <table className="w-full border-collapse border-2 border-slate-900 text-sm mb-12 shadow-sm">
                <thead>
                    <tr className="bg-slate-100 font-black uppercase tracking-wider">
                        <th className="border-2 border-slate-900 p-3 text-left w-[50px]">No</th>
                        <th className="border-2 border-slate-900 p-3 text-left">Nama Atlet</th>
                        <th className="border-2 border-slate-900 p-3 text-center w-[80px]">Hadir</th>
                        <th className="border-2 border-slate-900 p-3 text-center w-[80px]">Izin</th>
                        <th className="border-2 border-slate-900 p-3 text-center w-[80px]">Sakit</th>
                        <th className="border-2 border-slate-900 p-3 text-center w-[80px]">Alfa</th>
                        <th className="border-2 border-slate-900 p-3 text-center w-[100px]">Total Sesi</th>
                    </tr>
                </thead>
                <tbody className="font-medium">
                    {members.map((member, index) => (
                        <tr key={member.id} className="hover:bg-slate-50">
                            <td className="border-2 border-slate-900 p-3 text-center font-bold bg-slate-50">{index + 1}</td>
                            <td className="border-2 border-slate-900 p-3 font-bold">{member.full_name}</td>
                            <td className="border-2 border-slate-900 p-3 text-center text-emerald-600 font-black">{attendanceData[member.id]?.hadir || 0}</td>
                            <td className="border-2 border-slate-900 p-3 text-center text-blue-600 font-bold">{attendanceData[member.id]?.izin || 0}</td>
                            <td className="border-2 border-slate-900 p-3 text-center text-amber-600 font-bold">{attendanceData[member.id]?.sakit || 0}</td>
                            <td className="border-2 border-slate-900 p-3 text-center text-red-600 font-bold">{attendanceData[member.id]?.alfa || 0}</td>
                            <td className="border-2 border-slate-900 p-3 text-center font-black bg-slate-50">
                                {(attendanceData[member.id]?.hadir || 0) +
                                    (attendanceData[member.id]?.izin || 0) +
                                    (attendanceData[member.id]?.sakit || 0) +
                                    (attendanceData[member.id]?.alfa || 0)}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-20 text-center mt-20 px-10">
                <div className="space-y-24">
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Mengetahui,<br /><span className="text-slate-900 text-sm">Ketua Club JSC</span></p>
                    <div className="space-y-1">
                        <p className="font-black text-slate-900 border-b-2 border-slate-900 inline-block px-4">{settings.club_chairman || '(....................................)'}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Ketua Club</p>
                    </div>
                </div>
                <div className="space-y-24">
                    <p className="font-bold text-slate-500 uppercase tracking-widest text-xs">Palembang, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}<br /><span className="text-slate-900 text-sm">Pelatih Program</span></p>
                    <div className="space-y-1">
                        <p className="font-black text-slate-900 border-b-2 border-slate-900 inline-block px-4">{coachName || '(....................................)'}</p>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter">Pelatih Utama</p>
                    </div>
                </div>
            </div>

            {/* Print Footer */}
            <div className="fixed bottom-10 left-0 right-0 text-center text-[10px] text-slate-400 font-bold italic print:block hidden uppercase tracking-[0.3em]">
                Dokumen Resmi Johans Swimming Club - Dicetak Otomatis oleh Sistem JSC Portal
            </div>

            <style jsx global>{`
                @media print {
                    @page {
                        size: A4 portrait;
                        margin: 15mm;
                    }
                    body {
                        background: white !important;
                        color: black !important;
                    }
                    header, footer, nav, .no-print {
                        display: none !important;
                    }
                }
            `}</style>
        </div>
    )
}
