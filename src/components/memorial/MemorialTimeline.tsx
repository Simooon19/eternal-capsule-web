'use client'

import { Memorial } from '@/types/memorial'

interface MemorialTimelineProps {
  memorial: Memorial
}

export default function MemorialTimeline({ memorial }: MemorialTimelineProps) {
  const timelineEvents = [
    {
      year: new Date(memorial.born).getFullYear(),
      title: 'Birth',
      description: `Born${memorial.bornAt?.location ? ` in ${memorial.bornAt.location}` : ''}`,
      date: memorial.born,
      type: 'birth'
    },
    {
      year: new Date(memorial.died).getFullYear(),
      title: 'Passing',
      description: `Passed away${memorial.diedAt?.location ? ` in ${memorial.diedAt.location}` : ''}`,
      date: memorial.died,
      type: 'death'
    }
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-2xl font-semibold mb-6">Life Timeline</h2>
      <div className="space-y-4">
        {timelineEvents.map((event, index) => (
          <div key={index} className="flex items-start">
            <div className="flex-shrink-0 w-20 text-sm text-gray-500 font-medium">
              {event.year}
            </div>
            <div className="flex-shrink-0 w-4 h-4 rounded-full mt-1 mr-4 border-2 border-indigo-500 bg-white"></div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">{event.title}</h3>
              <p className="text-gray-600 text-sm">{event.description}</p>
              <p className="text-xs text-gray-400 mt-1">
                {new Date(event.date).toLocaleDateString('en-US', {
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
        <p className="text-sm text-gray-500">
          Lived for {Math.floor((new Date(memorial.died).getTime() - new Date(memorial.born).getTime()) / (1000 * 60 * 60 * 24 * 365.25))} years
        </p>
      </div>
    </div>
  )
}