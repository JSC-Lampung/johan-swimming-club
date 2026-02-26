'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Waves, Target, Shield, Trophy } from 'lucide-react'

export default function ProgramOverview() {
    const [distributions, setDistributions] = useState([])
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)

    const programConfig = {
        'pemula': { icon: Waves, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        'dasar': { icon: Target, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        'menengah': { icon: Shield, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        'prestasi': { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' }
    }

    useEffect(() => {
        async function fetchDistributions() {
            try {
                const { data, error } = await supabase
                    .from('profiles')
                    .select('program_pilihan')
                    .eq('role', 'member')

                if (data) {
                    const counts = data.reduce((acc, curr) => {
                        const prog = curr.program_pilihan?.toLowerCase() || 'umum'
                        acc[prog] = (acc[prog] || 0) + 1
                        return acc
                    }, {})

                    const formatted = Object.entries(counts).map(([name, count]) => ({
                        name: name.charAt(0).toUpperCase() + name.slice(1),
                        count,
                        ... (programConfig[name.toLowerCase()] || { icon: Target, color: 'text-slate-400', bg: 'bg-slate-400/10' })
                    }))

                    setDistributions(formatted)
                    setTotal(data.length)
                }
            } catch (err) {
                console.error('Error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchDistributions()
    }, [])

    return (
        <div className="bg-slate-800/50 backdrop-blur-md rounded-2xl border border-slate-700 p-6 shadow-xl h-full">
            <h3 className="text-white font-black text-sm uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                <div className="w-2 h-4 bg-purple-600 rounded-full"></div>
                Distribusi Program
            </h3>

            <div className="space-y-6">
                {loading ? (
                    <div className="flex items-center justify-center p-8">
                        <div className="w-8 h-8 border-2 border-slate-700 border-t-purple-500 rounded-full animate-spin"></div>
                    </div>
                ) : distributions.length > 0 ? (
                    distributions.map((prog, i) => (
                        <div key={i} className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className={`p-1.5 rounded-lg ${prog.bg} ${prog.color}`}>
                                        <prog.icon size={16} />
                                    </div>
                                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{prog.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">{prog.count} <span className="text-slate-500 font-medium">({Math.round((prog.count / total) * 100)}%)</span></span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-900/50 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-gradient-to-r rounded-full transition-all duration-1000 ${prog.color.replace('text', 'from').replace('-400', '-600')} to-slate-400`}
                                    style={{ width: `${(prog.count / total) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500 text-xs text-center font-bold uppercase py-8">Belum ada data program</p>
                )}
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700/50">
                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
                    <span className="text-slate-500">Kapasitas Member</span>
                    <span className="text-emerald-400">Optimal</span>
                </div>
            </div>
        </div>
    )
}
