'use client'

import React, { useState } from 'react'
import { useUI } from '@/context/UIContext'
import { X, Copy, Check, MessageCircle, Facebook, Twitter, Instagram } from 'lucide-react'

// TikTok icon is not in standard lucide-react, using custom SVG
const TikTokIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.89-.6-4.09-1.47-.13-.08-.25-.17-.37-.26V15c.01 1.25-.33 2.51-1.01 3.59a6.666 6.666 0 0 1-5.18 3.14c-1.32.1-2.67-.09-3.89-.65a6.65 6.65 0 0 1-3.5-3.83c-.49-1.27-.61-2.66-.35-3.98.24-1.26.89-2.45 1.84-3.32 1.05-.98 2.45-1.57 3.89-1.65.29-.02.58-.02.87.01V12.3c-.6-.07-1.21.03-1.74.32-.71.39-1.2 1.1-1.34 1.89-.13.78.07 1.59.54 2.22.46.63 1.2 1.03 1.97 1.11.83.07 1.68-.18 2.32-.72.63-.52.96-1.34.93-2.15V.02z" />
    </svg>
)

export default function ShareModal() {
    const { isShareModalOpen, closeShareModal, shareData } = useUI()
    const [copied, setCopied] = useState(false)
    const [copyStatus, setCopyStatus] = useState('')

    if (!isShareModalOpen) return null

    // Configuration for production domain
    // If NEXT_PUBLIC_SITE_URL is set in .env, it will use that for sharing
    const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || ''

    let { title, text, url } = shareData

    // Replace localhost or current origin with production URL if configured
    if (SITE_URL && url) {
        const currentOrigin = typeof window !== 'undefined' ? window.location.origin : ''
        if (currentOrigin && url.startsWith(currentOrigin)) {
            url = url.replace(currentOrigin, SITE_URL)
        }
    }

    const encodedUrl = encodeURIComponent(url || '')
    const encodedText = encodeURIComponent(text || '')
    const encodedTitle = encodeURIComponent(title || '')

    const socialLinks = [
        {
            name: 'WhatsApp',
            icon: <MessageCircle className="w-6 h-6" />,
            color: 'bg-[#25D366] text-white',
            url: `https://wa.me/?text=${encodedTitle}%0A${encodedUrl}`,
            type: 'link'
        },
        {
            name: 'Facebook',
            icon: <Facebook className="w-6 h-6" />,
            color: 'bg-[#1877F2] text-white',
            url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
            type: 'link'
        },
        {
            name: 'Twitter / X',
            icon: <Twitter className="w-6 h-6" />,
            color: 'bg-[#000000] text-white',
            url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
            type: 'link'
        },
        {
            name: 'Instagram',
            icon: <Instagram className="w-6 h-6" />,
            color: 'bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] text-white',
            url: '#',
            type: 'copy',
            message: 'Tautan disalin! Silakan tempel di Story atau Bio Instagram Anda.'
        },
        {
            name: 'TikTok',
            icon: <TikTokIcon className="w-6 h-6" />,
            color: 'bg-black text-white',
            url: '#',
            type: 'copy',
            message: 'Tautan disalin! Silakan tempel di Bio TikTok Anda.'
        },
    ]

    const copyToClipboard = async (linkToCopy, customMessage) => {
        try {
            const targetUrl = linkToCopy || url
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(targetUrl)
            } else {
                const textArea = document.createElement("textarea")
                textArea.value = targetUrl
                textArea.style.position = "fixed"
                textArea.style.left = "-9999px"
                textArea.style.top = "0"
                document.body.appendChild(textArea)
                textArea.focus()
                textArea.select()
                document.execCommand('copy')
                document.body.removeChild(textArea)
            }

            setCopied(true)
            if (customMessage) setCopyStatus(customMessage)

            setTimeout(() => {
                setCopied(false)
                setCopyStatus('')
                if (customMessage) closeShareModal()
            }, 2500)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    const handleShareClick = (e, social) => {
        if (social.type === 'copy') {
            e.preventDefault()
            copyToClipboard(url, social.message)

            // For IG/TikTok, after copying, open the platform home so they can paste
            if (social.name === 'Instagram') {
                setTimeout(() => window.open('https://www.instagram.com/', '_blank'), 1500)
            } else if (social.name === 'TikTok') {
                setTimeout(() => window.open('https://www.tiktok.com/', '_blank'), 1500)
            }
        } else {

            setTimeout(closeShareModal, 1000)
        }
    }

    const handleClose = (e, source) => {
        if (e) {
            e.preventDefault()
            e.stopPropagation()
        }

        closeShareModal()
    }

    return (
        <div className="fixed inset-0 z-[1001] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fadeIn"
                onClick={(e) => handleClose(e, 'backdrop')}
            ></div>

            <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-slideUp border border-slate-100">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Bagikan Konten</h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Pilih platform tujuan</p>
                        </div>
                        <button
                            onClick={(e) => handleClose(e, 'close-button')}
                            className="p-2 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid grid-cols-5 gap-3 mb-8">
                        {socialLinks.map((social) => (
                            <a
                                key={social.name}
                                href={social.url}
                                target={social.type === 'link' ? "_blank" : "_self"}
                                rel="noopener noreferrer"
                                className="flex flex-col items-center gap-3 group"
                                onClick={(e) => handleShareClick(e, social)}
                            >
                                <div className={`w-12 h-12 rounded-2xl ${social.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    {social.icon}
                                </div>
                                <span className="text-[8px] font-black text-slate-500 uppercase tracking-widest text-center truncate w-full">{social.name.split(' ')[0]}</span>
                            </a>
                        ))}
                    </div>

                    {copyStatus && (
                        <div className="mb-4 p-3 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-bold text-center animate-fadeIn border border-blue-100">
                            {copyStatus}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Salin Tautan</label>
                        <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-2xl border border-slate-100 group">
                            <input
                                type="text"
                                readOnly
                                value={url}
                                className="flex-grow bg-transparent border-none text-xs font-medium text-slate-500 px-2 outline-none"
                            />
                            <button
                                onClick={() => copyToClipboard()}
                                className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all ${copied && !copyStatus
                                    ? 'bg-green-500 text-white'
                                    : 'bg-white text-blue-600 shadow-sm hover:bg-blue-600 hover:text-white'
                                    }`}
                            >
                                {copied && !copyStatus ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied && !copyStatus ? 'Tersalin' : 'Salin'}
                            </button>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-50 p-4 text-center border-t border-slate-100 mt-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Johan Swimming Club</p>
                </div>
            </div>
        </div>
    )
}
