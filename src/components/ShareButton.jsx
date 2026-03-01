'use client'

import React, { useState } from 'react'
import { Share2, Check, Copy } from 'lucide-react'
import { useUI } from '@/context/UIContext'

export default function ShareButton({ title, text, url, className = "" }) {
    const [copied, setCopied] = useState(false)
    const { openShareModal } = useUI()

    const handleShare = async (e) => {
        // Prevent all default actions and bubbling
        if (e) {
            e.preventDefault()
            e.stopPropagation()
            if (e.nativeEvent) e.nativeEvent.stopImmediatePropagation()
        }

        const finalUrl = url || (typeof window !== 'undefined' ? window.location.href : '')
        const shareData = {
            title: title || 'Johan Swimming Club',
            text: text || 'Lihat konten menarik dari Johan Swimming Club!',
            url: finalUrl,
        }

        // Detect if it's a mobile device (Native share is usually better on mobile)
        const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)

        // Try native share ONLY on mobile
        const canNativeShare = isMobile &&
            typeof navigator !== 'undefined' &&
            !!navigator.share &&
            (typeof navigator.canShare === 'undefined' || navigator.canShare(shareData))

        if (canNativeShare) {
            try {
                // Short timeout to ensure previous event loops finish
                await new Promise(resolve => setTimeout(resolve, 100))
                await navigator.share(shareData)
                return
            } catch (err) {
                // If it's a real error (not user cancel), move to modal
                if (err.name !== 'AbortError') {
                    console.warn('Native share failed, falling back to modal:', err)
                    // Small delay to prevent click-through
                    setTimeout(() => openShareModal(shareData), 150)
                }
                return
            }
        }

        // Desktop or Fallback: Open custom Share Modal with a delay
        // This delay is CRUCIAL to prevent the same click from hitting the modal's backdrop
        setTimeout(() => openShareModal(shareData), 150)
    }

    const copyToClipboard = async (link) => {
        try {
            // Priority 1: Modern Clipboard API
            if (navigator.clipboard && navigator.clipboard.writeText) {
                await navigator.clipboard.writeText(link)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
                return
            }

            // Priority 2: Fallback to execCommand('copy')
            const textArea = document.createElement("textarea")
            textArea.value = link
            textArea.style.position = "fixed"
            textArea.style.left = "-9999px"
            textArea.style.top = "0"
            document.body.appendChild(textArea)
            textArea.focus()
            textArea.select()

            try {
                const successful = document.execCommand('copy')
                if (successful) {
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                }
            } catch (err) {
                console.error('Fallback: Unable to copy', err)
            }

            document.body.removeChild(textArea)
        } catch (err) {
            console.error('Failed to copy:', err)
        }
    }

    return (
        <button
            onClick={handleShare}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-xs uppercase tracking-widest ${copied
                ? 'bg-green-100 text-green-600 border border-green-200'
                : 'bg-blue-50 text-blue-600 border border-blue-100 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20'
                } ${className}`}
        >
            {copied ? (
                <>
                    <Check className="w-4 h-4" />
                    <span>Tersalin!</span>
                </>
            ) : (
                <>
                    <Share2 className="w-4 h-4" />
                    <span>Bagikan</span>
                </>
            )}
        </button>
    )
}
