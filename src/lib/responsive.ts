// Responsive design utilities

export const breakpoints = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

export const breakpointValues = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const;

// Grid system utilities
export const gridSystems = {
  gallery: {
    default: 'grid-cols-1',
    sm: 'sm:grid-cols-2',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-3',
    xl: 'xl:grid-cols-4',
  },
  cards: {
    default: 'grid-cols-1',
    md: 'md:grid-cols-2',
    lg: 'lg:grid-cols-3',
  },
  timeline: {
    default: 'grid-cols-1',
    lg: 'lg:grid-cols-2',
  },
} as const;

// Container sizes
export const containerSizes = {
  sm: 'max-w-2xl',
  md: 'max-w-4xl', 
  lg: 'max-w-6xl',
  xl: 'max-w-7xl',
  memorial: 'max-w-3xl md:max-w-4xl',
} as const;

// Spacing utilities
export const spacing = {
  section: 'mb-8 md:mb-12',
  card: 'p-4 md:p-6',
  element: 'mb-4 md:mb-6',
} as const;

// Typography responsive classes
export const typography = {
  hero: 'text-3xl md:text-4xl lg:text-5xl',
  title: 'text-2xl md:text-3xl',
  subtitle: 'text-lg md:text-xl',
  body: 'text-base md:text-lg',
  small: 'text-sm md:text-base',
} as const;

// Media query utilities for client-side
export const mediaQueries = {
  sm: `(min-width: ${breakpoints.sm})`,
  md: `(min-width: ${breakpoints.md})`,
  lg: `(min-width: ${breakpoints.lg})`,
  xl: `(min-width: ${breakpoints.xl})`,
  '2xl': `(min-width: ${breakpoints['2xl']})`,
} as const;

// Hook for responsive behavior
export function useResponsive() {
  const getGridClass = (system: keyof typeof gridSystems) => {
    const grid = gridSystems[system];
    return Object.values(grid).join(' ');
  };

  const getContainerClass = (size: keyof typeof containerSizes) => {
    return `container mx-auto px-4 ${containerSizes[size]}`;
  };

  const getSectionClass = () => {
    return spacing.section;
  };

  return {
    getGridClass,
    getContainerClass,
    getSectionClass,
    breakpoints,
    breakpointValues,
  };
}

// Image size utilities for different contexts
export const imageSizes = {
  gallery: '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 400px',
  hero: '(max-width: 768px) 100vw, (max-width: 1024px) 80vw, 1200px',
  thumbnail: '(max-width: 640px) 150px, 200px',
  card: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px',
} as const;

// Animation utilities
export const animations = {
  fadeIn: 'transition-opacity duration-300',
  scaleHover: 'transition-transform duration-200 hover:scale-105',
  slideUp: 'transition-transform duration-300 translate-y-2 hover:translate-y-0',
} as const; 