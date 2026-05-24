'use client'
import { useState } from 'react'
import Image from 'next/image'
import NsfwReveal from '@/components/NsfwReveal'

type Props = {
    imageUrl: string
    title: string
    isNsfw: boolean
}

export default function ArtworkImage({ imageUrl, title, isNsfw }: Props) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div
                className={`relative w-full rounded-2xl overflow-hidden bg-gray-100 ${!isNsfw ? 'cursor-zoom-in' : ''}`}
                onClick={() => !isNsfw && setOpen(true)}
            >
                {isNsfw ? (
                    <NsfwReveal imageUrl={imageUrl} title={title} />
                ) : (
                    <div className="relative aspect-square">
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-contain"
                            sizes="(max-width: 768px) 100vw, 50vw"
                            priority
                        />
                    </div>
                )}
            </div>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
                    onClick={() => setOpen(false)}
                >
                    <div className="relative max-w-5xl w-full" onClick={e => e.stopPropagation()}>
                        <img
                            src={imageUrl}
                            alt={title}
                            className="w-full max-h-[90vh] object-contain rounded-xl"
                        />
                        <button
                            onClick={() => setOpen(false)}
                            className="absolute top-3 right-3 text-xs bg-white/20 text-white px-3 py-1.5 rounded-full hover:bg-white/30 transition-colors"
                        >
                            ✕ Close
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}