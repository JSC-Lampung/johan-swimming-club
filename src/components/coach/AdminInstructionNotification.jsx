
'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabaseClient'
import {
    Bell,
    X,
    MessageSquare,
    ChevronRight,
    CheckCircle2,
    Calendar,
    ArrowRight
} from 'lucide-react'

export default function AdminInstructionNotification() {
    const [instructions, setInstructions] = useState([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [showPanel, setShowPanel] = useState(false)
    const [selectedMessage, setSelectedMessage] = useState(null)
    const [coachId, setCoachId] = useState(null)
    const [coachProgram, setCoachProgram] = useState(null)

    useEffect(() => {
        const init = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) {
                    console.warn('AdminNotification: No authenticated user found')
                    return
                }
                setCoachId(user.id)

                const { data: profile, error: profileError } = await supabase
                    .from('profiles')
                    .select('program_pilihan')
                    .eq('id', user.id)
                    .single()

                if (profileError) {
                    console.error('AdminNotification: Error fetching coach profile', profileError)
                }

                setCoachProgram(profile?.program_pilihan)
                fetchInstructions(user.id, profile?.program_pilihan)
            } catch (err) {
                console.error('AdminNotification: Init error', err)
            }
        }
        init()
    }, [])

    const fetchInstructions = async (uId, program) => {
        if (!uId) return;
        try {
            // 1. Fetch relevant instructions
            let query = supabase
                .from('admin_instructions')
                .select('*')

            if (program) {
                // Use explicit string for PostgREST .or() filter
                // target_program.is.null covers general messages
                // target_program.eq."${program}" covers program specific messages
                query = query.or(`target_program.is.null,target_program.eq."${program}"`)
            } else {
                query = query.is('target_program', null)
            }

            const { data: instData, error: instError } = await query.order('created_at', { ascending: false })

            if (instError) {
                console.error('FETCH_INST_ERROR (Data):', {
                    message: instError.message,
                    details: instError.details,
                    hint: instError.hint,
                    code: instError.code,
                    program
                })
                return
            }

            // 2. Fetch read status
            const { data: readData, error: readError } = await supabase
                .from('instruction_reads')
                .select('instruction_id')
                .eq('coach_id', uId)

            if (readError) {
                console.error('FETCH_INST_ERROR (ReadStatus):', {
                    message: readError.message,
                    details: readError.details,
                    code: readError.code
                })
                // Don't return, we can still show instructions but all will be unread
            }

            const readIds = new Set(readData?.map(r => r.instruction_id) || [])

            const processed = (instData || []).map(inst => ({
                ...inst,
                is_read: readIds.has(inst.id)
            }))

            setInstructions(processed)
            setUnreadCount(processed.filter(i => !i.is_read).length)
        } catch (error) {
            console.error('FETCH_INST_CRITICAL:', error)
        }
    }

    const markAsRead = async (instId) => {
        try {
            const { error } = await supabase
                .from('instruction_reads')
                .insert([{ instruction_id: instId, coach_id: coachId }])

            if (error && error.code !== '23505') throw error // 23505 is unique violation (already read)

            setInstructions(instructions.map(i => i.id === instId ? { ...i, is_read: true } : i))
            setUnreadCount(prev => Math.max(0, prev - 1))
        } catch (error) {
            console.error('Error marking as read:', error)
        }
    }

    if (!instructions.length && !showPanel) return null

    return (
        <>
            {/* Notification Bell Icon */}
            <div className="fixed top-4 right-4 z-[70] lg:right-8">
                <button
                    onClick={() => setShowPanel(!showPanel)}
                    className={`
                        relative p-3 rounded-2xl border transition-all active:scale-95 shadow-xl
                        ${unreadCount > 0
                            ? 'bg-blue-600 border-blue-500 text-white animate-pulse'
                            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white'}
                    `}
                >
                    <Bell size={24} />
                    {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-slate-900">
                            {unreadCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Notification Panel */}
            {showPanel && (
                <div className="fixed inset-0 z-[80] lg:inset-auto lg:top-20 lg:right-8 lg:w-96 flex flex-col animate-fadeIn">
                    {/* Backdrop for mobile */}
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm lg:hidden" onClick={() => setShowPanel(false)}></div>

                    <div className="relative flex flex-col w-full h-full max-h-[80vh] lg:h-auto bg-slate-800 border border-slate-700 lg:rounded-3xl shadow-2xl overflow-hidden mt-auto lg:mt-0 px-4 py-6">
                        <div className="flex items-center justify-between mb-6 px-2">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-600/10 rounded-xl text-blue-500">
                                    <MessageSquare size={20} />
                                </div>
                                <h3 className="text-white font-black text-sm uppercase tracking-widest">Instruksi Admin</h3>
                            </div>
                            <button onClick={() => setShowPanel(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 px-1">
                            {instructions.length === 0 ? (
                                <div className="py-20 text-center text-slate-500 font-bold uppercase tracking-widest text-[10px]">Belum ada instruksi.</div>
                            ) : instructions.map((inst) => (
                                <button
                                    key={inst.id}
                                    onClick={() => {
                                        setSelectedMessage(inst)
                                        if (!inst.is_read) markAsRead(inst.id)
                                    }}
                                    className={`
                                        w-full text-left p-4 rounded-2xl border transition-all hover:scale-[1.02] active:scale-95
                                        ${inst.is_read
                                            ? 'bg-slate-900/30 border-slate-700/50 opacity-60'
                                            : 'bg-slate-700 border-slate-600 shadow-lg shadow-black/20 ring-1 ring-blue-500/20'}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="text-white font-black text-xs uppercase truncate pr-4">{inst.title}</h4>
                                        {!inst.is_read && <div className="w-2 h-2 rounded-full bg-blue-500 shadow-lg shadow-blue-500/50 shrink-0"></div>}
                                    </div>
                                    <p className="text-slate-400 text-[10px] font-medium line-clamp-2 italic">&quot;{inst.content}&quot;</p>
                                    <div className="flex items-center gap-2 mt-3 text-[8px] font-black text-slate-500 uppercase tracking-widest">
                                        <Calendar size={10} />
                                        {new Date(inst.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                        <ChevronRight size={10} className="ml-auto" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Full Message Modal */}
            {selectedMessage && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" onClick={() => setSelectedMessage(null)}></div>
                    <div className="relative w-full max-w-lg bg-slate-800 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl animate-scaleIn">
                        <div className="p-8 space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-500 shadow-inner">
                                    <MessageSquare size={24} />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-blue-400 uppercase tracking-[0.3em] mb-1">INSTRUKSI ADMIN</p>
                                    <h2 className="text-xl font-black text-white leading-tight uppercase tracking-tight">{selectedMessage.title}</h2>
                                </div>
                            </div>

                            <div className="bg-slate-900/50 rounded-2xl p-6 border border-slate-700/50">
                                <p className="text-slate-300 text-sm leading-relaxed font-medium italic">&quot;{selectedMessage.content}&quot;</p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold">
                                    <Calendar size={14} />
                                    {new Date(selectedMessage.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </div>
                                <button
                                    onClick={() => setSelectedMessage(null)}
                                    className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2"
                                >
                                    Selesai Membaca
                                    <CheckCircle2 size={14} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
