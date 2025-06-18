'use client'

import { Memorial } from '@/types/memorial'

interface MemorialStatsProps {
  memorial: Memorial
}

export default function MemorialStats({ memorial }: MemorialStatsProps) {
  const yearsLived = Math.floor((new Date(memorial.died).getTime() - new Date(memorial.born).getTime()) / (1000 * 60 * 60 * 24 * 365.25))
  const photoCount = memorial.gallery?.length || 0
  const storyWordsCount = memorial.storyBlocks?.reduce((count, block) => {
    if (block._type === 'block' && block.children) {
      return count + block.children.reduce((wordCount, child) => {
        return wordCount + (child.text?.split(' ').length || 0)
      }, 0)
    }
    return count
  }, 0) || 0
  
  const memorialAge = Math.floor((new Date().getTime() - new Date(memorial.createdAt).getTime()) / (1000 * 60 * 60 * 24))

  const stats = [
    {
      label: 'Years Lived',
      value: yearsLived,
      icon: '🕰️',
      description: 'A life well lived'
    },
    {
      label: 'Photos',
      value: photoCount,
      icon: '📸',
      description: 'Memories captured'
    },
    {
      label: 'Story Words',
      value: storyWordsCount,
      icon: '📝',
      description: 'Words of remembrance'
    },
    {
      label: 'Memorial Age',
      value: memorialAge,
      icon: '🌟',
      description: memorialAge === 1 ? 'day online' : 'days online'
    }
  ]

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <h2 className="text-2xl font-semibold mb-6 text-center">Memorial Statistics</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="text-center bg-white rounded-lg p-4 shadow-sm">
            <div className="text-2xl mb-2">{stat.icon}</div>
            <div className="text-2xl font-bold text-indigo-600">{stat.value}</div>
            <div className="text-sm font-medium text-gray-700">{stat.label}</div>
            <div className="text-xs text-gray-500 mt-1">{stat.description}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          This memorial was created on {new Date(memorial.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
      </div>
    </div>
  )
}