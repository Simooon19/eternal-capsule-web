'use client'

import { useEffect } from 'react'
import Image from 'next/image'

interface LightboxProps {
  isOpen: boolean
  imageSrc: string
  imageAlt: string
  onClose: () => void
}

export default function Lightbox({ isOpen, imageSrc, imageAlt, onClose }: LightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
        onClick={onClose}
        aria-label="Close lightbox"
      >
        <svg
          className="h-8 w-8"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Image container */}
      <div 
        className="relative w-full h-full max-w-7xl max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          fill
          className="object-contain"
          sizes="100vw"
          priority
        />
      </div>
    </div>
  )
} 