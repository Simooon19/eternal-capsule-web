'use client'

import { Memorial } from '@/types/memorial'
import { StoryRenderer } from './StoryRenderer'
import { MemorialGallery } from './MemorialGallery'

interface MemorialContentProps {
  memorial: Memorial
}

export function MemorialContent({ memorial }: MemorialContentProps) {
  const hasGallery = memorial.gallery && memorial.gallery.length > 0
  const hasStory = memorial.storyBlocks && memorial.storyBlocks.length > 0

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-2">{memorial.title}</h1>
      {memorial.subtitle && <p className="text-xl text-gray-600 mb-4">{memorial.subtitle}</p>}
      <div className="flex items-center text-gray-500 mb-6">
        {memorial.bornAt?.location && <span className="mr-4">Born in {memorial.bornAt.location}</span>}
        {memorial.diedAt?.location && <span>Died in {memorial.diedAt.location}</span>}
      </div>
      {hasGallery && <MemorialGallery images={memorial.gallery} />}
      {hasStory && <StoryRenderer blocks={memorial.storyBlocks} />}
      <div className="mt-8">
        <h2 className="text-2xl font-semibold mb-4">About</h2>
        <p className="text-gray-700">{memorial.storyBlocks.map(block => block.text).join(' ')}</p>
      </div>
    </div>
  )
} 