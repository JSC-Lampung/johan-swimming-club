'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Trophy,
    TrendingUp,
    Calendar,
    Award,
    Activity,
    Star,
    ChevronRight,
    Target,
    CreditCard,
    UserCircle,
    Zap,
    Brain
} from 'lucide-react'
import Link from 'next/link'

export default function MemberDashboard() {
    const [user, setUser] = useState(null)
    const [stats, setStats] = useState({
        attendancePct: 0,
        latestScore: 0,
        totalSessions: 0,
        level: ''
    })
    const [latestAssessment, setLatestAssessment] = useState(null)
    const [dynamicTargets, setDynamicTargets] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const { data: { user: authUser } } = await supabase.auth.getUser()
                if (!authUser) return

                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('*')
                    .eq('id', authUser.id)
                    .single()
                setUser(profile)

                // Fetch Attendance Stats (Last 30 days)
                const thirtyDaysAgo = new Date()
                thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
                const { data: attendance } = await supabase
                    .from('member_attendance')
                    .select('*')
                    .eq('member_id', authUser.id)
                    .gte('date', thirtyDaysAgo.toISOString().split('T')[0])

                if (attendance) {
                    const present = attendance.filter(a => a.status === 'hadir').length
                    const pct = attendance.length > 0 ? Math.round((present / attendance.length) * 100) : 0
                    setStats(prev => ({
                        ...prev,
                        attendancePct: pct,
                        totalSessions: attendance.length
                    }))
                }

                // Fetch Latest Assessment
                const { data: assessment } = await supabase
                    .from('member_assessments')
                    .select('*')
                    .eq('member_id', authUser.id)
                    .order('date', { ascending: false })
                    .limit(1)
                    .single()

                if (assessment) {
                    setLatestAssessment(assessment)
                    setStats(prev => ({
                        ...prev,
                        latestScore: assessment.score
                    }))

                    // Generate Dynamic Targets
                    const evalData = assessment.evaluation || {}
                    const metrics = [
                        { name: 'Teknik', score: evalData.technique || 0, icon: Target },
                        { name: 'Fisik', score: evalData.physical || 0, icon: Activity },
                        { name: 'Disiplin', score: evalData.discipline || 0, icon: Zap },
                        { name: 'Mental', score: evalData.mental || 0, icon: Brain }
                    ]

                    // Sort metrics to find improvement area (lowest score)
                    const improvementArea = [...metrics].sort((a, b) => a.score - b.score)[0]

                    const programSpecificTargets = {
                        pemula: {
                            Teknik: "Fokus pada pengenalan air dan teknik meluncur yang lurus.",
                            Fisik: "Tingkatkan kekuatan kaki saat melakukan bubble kick.",
                            Disiplin: "Pastikan hadir tepat waktu untuk sesi pemanasan.",
                            Mental: "Tanamkan keberanian saat mencoba masuk ke kolam yang lebih dalam."
                        },
                        dasar: {
                            Teknik: "Sempurnakan tarikan tangan gaya bebas agar lebih efisien.",
                            Fisik: "Tingkatkan stamina untuk berenang 1-2 lap tanpa henti.",
                            Disiplin: "Ikuti instruksi pelatih dengan lebih saksama.",
                            Mental: "Fokus pada ketenangan saat mengambil napas."
                        },
                        menengah: {
                            Teknik: "Sempurnakan koordinasi 4 gaya renang utama.",
                            Fisik: "Tingkatkan kecepatan interval latihan 50m.",
                            Disiplin: "Konsistensi dalam pemenuhan target jarak harian.",
                            Mental: "Persiapan mental untuk transisi ke kelompok prestasi."
                        },
                        prestasi: {
                            Teknik: "Fokus pada efisiensi pembalikan (flip turn) dan daya dorong dinding.",
                            Fisik: "Optimalisasi threshold laktat melalui latihan interval berat.",
                            Disiplin: "Analisis performa melalui log harian dan kepatuhan program.",
                            Mental: "Strategi visualisasi untuk mental juara saat kompetisi."
                        }
                    }

                    const programKey = profile.program_pilihan?.toLowerCase() || 'dasar'
                    const programTargets = programSpecificTargets[programKey] || programSpecificTargets.dasar

                    const targets = [
                        {
                            title: `Fokus Peningkatan: ${improvementArea.name}`,
                            desc: programTargets[improvementArea.name],
                            icon: improvementArea.icon,
                            color: 'text-blue-500',
                            bgColor: 'bg-blue-600/10'
                        },
                        {
                            title: "Fokus Teknik",
                            desc: programTargets['Teknik'],
                            icon: Target,
                            color: 'text-emerald-500',
                            bgColor: 'bg-emerald-600/10'
                        }
                    ]
                    setDynamicTargets(targets)
                } else {
                    // Fallback targets if no assessment
                    setDynamicTargets([
                        {
                            title: "Fokus Teknik Minggu Ini",
                            desc: "Sempurnakan tarikan tangan pada gaya bebas dan koordinasi nafas.",
                            icon: Target,
                            color: 'text-blue-500',
                            bgColor: 'bg-blue-600/10'
                        },
                        {
                            title: "Kekuatan Fisik",
                            desc: "Tingkatkan daya tahan dengan latihan endurance 400m tanpa henti.",
                            icon: Activity,
                            color: 'text-emerald-500',
                            bgColor: 'bg-emerald-600/10'
                        }
                    ])
                }

            } catch (error) {
                console.error('Error fetching dashboard data:', error)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="flex animate-pulse flex-col gap-6">
                <div className="h-24 w-1/2 bg-slate-800 rounded-2xl"></div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="h-32 bg-slate-800 rounded-2xl"></div>
                    <div className="h-32 bg-slate-800 rounded-2xl"></div>
                    <div className="h-32 bg-slate-800 rounded-2xl"></div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Welcome Header */}
            <div>
                <h1 className="text-3xl font-black text-white tracking-tight uppercase">
                    Halo, <span className="text-blue-500">{user?.full_name?.split(' ')[0] || 'Perenang'}</span>! 🏊‍♂️
                </h1>
                <p className="text-slate-400 text-sm mt-1 font-medium italic">
                    {stats.attendancePct > 80
                        ? "Latihanmu sangat konsisten! Pertahankan performamu. 🔥"
                        : "Jangan lupa hadir latihan ya, tetap semangat mencapai target! 💪"}
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-600 to-blue-500 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Program Aktif</p>
                        <h3 className="text-2xl font-black mt-1 uppercase italic tracking-tighter">Kelas {user?.program_pilihan || 'Umum'}</h3>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold bg-white/20 px-3 py-1 rounded-full w-fit">
                            <Star size={14} fill="currentColor" />
                            Level Standar
                        </div>
                    </div>
                    <Trophy className="absolute -bottom-4 -right-4 opacity-10 group-hover:scale-110 transition-transform duration-500" size={120} />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Presensi (30 Hari)</p>
                        <h3 className="text-4xl font-black text-white mt-2 italic tracking-tighter">{stats.attendancePct}%</h3>
                        <p className="text-[10px] text-emerald-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                            <Activity size={12} /> {stats.totalSessions} Sesi Terdaftar
                        </p>
                    </div>
                    <Calendar className="absolute -bottom-4 -right-4 text-slate-700 opacity-20 group-hover:scale-110 transition-transform duration-500" size={120} />
                </div>

                <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                    <div className="relative z-10">
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Skor Evaluasi Terakhir</p>
                        <h3 className="text-4xl font-black text-white mt-2 italic tracking-tighter">{stats.latestScore || '-'}</h3>
                        <p className="text-[10px] text-blue-400 font-bold mt-2 uppercase tracking-widest flex items-center gap-1">
                            <TrendingUp size={12} /> Lihat Detail Grafik
                        </p>
                    </div>
                    <Award className="absolute -bottom-4 -right-4 text-slate-700 opacity-20 group-hover:scale-110 transition-transform duration-500" size={120} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Motivation & Coach Notes Section */}
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl border border-slate-700 p-8 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>

                    <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
                        <div className="w-2 h-4 bg-blue-600 rounded-full"></div>
                        Target Latihan & Catatan Pelatih
                    </h3>

                    <div className="space-y-8 relative z-10">
                        {dynamicTargets.map((target, idx) => (
                            <div key={idx} className="flex items-start gap-5 group">
                                <div className={`w-14 h-14 rounded-2xl ${target.bgColor} flex items-center justify-center ${target.color} shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <target.icon size={28} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-white font-black text-sm uppercase tracking-tight">{target.title}</h4>
                                    <p className="text-slate-400 text-xs leading-relaxed font-medium">{target.desc}</p>
                                </div>
                            </div>
                        ))}

                        {/* Direct Coach Notes */}
                        {latestAssessment?.notes && (
                            <div className="mt-8 pt-8 border-t border-slate-700/50">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500">
                                        <Award size={16} />
                                    </div>
                                    <p className="text-[10px] font-black text-amber-500 uppercase tracking-widest">Pesan Khusus Pelatih</p>
                                </div>
                                <div className="bg-slate-900/50 p-5 rounded-2xl border border-amber-500/10 italic text-slate-300 text-sm leading-relaxed relative quote-bg">
                                    "{latestAssessment.notes}"
                                </div>
                            </div>
                        )}

                        {!latestAssessment?.notes && (
                            <div className="mt-6 p-4 rounded-2xl bg-blue-600/5 border border-blue-600/10 italic text-blue-400 text-xs text-center font-medium">
                                "Juara tidak dilahirkan, mereka dibentuk melalui latihan setiap hari."
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Access Card */}
                <div className="flex flex-col gap-4">
                    <Link href="/member/progress" className="flex items-center justify-between p-6 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center">
                                <TrendingUp size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-tight">Lihat Perkembangan</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Pantau Skor & Grafik Teknik</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                    </Link>

                    <Link href="/member/id-card" className="flex items-center justify-between p-6 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-amber-600/20 text-amber-400 flex items-center justify-center">
                                <CreditCard size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-tight">Kartu Anggota</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">ID Digital & Barcode Siswa</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                    </Link>

                    <Link href="/member/profile" className="flex items-center justify-between p-6 bg-slate-800/50 hover:bg-slate-800 rounded-2xl border border-slate-700 transition-all group">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center">
                                <UserCircle size={24} />
                            </div>
                            <div>
                                <h3 className="text-white font-bold uppercase tracking-tight">Profil Saya</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-0.5">Kelola Akun & Kata Sandi</p>
                            </div>
                        </div>
                        <ChevronRight className="text-slate-600 group-hover:text-white transition-colors" />
                    </Link>
                </div>
            </div>
        </div>
    )
}
