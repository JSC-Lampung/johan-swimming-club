
'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Upload, X, ImageIcon, Loader2 } from 'lucide-react'

export default function ImageUpload({ value, onChange, folder = 'general' }) {
    const [uploading, setUploading] = useState(false)
    const [preview, setPreview] = useState(value || null)

    const handleUpload = async (e) => {
        try {
            setUploading(true)
            if (!e.target.files || e.target.files.length === 0) {
                return
            }
            const file = e.target.files[0]
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`
            const filePath = `${folder}/${fileName}`

            // Upload to 'images' bucket
            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file)

            if (uploadError) throw uploadError

            // Get Public URL
            const { data: { publicUrl } } = supabase.storage
                .from('images')
                .getPublicUrl(filePath)

            setPreview(publicUrl)
            onChange(publicUrl)
        } catch (error) {
            alert('Error uploading image: ' + error.message)
            console.error(error)
        } finally {
            setUploading(false)
        }
    }

    const clearImage = () => {
        setPreview(null)
        onChange('')
    }

    return (
        <div className="space-y-4">
            {preview ? (
                <div className="relative group w-full aspect-video md:aspect-square md:w-48 bg-slate-900 rounded-2xl border border-slate-700 overflow-hidden shadow-xl">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button
                            type="button"
                            onClick={clearImage}
                            className="p-3 bg-red-600 text-white rounded-full shadow-lg hover:bg-red-700 hover:scale-110 active:scale-95 transition-all"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            ) : (
                <label className="flex flex-col items-center justify-center w-full aspect-video md:aspect-square md:w-48 bg-slate-800/50 border-2 border-dashed border-slate-700 rounded-2xl cursor-pointer hover:border-blue-500 hover:bg-slate-800/80 transition-all group relative overflow-hidden">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4 text-center">
                        {uploading ? (
                            <>
                                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-3" />
                                <p className="text-sm text-slate-400 font-medium">Mengupload...</p>
                            </>
                        ) : (
                            <>
                                <div className="p-3 bg-slate-700/50 rounded-xl mb-4 group-hover:bg-blue-600/10 group-hover:text-blue-400 transition-colors">
                                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-blue-400" />
                                </div>
                                <p className="text-xs font-black uppercase tracking-widest text-slate-500 mb-1 group-hover:text-blue-400">Pilih Gambar</p>
                                <p className="text-[10px] text-slate-500">JPG, PNG atau WebP</p>
                            </>
                        )}
                    </div>
                    <input
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleUpload}
                        disabled={uploading}
                    />
                </label>
            )}

            {/* Optional URL manual fallback for edge cases */}
            <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-500">
                    <ImageIcon className="w-4 h-4" />
                </div>
                <input
                    type="text"
                    value={value || ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-11 pr-4 py-2 text-xs text-slate-400 placeholder:text-slate-600 focus:outline-none focus:border-blue-500 transition-all"
                    placeholder="Atau masukkan URL gambar di sini..."
                />
            </div>
        </div>
    )
}
