'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Printer,
    Calendar,
    ChevronLeft,
    Loader2,
    Filter,
    FileText
} from 'lucide-react'
import { useSettings } from '@/context/SettingsContext'
import { PROGRAMS, LEVEL_MAPPING } from '@/lib/constants'
import Link from 'next/link'

export default function HeadCoachPrintReportPage() {
    const { settings } = useSettings()
    const [loading, setLoading] = useState(true)
    const [coach, setCoach] = useState(null)
    const [members, setMembers] = useState([])
    const [attendanceData, setAttendanceData] = useState([])
    const [assessmentData, setAssessmentData] = useState([])

    // Filters
    const [selectedProgram, setSelectedProgram] = useState('all')
    const [printMode, setPrintMode] = useState('monthly')
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth())
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ]

    const fetchData = async () => {
        setLoading(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            // 1. Fetch Head Coach Profile
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single()
            setCoach(profile)

            // 2. Fetch Members (Filtered by program)
            let memberQuery = supabase
                .from('profiles')
                .select('id, full_name, program_pilihan')
                .eq('role', 'member')

            if (selectedProgram !== 'all') {
                memberQuery = memberQuery.eq('program_pilihan', selectedProgram)
            }

            const { data: memberData } = await memberQuery.order('full_name', { ascending: true })
            setMembers(memberData || [])

            if (!memberData || memberData.length === 0) {
                setAttendanceData([])
                setAssessmentData([])
                return
            }

            const memberIds = memberData.map(m => m.id)

            // 3. Define Date Range
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
            } else {
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
    }, [selectedProgram, printMode, selectedDate, selectedMonth, selectedYear])

    const handlePrint = () => window.print()

    const getMemberStats = (memberId) => {
        const mAttendance = attendanceData.filter(a => a.member_id === memberId)
        const presentCount = mAttendance.filter(a => a.status === 'hadir').length
        const totalSessions = mAttendance.length
        const attendancePct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0

        const mAssessments = assessmentData.filter(a => a.member_id === memberId)

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

        return { attendancePct, avgMetric, totalSessions, presentCount }
    }

    if (loading && !coach) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-400 gap-4">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="font-bold uppercase tracking-widest text-xs tracking-tighter">Mempersiapkan Laporan Kepala Pelatih...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6 pb-20">
            <div className="print:hidden space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
                            <Printer className="text-blue-500" />
                            CETAK LAPORAN (PENGAWASAN)
                        </h1>
                        <p className="text-slate-400 text-sm mt-1 italic font-medium">
                            Monitoring rekapitulasi performa atlet secara menyeluruh.
                        </p>
                    </div>
                    <Link href="/head-coach" className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest">
                        <ChevronLeft size={16} /> Dashboard
                    </Link>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 shadow-2xl">
                    <div className="lg:col-span-2">
                        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Program Latihan</label>
                        <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-1">
                            <Filter size={14} className="text-slate-500" />
                            <select
                                value={selectedProgram}
                                onChange={(e) => setSelectedProgram(e.target.value)}
                                className="w-full bg-transparent text-white focus:outline-none text-sm font-bold py-2"
                            >
                                <option value="all" className="bg-slate-800">Semua Program</option>
                                {PROGRAMS.map(p => <option key={p.id} value={p.id} className="bg-slate-800">{p.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Periode</label>
                        <select
                            value={printMode}
                            onChange={(e) => setPrintMode(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-xs font-black uppercase tracking-widest"
                        >
                            <option value="daily">Harian</option>
                            <option value="weekly">Mingguan</option>
                            <option value="monthly">Bulanan</option>
                            <option value="quarterly">Triwulan</option>
                        </select>
                    </div>

                    <div className="lg:col-span-1">
                        <label className="block text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">Pengaturan Waktu</label>
                        {printMode === 'daily' || printMode === 'weekly' ? (
                            <input
                                type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2.5 text-white focus:outline-none text-xs font-bold"
                            />
                        ) : (
                            <div className="flex gap-2">
                                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))} className="flex-1 bg-slate-800 border border-slate-700 rounded-2xl px-2 py-2.5 text-white text-[10px] font-bold">
                                    {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
                                </select>
                                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))} className="w-20 bg-slate-800 border border-slate-700 rounded-2xl px-2 py-2.5 text-white text-[10px] font-bold">
                                    {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="flex items-end">
                        <button onClick={handlePrint} className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black uppercase tracking-[0.2em] py-3 rounded-2xl flex items-center justify-center gap-2 shadow-xl shadow-blue-500/20 active:scale-95 transition-all text-[10px]">
                            <Printer size={16} /> CETAK SEKARANG
                        </button>
                    </div>
                </div>
            </div>

            {/* PRINT AREA */}
            <div className="bg-white text-black p-0 md:p-12 rounded-none md:rounded-[40px] shadow-2xl print:shadow-none print:p-0 print:m-0" id="print-area">
                <style jsx global>{`
                    @media print {
                        @page { size: portrait; margin: 1.5cm; }
                        
                        html, body {
                            height: auto !important;
                            overflow: visible !important;
                            background: white !important;
                        }

                        .h-screen, .overflow-hidden, .overflow-y-auto, main {
                            height: auto !important;
                            overflow: visible !important;
                            display: block !important;
                            position: static !important;
                        }

                        body * { visibility: hidden; }
                        #print-area, #print-area * { visibility: visible; }
                        
                        #print-area {
                            position: absolute !important;
                            left: 0 !important;
                            top: 0 !important;
                            width: 100% !important;
                            padding: 0 !important;
                            margin: 0 !important;
                            display: block !important;
                        }
                        
                        .signature-container {
                            display: flex !important;
                            flex-direction: row !important;
                            justify-content: space-between !important;
                        }

                        .signature-box {
                            width: 40% !important;
                            text-align: center !important;
                        }

                        thead { display: table-header-group !important; }
                        tr { page-break-inside: avoid !important; }
                        .print-hidden, nav, aside { display: none !important; }
                    }
                    .official-table th { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }
                `}</style>

                <div className="border-b-4 border-double border-black pb-6 mb-8 flex items-center gap-8">
                    {settings.club_logo ? (
                        <img src={settings.club_logo} alt="Logo" className="w-28 h-28 object-contain" />
                    ) : (
                        <div className="w-28 h-28 bg-slate-100 flex items-center justify-center font-black text-slate-300 text-xs border-2 border-slate-200">LOGO</div>
                    )}
                    <div className="flex-1 text-center pr-28">
                        <h2 className="text-3xl font-black uppercase tracking-tight leading-none">{settings.club_name || 'JOHAN SWIMMING CLUB'}</h2>
                        <p className="text-sm font-black italic text-slate-600 mt-2">{settings.club_slogan}</p>
                        <p className="text-[10px] mt-2 font-bold opacity-80 uppercase tracking-widest">
                            {settings.club_address} • Telp: {settings.club_phone}
                        </p>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="text-center text-xl font-black uppercase underline decoration-4 underline-offset-8 mb-8 tracking-tighter">
                        LAPORAN {printMode === 'daily' ? 'HARIAN' : printMode === 'weekly' ? 'MINGGUAN' : printMode === 'monthly' ? 'BULANAN' : 'TRIWULAN'} PENGAWASAN ATLET
                    </h3>

                    <div className="grid grid-cols-2 gap-x-12 gap-y-3 text-[11px] font-black px-8">
                        <div className="flex justify-between border-b border-dotted border-black pb-1">
                            <span className="text-slate-500 uppercase tracking-widest">Program:</span>
                            <span className="uppercase">{selectedProgram === 'all' ? 'SELURUH PROGRAM' : LEVEL_MAPPING[selectedProgram]?.label}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-black pb-1">
                            <span className="text-slate-500 uppercase tracking-widest">Evaluator:</span>
                            <span className="uppercase">{coach?.full_name}</span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-black pb-1">
                            <span className="text-slate-500 uppercase tracking-widest">Periode Laporan:</span>
                            <span>
                                {printMode === 'daily' ? selectedDate :
                                    printMode === 'weekly' ? `Minggu ke - ${selectedDate}` :
                                        printMode === 'monthly' ? `${months[selectedMonth]} ${selectedYear}` :
                                            `${months[(selectedMonth - 2 + 12) % 12]} - ${months[selectedMonth]} ${selectedYear}`}
                            </span>
                        </div>
                        <div className="flex justify-between border-b border-dotted border-black pb-1">
                            <span className="text-slate-500 uppercase tracking-widest">Total Peserta:</span>
                            <span>{members.length} ATLET</span>
                        </div>
                    </div>
                </div>

                <table className="w-full border-collapse border-2 border-black text-[10px] official-table">
                    <thead>
                        <tr>
                            <th className="border-2 border-black px-2 py-3 text-center w-10 uppercase font-black">No.</th>
                            <th className="border-2 border-black px-4 py-3 text-left uppercase font-black">Nama Lengkap Atlet</th>
                            <th className="border-2 border-black px-4 py-3 text-left uppercase font-black w-32">Program</th>
                            <th className="border-2 border-black px-2 py-3 text-center w-24 uppercase font-black">Presensi</th>
                            <th className="border-2 border-black px-2 py-3 text-center w-32 uppercase font-black">Skor Performa</th>
                            <th className="border-2 border-black px-4 py-3 text-left uppercase font-black">Status / Rekomendasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {members.map((m, idx) => {
                            const stats = getMemberStats(m.id)
                            return (
                                <tr key={m.id} className="page-break-inside-avoid odd:bg-slate-50/50">
                                    <td className="border border-black px-2 py-2 text-center font-black">{idx + 1}</td>
                                    <td className="border border-black px-4 py-2 font-black uppercase">{m.full_name}</td>
                                    <td className="border border-black px-4 py-2 text-[9px] font-bold uppercase">{LEVEL_MAPPING[m.program_pilihan]?.label || m.program_pilihan}</td>
                                    <td className="border border-black px-2 py-2 text-center font-bold">{stats.attendancePct}%</td>
                                    <td className="border border-black px-2 py-2 text-center font-black text-xs">{stats.avgMetric}%</td>
                                    <td className="border border-black px-4 py-2 text-[9px] font-black uppercase italic">
                                        {stats.avgMetric >= 85 ? 'Sangat Baik (Promosi)' : stats.avgMetric >= 70 ? 'Bertahan' : 'Perlu Bimbingan'}
                                    </td>
                                </tr>
                            )
                        })}
                    </tbody>
                </table>

                <div className="mt-16 flex justify-between px-20 text-[11px] font-black signature-container">
                    <div className="text-center space-y-24 signature-box">
                        <p className="uppercase tracking-widest">Pelatih Program,</p>
                        <div className="flex flex-col items-center">
                            <p className="underline underline-offset-4 decoration-2 uppercase">( ........................................ )</p>
                            <p className="text-[8px] opacity-60 mt-1 uppercase">Pengasuh Program</p>
                        </div>
                    </div>
                    <div className="text-center space-y-24 signature-box">
                        <p className="uppercase tracking-widest">Mengetahui,</p>
                        <div className="flex flex-col items-center">
                            <p className="underline underline-offset-4 decoration-2 uppercase">{coach?.full_name}</p>
                            <p className="text-[8px] opacity-60 mt-1 uppercase">Kepala Pelatih Klub</p>
                        </div>
                    </div>
                </div>

                <div className="mt-12 text-[7px] text-slate-400 text-right italic font-bold uppercase tracking-widest pr-4 print:table-footer-group">
                    Digital Generated Report • Johan Swimming Club • {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>
        </div>
    )
}
