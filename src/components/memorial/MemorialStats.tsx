'use client'

import { Memorial } from '@/types/memorial'

interface MemorialStatsProps {
  memorial: Memorial
}

export default function MemorialStats({ memorial }: MemorialStatsProps) {
  let yearsLived: number | string = 'N/A';
  if (memorial.born && memorial.died) {
    const diff = new Date(memorial.died).getTime() - new Date(memorial.born).getTime();
    if (!isNaN(diff) && diff > 0) {
      yearsLived = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }
  }

  const photoCount = memorial.gallery?.length || 0
  const storyWordsCount = memorial.storyBlocks?.reduce((count, block) => {
    if (block._type === 'block' && block.children) {
      return count + block.children.reduce((wordCount, child) => {
        return wordCount + (child.text?.split(' ').length || 0)
      }, 0)
    }
    return count
  }, 0) || 0
  
  let memorialAge: number | string = 'N/A';
  if (memorial.createdAt) {
    const diffAge = new Date().getTime() - new Date(memorial.createdAt).getTime();
    if (!isNaN(diffAge) && diffAge >= 0) {
      memorialAge = Math.floor(diffAge / (1000 * 60 * 60 * 24));
    }
  }

  const stats = [
    {
      label: 'År Levde',
      value: yearsLived,
      icon: '🕰️',
      description: 'Ett vällevt liv'
    },
    {
      label: 'Foton',
      value: photoCount,
      icon: '📸',
      description: 'Fångade minnen'
    },
    {
      label: 'Berättelseord',
      value: storyWordsCount,
      icon: '📝',
      description: 'Minnesord'
    },
    {
      label: 'Minneslundens Ålder',
      value: memorialAge,
      icon: '🌟',
      description: memorialAge === 1 ? 'dag online' : 'dagar online'
    }
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Minneslundsstatistik</h2>
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-center space-x-3">
            <div className="text-2xl">{stat.icon}</div>
            <div>
              <div className="font-semibold text-gray-900 dark:text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}