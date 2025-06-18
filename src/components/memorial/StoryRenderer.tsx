'use client';

import { PortableText } from '@portabletext/react';
import { StoryBlock } from '@/types/memorial';
import { PortableTextComponents } from '@portabletext/react';

interface StoryRendererProps {
  blocks: StoryBlock[];
}

const components: PortableTextComponents = {
  block: {
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold mt-8 mb-4">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold mt-6 mb-3">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-gray-300 dark:border-gray-600 pl-4 italic my-4">
        {children}
      </blockquote>
    ),
    normal: ({ children }) => (
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">{children}</p>
    ),
  },
  marks: {
    link: ({ children, value }) => {
      const rel = !value?.href?.startsWith('/') ? 'noopener noreferrer' : undefined;
      const target = !value?.href?.startsWith('/') ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={rel}
          className="text-copper-600 dark:text-copper-400 hover:underline"
        >
          {children}
        </a>
      );
    },
  },
};

export function StoryRenderer({ blocks }: StoryRendererProps) {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  // Ensure blocks is an array of valid Portable Text blocks
  const validBlocks = blocks.map(block => ({
    _type: block._type || 'block',
    _key: block._key,
    style: block.style || 'normal',
    markDefs: block.markDefs || [],
    children: block.children || []
  }));

  return (
    <div className="prose dark:prose-invert max-w-none">
      <PortableText value={validBlocks} components={components} />
    </div>
  );
} 