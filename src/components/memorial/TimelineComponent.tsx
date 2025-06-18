import React from 'react';
import { TimelineEvent } from '@/types/memorial';
import { urlForImage } from '@/lib/sanity';

interface TimelineComponentProps {
  events: TimelineEvent[];
  layout?: 'horizontal' | 'vertical';
}

export default function TimelineComponent({ events, layout = 'vertical' }: TimelineComponentProps) {
  if (!events || events.length === 0) {
    return null;
  }

  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  if (layout === 'horizontal') {
    return (
      <div className="timeline-horizontal overflow-x-auto pb-4">
        <div className="flex space-x-8 min-w-max">
          {sortedEvents.map((event, index) => (
            <div key={event._key} className="flex-shrink-0 w-64">
              <div className="relative">
                {/* Timeline line */}
                {index < sortedEvents.length - 1 && (
                  <div className="absolute top-8 left-full w-8 h-0.5 bg-gray-300 dark:bg-gray-600"></div>
                )}
                
                {/* Timeline dot */}
                <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10"></div>
                
                {/* Event card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mt-12">
                  {event.image && (
                    <div className="mb-3">
                      <img
                        src={urlForImage(event.image).width(200).height(120).url()}
                        alt={event.image.alt || event.title}
                        className="w-full h-24 object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                    {new Date(event.date).toLocaleDateString()}
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {event.title}
                  </h3>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-vertical space-y-6">
      {sortedEvents.map((event, index) => (
        <div key={event._key} className="relative flex items-start space-x-4">
          {/* Timeline line */}
          {index < sortedEvents.length - 1 && (
            <div className="absolute left-4 top-8 w-0.5 h-full bg-gray-300 dark:bg-gray-600"></div>
          )}
          
          {/* Timeline dot */}
          <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full border-4 border-white dark:border-gray-900 shadow-lg z-10"></div>
          
          {/* Event content */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4">
            <div className="flex items-start space-x-4">
              {event.image && (
                <div className="flex-shrink-0 w-16 h-16">
                  <img
                    src={urlForImage(event.image).width(64).height(64).url()}
                    alt={event.image.alt || event.title}
                    className="w-full h-full object-cover rounded"
                  />
                </div>
              )}
              <div className="flex-1">
                <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                  {new Date(event.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {event.title}
                </h3>
                {event.description && (
                  <p className="text-gray-600 dark:text-gray-300">
                    {event.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}