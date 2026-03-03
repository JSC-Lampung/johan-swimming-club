'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Printer,
    FileText,
    Calendar,
    ChevronLeft,
    Loader2,
    Users,
    Trophy
} from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PROGRAMS, LEVEL_MAPPING } from '@/lib/constants'
import Link from 'next/link'

export default function CoachPrintReportPage() {
    const { settings } = useSettings()
    const [loading, setLoading] = useState(true)
    const [coach, setCoach] = useState(null)
    const [members, setMembers] = useState([])
    const [attendanceData, setAttendanceData] = useState([])
    const [assessmentData, setAssessmentData] = useState([])

    // Filters
    const [printMode, setPrintMode] = useState('monthly') // daily, weekly, monthly, quarterly
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const printRef = useRef()

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Coach Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setCoach(profile)

            // 2. Fetch Members in Program
            const { data: memberData } = await supabase
                .from('profiles')
                .select('id, full_name, program_pilihan')
                .eq('role', 'member')
                .eq('program_pilihan', profile.program_pilihan)
                .order('full_name', { ascending: true })
            setMembers(memberData || [])

            const memberIds = (memberData || []).map(m => m.id)

            // 3. Define Date Range based on mode
            let startDate, endDate
            if (printMode === 'daily') {
                startDate = selectedDate
                endDate = selectedDate
            } else if (printMode === 'weekly') {
                const date = new Date(selectedDate)
                const day = date.getDay() || 7
                date.setHours(-24 * (day - 1))
                startDate = date.toISOString().split('T')[0]
                date.setHours(24 * 6)
                endDate = date.toISOString().split('T')[0]
            } else if (printMode === 'monthly') {
                startDate = new Date(selectedYear, selectedMonth, 1).toISOString().split('T')[0]
                endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]
            } else if (printMode === 'quarterly') {
                startDate = new Date(selectedYear, selectedMonth - 2, 1).toISOString().split('T')[0]
                endDate = new Date(selectedYear, selectedMonth + 1, 0).toISOString().split('T')[0]
            }

            // 4. Fetch Attendance
            const { data: attendance } = await supabase
                .from('member_attendance')
                .select('*')
                .in('member_id', memberIds)
                .gte('date', startDate)
                .lte('date', endDate)
            setAttendanceData(attendance || [])

            // 5. Fetch Assessments
            const { data: assessments } = await supabase
                .from('member_assessments')
                .select('*')
                .in('member_id', memberIds)
                .gte('date', startDate)
                .lte('date', endDate)
            setAssessmentData(assessments || [])

        } catch (error) {
            console.error('Error fetching data:', error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [printMode, selectedDate, selectedMonth, selectedYear])

    const handlePrint = () => {
        window.print()
    }

    const getMemberStats = (memberId) => {
        const mAttendance = attendanceData.filter(a => a.member_id === memberId)
        const presentCount = mAttendance.filter(a => a.status === 'hadir').length
        const totalSessions = mAttendance.length
        const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

        const mAssessments = assessmentData.filter(a => a.member_id === memberId)
        const latestScore = mAssessments.length > 0 ? mAssessments[0].score : '-'

        // Calculate average metric if daily
        let avgMetric = '-'
        if (printMode === 'daily') {
            const todayAttend = mAttendance.find(a => a.date === selectedDate)
            avgMetric = todayAttend?.daily_score || '-'
        } else {
            const scores = mAssessments.map(a => a.score).filter(s => s > 0)
            if (scores.length > 0) {
                avgMetric = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
            }
        }

        return { attendancePct, latestScore, avgMetric, totalSessions, presentCount }
    }

    if (loading && !coach) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs">Menyiapkan Dokumen Laporan...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            {/* UI Filters - Hidden on Print */}
            <div className="print:hidden space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Printer className="text-blue-500" />
                            Cetak Laporan Resmi
                        </h1>
                        <p className="text-slate-400 text-sm mt-1">
                            Generate dokumen laporan resmi untuk arsip klub atau wali atlet.
                        </p>
                    </div>
                    <Link href="/coach/reports" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-bold">
                        <ChevronLeft size={16} /> Kembali
                    </Link>
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div>
                        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Mode Laporan</label>
                        <select
                            value={printMode}
                            onChange={(e) => setPrintMode(e.target.value)}
                            className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm font-bold"
                        >
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                            <option value="quarterly">Triwulan (3 Bulan)</option>
                        </select>
                    </div>

                    {printMode === 'daily' || printMode === 'weekly' ? (
                        <div>
                            <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Pilih Tanggal</label>
                            <input
                                type="date"
                                value={selectedDate}
                                onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm font-bold"
                            />
                        </div>
                    ) : (
                        <>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Bulan</label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm font-bold"
                                >
                                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Tahun</label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-2 text-white focus:outline-none focus:border-blue-500 text-sm font-bold"
                                >
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        </>
                    )}

                    <div className="flex items-end">
                        <button
                            onClick={handlePrint}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest py-2 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 transition-all"
                        >
                            <Printer size={18} /> Cetak Sekarang
                        </button>
                    </div>
                </div>
            </div>

            {/* PRINT AREA */}
            <div className="bg-white text-black p-0 md:p-10 rounded-none md:rounded-2xl shadow-xl overflow-hidden print:shadow-none print:p-0 print:m-0" id="print-area">
                <style jsx global>{`
                    @media print {
                        @page {
                            size: portrait;
                            margin: 1.5cm;
                        }
                        
                        /* Reset only layout-level containers to allow multi-page flow */
                        html, body {
                            height: auto !important;
                            overflow: visible !important;
                            background: white !important;
                        }

                        /* Target specific Tailwind layout classes to break single-page constraints */
                        .h-screen, .overflow-hidden, .overflow-y-auto, main {
                            height: auto !important;
                            overflow: visible !important;
                            display: block !important;
                            position: static !important;
                        }

                        body * {
                            visibility: hidden;
                        }

                        #print-area, #print-area * {
                            visibility: visible;
                        }

                        #print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            background: white !important;
                            display: block !important;
                        }

                        /* Maintain signature layout */
                        .signature-container {
                            display: flex !important;
                            flex-direction: row !important;
                            justify-content: space-between !important;
                            visibility: visible !important;
                        }

                        .signature-box {
                            width: 40% !important;
                            text-align: center !important;
                            visibility: visible !important;
                        }

                        /* Sidebar/Navbar removal */
                        .print-hidden, nav, aside, .sidebar-class {
                            display: none !important;
                        }

                        table {
                            width: 100% !important;
                            border-collapse: collapse !important;
                        }
                        thead {
                            display: table-header-group !important;
                        }
                        tr {
                            page-break-inside: avoid !important;
                        }
                    }
                    .official-table th {
                        background-color: #f1f5f9 !important;
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                `}</style>

                {/* Official Header / Kop Surat */}
                <div className="border-b-4 border-double border-black pb-4 mb-6 flex items-center gap-6">
                    {settings.club_logo ? (
                        <img src={settings.club_logo} alt="Logo" className="w-24 h-24 object-contain" />
                    ) : (
                        <div className="w-24 h-24 bg-slate-200 flex items-center justify-center font-black text-slate-400 text-xs text-center border-2 border-slate-300">LOGO</div>
                    )}
                    <div className="flex-1 text-center pr-24">
                        <h2 className="text-2xl font-black uppercase leading-tight">{settings.club_name || 'JOHAN SWIMMING CLUB'}</h2>
                        <p className="text-sm font-bold italic text-slate-700">{settings.club_slogan}</p>
                        <p className="text-[10px] mt-1 font-medium">
                            {settings.club_address && <span>{settings.club_address} • </span>}
                            {settings.club_phone && <span>Telp: {settings.club_phone} • </span>}
                            {settings.club_email && <span>Email: {settings.club_email}</span>}
                        </p>
                    </div>
                </div>

                {/* Report Metadata */}
                <div className="mb-6">
                    <h3 className="text-center text-lg font-black uppercase underline decoration-2 underline-offset-4 mb-4">
                        LAPORAN {printMode === 'daily' ? 'HARIAN' : printMode === 'weekly' ? 'MINGGUAN' : printMode === 'monthly' ? 'BULANAN' : 'TRIWULAN'} ATLET
                    </h3>

                    <div className="grid grid-cols-2 gap-y-2 text-xs font-bold px-4">
                        <div className="flex gap-2">
                            <span className="w-24 text-slate-500 uppercase tracking-tighter">Program:</span>
                            <span className="uppercase">{LEVEL_MAPPING[coach?.program_pilihan]?.label || coach?.program_pilihan || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-24 text-slate-500 uppercase tracking-tighter">Pelatih:</span>
                            <span className="uppercase">{coach?.full_name || '-'}</span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-24 text-slate-500 uppercase tracking-tighter">Periode:</span>
                            <span>
                                {printMode === 'daily' ? selectedDate :
                                    printMode === 'weekly' ? `Minggu, ${selectedDate}` :
                                        printMode === 'monthly' ? `${months[selectedMonth]} ${selectedYear}` :
                                            `${months[(selectedMonth - 2 + 12) % 12]} - ${months[selectedMonth]} ${selectedYear}`}
                            </span>
                        </div>
                        <div className="flex gap-2">
                            <span className="w-24 text-slate-500 uppercase tracking-tighter">Total Atlet:</span>
                            <span>{members.length} Orang</span>
                        </div>
                    </div>
                </div>

                {/* Data Table */}
                <table className="w-full border-collapse border border-black text-[11px] official-table">
                    <thead>
                        <tr>
                            <th className="border border-black px-2 py-2 text-center w-10">No.</th>
                            <th className="border border-black px-3 py-2 text-left">Nama Atlet</th>
                            <th className="border border-black px-2 py-2 text-center w-24">Presensi</th>
                            <th className="border border-black px-2 py-2 text-center w-32">
                                {printMode === 'daily' ? 'Skor Latihan' : 'Skor Akhir (Rata-rata)'}
                            </th>
                            <th className="border border-black px-3 py-2 text-left">Keterangan / Catatan</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="border border-black px-4 py-10 text-center italic text-slate-400">Tidak ada data atlet pada program ini.</td>
                            </tr>
                        ) : members.map((m, idx) => {
                            const stats = getMemberStats(m.id)
                            return (
                                <tr key={m.id} className="page-break-inside-avoid">
                                    <td className="border border-black px-2 py-1.5 text-center font-bold">{idx + 1}</td>
                                    <td className="border border-black px-3 py-1.5 font-bold uppercase">{m.full_name}</td>
                                    <td className="border border-black px-2 py-1.5 text-center font-mono">
                                        {stats.attendancePct}% ({stats.presentCount}/{stats.totalSessions})
                                    </td>
                                    <td className="border border-black px-2 py-1.5 text-center font-black">
                                        {stats.avgMetric} / 100
                                    </td>
                                    <td className="border border-black px-3 py-1.5 text-[10px] italic">
                                        {stats.avgMetric >= 85 ? 'Sangat Memuaskan' : stats.avgMetric >= 70 ? 'Cukup Baik' : stats.avgMetric > 0 ? 'Perlu Peningkatan' : '-'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                {/* Footer Signatures */}
                <div className="mt-12 flex justify-between px-10 text-xs font-bold signature-container">
                    <div className="text-center space-y-20 signature-box">
                        <p className="uppercase tracking-widest">Dibuat Oleh,</p>
                        <div className="space-y-1">
                            <p className="underline uppercase decoration-1 underline-offset-2">{coach?.full_name}</p>
                            <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">Pelatih Program</p>
                        </div>
                    </div>
                    <div className="text-center space-y-20 signature-box">
                        <p className="uppercase tracking-widest">Mengetahui,</p>
                        <div className="space-y-1">
                            <p className="underline uppercase decoration-1 underline-offset-2">( ........................................ )</p>
                            <p className="text-[10px] text-slate-600 font-medium tracking-widest uppercase">Kepala Pelatih</p>
                        </div>
                    </div>
                </div>

                {/* Print Timestamp */}
                <div className="mt-8 text-[8px] text-slate-400 text-right italic print:block hidden">
                    Dicetak otomatis oleh Sistem Johan Swimming Club pada: {new Date().toLocaleString('id-ID')}
                </div>
            </div>
        </div>
    )
}
