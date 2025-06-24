'use client'

import { Memorial } from '@/types/memorial'

interface MemorialTimelineProps {
  memorial: Memorial
}

export default function MemorialTimeline({ memorial }: MemorialTimelineProps) {
  if (!memorial.born || !memorial.died) return null;

  const timelineEvents = [
    {
      year: new Date(memorial.born).getFullYear(),
      title: 'Födelse',
      description: `Född${memorial.bornAt?.location ? ` i ${memorial.bornAt.location}` : ''}`,
      date: memorial.born,
      type: 'birth'
    },
    {
      year: new Date(memorial.died).getFullYear(),
      title: 'Bortgång',
      description: `Avled${memorial.diedAt?.location ? ` i ${memorial.diedAt.location}` : ''}`,
      date: memorial.died,
      type: 'death'
    }
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Livstidslinje</h2>
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-20 text-sm text-gray-500 dark:text-gray-400 font-medium">
              {event.year}
            </div>
            <div className="flex-shrink-0 w-4 h-4 rounded-full mt-1 mr-4 border-2 border-copper-500 bg-white dark:bg-gray-800"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">{event.title}</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">{event.description}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {new Date(event.date).toLocaleDateString('sv-SE', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Levde i {Math.floor((new Date(memorial.died).getTime() - new Date(memorial.born).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} år
        </p>
      </div>
    </div>
  )
}