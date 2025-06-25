'use client'

import { Memorial } from '@/types/memorial'

interface MemorialStatsProps {
  memorial: Memorial
}

export default function MemorialStats({ memorial }: MemorialStatsProps) {
  // Calculate years lived since memorial creation instead of actual lifespan
  let yearsSinceCreation: number | string = 'N/A';
  const creationDate = memorial._createdAt || memorial.createdAt;
  if (creationDate) {
    const diffYears = new Date().getTime() - new Date(creationDate).getTime();
    if (!isNaN(diffYears) && diffYears >= 0) {
      yearsSinceCreation = Math.floor(diffYears / (1000 * 60 * 60 * 24 * 365.25));
    }
  }

  const photoCount = memorial.gallery?.length || 0
  
  // Use storyBlocks for word count
  const storyWordsCount = memorial.storyBlocks?.reduce((count: number, block: any) => {
    if (block._type === 'block' && block.children) {
      return count + block.children.reduce((wordCount: number, child: any) => {
        return wordCount + (child.text?.split(' ').length || 0)
      }, 0)
    }
    return count
  }, 0) || 0
  
  let memorialAge: number | string = 'N/A';
  if (creationDate) {
    const diffAge = new Date().getTime() - new Date(creationDate).getTime();
    if (!isNaN(diffAge) && diffAge >= 0) {
      memorialAge = Math.floor(diffAge / (1000 * 60 * 60 * 24));
    }
  }

  const stats = [
    {
      label: 'År levde sedan skapande',
      value: yearsSinceCreation,
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