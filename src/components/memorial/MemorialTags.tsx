import React from 'react';

interface MemorialTagsProps {
  tags: string[];
  title?: string;
  className?: string;
}

export function MemorialTags({ 
  tags, 
  title = "Kategorier",
  className = "" 
}: MemorialTagsProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const formatTag = (tag: string) => {
    return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getTagColor = (tag: string) => {
    // Simple hash function to generate consistent colors for tags
    let hash = 0;
    for (let i = 0; i < tag.length; i++) {
      hash = tag.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    const colors = [
      'bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-200',
      'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-200',
      'bg-purple-100 text-purple-800 dark:bg-purple-800 dark:text-purple-200',
      'bg-pink-100 text-pink-800 dark:bg-pink-800 dark:text-pink-200',
      'bg-yellow-100 text-yellow-800 dark:bg-yellow-800 dark:text-yellow-200',
      'bg-indigo-100 text-indigo-800 dark:bg-indigo-800 dark:text-indigo-200',
    ];
    
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <section className={`mb-8 ${className}`}>
      <h2 className="text-2xl font-semibold mb-4">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span 
            key={tag} 
            className={`px-3 py-1 text-sm rounded-full font-medium ${getTagColor(tag)}`}
          >
            {formatTag(tag)}
          </span>
        ))}
      </div>
    </section>
  );
} 