'use client'
import {
    Trophy,
    Calendar,
    Clock,
    Trash2,
    Edit3,
    Medal,
    SearchX,
    Activity,
    Users,
    ChevronRight
} from 'lucide-react'

export default function BestTimeTable({ data, loading, onEdit, onDelete, currentUser, showMemberName = false, showRank = false }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-12 bg-slate-800/30 border border-slate-700 rounded-xl animate-pulse"></div>
                ))}
            </div>
        )
    }

    return (
        <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-separate border-spacing-y-2">
                <thead>
                    <tr className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                        {showRank && <th className="px-4 py-2">Rank</th>}
                        {showMemberName && <th className="px-4 py-2">Atlet</th>}
                        <th className="px-4 py-2">Gaya & Jarak</th>
                        <th className="px-4 py-2">Waktu</th>
                        <th className="px-4 py-2">Event / Latihan</th>
                        <th className="px-4 py-2">Tanggal</th>
                        {(onEdit || onDelete) && <th className="px-4 py-2 text-right">Aksi</th>}
                    </tr>
                </thead>
                <tbody>
                    {data.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="py-12 text-center">
                                <div className="flex flex-col items-center justify-center opacity-40">
                                    <SearchX size={32} className="text-slate-600 mb-2" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 italic">Data tidak ditemukan</p>
                                </div>
                            </td>
                        </tr>
                    ) : (
                        data.map((record) => (
                            <tr
                                key={record.id}
                                className="group hover:translate-x-1 transition-all duration-300"
                            >
                                {/* Rank */}
                                {showRank && (
                                    <td className="px-2 py-3 bg-slate-800/40 border-y border-l border-slate-700/50 first:rounded-l-2xl">
                                        <div className="flex items-center justify-center">
                                            {record.rank <= 3 ? (
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg ${record.rank === 1 ? 'bg-amber-500 text-white shadow-amber-500/20' :
                                                    record.rank === 2 ? 'bg-slate-300 text-slate-900 shadow-slate-300/20' :
                                                        'bg-amber-700 text-white shadow-amber-700/20'
                                                    }`}>
                                                    <Trophy size={14} />
                                                </div>
                                            ) : (
                                                <span className="text-xs font-black text-slate-500 italic">#{record.rank}</span>
                                            )}
                                        </div>
                                    </td>
                                )}

                                {/* Member Name */}
                                {showMemberName && (
                                    <td className={`px-4 py-3 bg-slate-800/40 border-y border-slate-700/50 ${!showRank ? 'first:rounded-l-2xl border-l' : ''}`}>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-slate-900 border border-slate-700 overflow-hidden flex-shrink-0 flex items-center justify-center">
                                                {record.profiles?.avatar_url ? (
                                                    <img src={record.profiles.avatar_url} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <Users size={14} className="text-slate-600" />
                                                )}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-xs font-bold text-white truncate max-w-[120px]">{record.profiles?.full_name}</span>
                                                {record.profiles?.program_pilihan && (
                                                    <span className="text-[8px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-1.5 rounded-sm mt-0.5 w-fit">
                                                        {record.profiles.program_pilihan}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                )}

                                {/* Stroke & Distance */}
                                <td className={`px-4 py-3 bg-slate-800/40 border-y border-slate-700/50 ${(!showRank && !showMemberName) ? 'first:rounded-l-2xl border-l' : ''}`}>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter italic">{record.stroke}</span>
                                        <span className="text-[11px] font-black text-white">{record.distance}m</span>
                                    </div>
                                </td>

                                {/* Time */}
                                <td className="px-4 py-3 bg-slate-800/40 border-y border-slate-700/50">
                                    <span className="text-sm font-black text-white italic tracking-tighter group-hover:text-blue-400 transition-colors">
                                        {record.record_time}
                                    </span>
                                </td>

                                {/* Event */}
                                <td className="px-4 py-3 bg-slate-800/40 border-y border-slate-700/50">
                                    <div className="flex items-center gap-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${record.category === 'Kejuaraan' ? 'bg-amber-500 animate-pulse' : 'bg-blue-500'}`}></div>
                                        <span className="text-[11px] font-medium text-slate-300 truncate max-w-[150px]">{record.event_name}</span>
                                    </div>
                                </td>

                                {/* Date */}
                                <td className="px-4 py-3 bg-slate-800/40 border-y border-slate-700/50">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                        {new Date(record.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </td>

                                {/* Actions */}
                                {(onEdit || onDelete) && (
                                    <td className="px-4 py-3 bg-slate-800/40 border-y border-r border-slate-700/50 last:rounded-r-2xl text-right">
                                        <div className="flex items-center justify-end gap-1 translate-x-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                                            {onEdit && (
                                                <button onClick={() => onEdit(record)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all">
                                                    <Edit3 size={14} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button onClick={() => onDelete(record.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg text-slate-500 hover:text-red-500 transition-all">
                                                    <Trash2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                )}
                            </tr>
                        )
                        ))}
                </tbody>
            </table>
        </div>
    )
}
