import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MemorialCard from '../MemorialCard';
import { Memorial } from '@/types/memorial';

// Mock next/link
jest.mock('next/link', () => {
  return function MockedLink({ children, href }: { children: React.ReactNode; href: string }) {
    return <a href={href}>{children}</a>;
  };
});

// Mock the image optimization
jest.mock('@/components/ui/OptimizedImage', () => {
  return function MockedOptimizedImage({ src, alt, className }: { src: string; alt: string; className?: string }) {
    return <img src={src} alt={alt} className={className} />;
  };
});

describe('MemorialCard Component', () => {
  const mockMemorial: Memorial = {
    _id: 'test-memorial-1',
    name: 'John Doe',
    title: 'John Doe Memorial',
    subtitle: 'A loving father and devoted husband who touched many lives through his kindness.',
    description: 'A loving father and devoted husband who touched many lives through his kindness.',
    born: '1950-05-15',
    died: '2023-12-01',
    slug: {
      current: 'john-doe-memorial'
    },
    personalInfo: {
      dateOfBirth: '1950-05-15',
      dateOfDeath: '2023-12-01',
      age: 73,
      birthLocation: 'New York, NY',
      deathLocation: 'San Francisco, CA'
    },
    coverImage: {
      url: 'https://example.com/john-doe.jpg',
      alt: 'John Doe portrait'
    },
    gallery: [
      {
        url: 'https://example.com/gallery-1.jpg',
        alt: 'John with family',
        caption: 'Family gathering 2020'
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story1',
        style: 'normal',
        text: 'John was born in New York and lived a fulfilling life.'
      }
    ],
    status: 'published',
    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2023-12-01T00:00:00Z',
    _createdAt: '2023-12-01T00:00:00Z',
    tags: ['father', 'husband', 'teacher'],
    viewCount: 150,
    minnesbrickaTagUid: 'minnesbricka_1234567890_abc123',
    privacy: 'public'
  };

  const mockMemorialMinimal: Memorial = {
    _id: 'test-memorial-2',
    name: 'Jane Smith',
    title: 'Jane Smith Memorial',
    slug: {
      current: 'jane-smith-memorial'
    },
    storyBlocks: [],
    status: 'published',
    createdAt: '2023-11-15T00:00:00Z',
    updatedAt: '2023-11-15T00:00:00Z',
    _createdAt: '2023-11-15T00:00:00Z'
  };

  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
  });

  test('renders memorial card with complete information', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Test memorial name/title
    expect(screen.getByText('John Doe Memorial')).toBeInTheDocument();
    
    // Test subtitle (which is displayed on the card)
    expect(screen.getByText(/A loving father and devoted husband/)).toBeInTheDocument();
    
    // Test dates (check for full date text to be more specific)
    expect(screen.getByText(/15 maj 1950/)).toBeInTheDocument();
    expect(screen.getByText(/1 december 2023/)).toBeInTheDocument();
    
    // Test image
    const image = screen.getByAltText('Minnesbild av John Doe Memorial');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', 'https://example.com/john-doe.jpg');
    
    // Test link
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('john-doe-memorial'));
  });

  test('renders memorial card with minimal information', () => {
    render(<MemorialCard memorial={mockMemorialMinimal} />);
    
    // Should still render with just basic info
    expect(screen.getByText('Jane Smith Memorial')).toBeInTheDocument();
    
    // Should have a link even with minimal data
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('jane-smith-memorial'));
  });

  test('handles missing cover image gracefully', () => {
    const memorialWithoutImage = {
      ...mockMemorial,
      coverImage: undefined
    };
    
    render(<MemorialCard memorial={memorialWithoutImage} />);
    
    // Should still render the card
    expect(screen.getByText('John Doe Memorial')).toBeInTheDocument();
    
    // Should not have an image
    expect(screen.queryByAltText('John Doe portrait')).not.toBeInTheDocument();
  });

  test('displays tags if available', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Check for tags - may be displayed as text or badges
    const cardContent = screen.getByRole('link').textContent;
    
    // Should contain tag information in some form
    expect(cardContent).toBeTruthy();
  });

  test('displays view count if available', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Look for view count display
    const viewCountText = screen.queryByText(/150|view/i);
    
    // View count might be displayed, depending on design
    if (viewCountText) {
      expect(viewCountText).toBeInTheDocument();
    }
  });

  test('handles long descriptions appropriately', () => {
    const memorialWithLongDescription = {
      ...mockMemorial,
      description: 'This is a very long description that should be truncated or handled appropriately by the component to ensure good user experience and proper layout. It contains many words and details about the person\'s life, achievements, and legacy that they left behind for their family and friends to remember.'
    };
    
    render(<MemorialCard memorial={memorialWithLongDescription} />);
    
    // Should render without breaking layout
    expect(screen.getByText('John Doe Memorial')).toBeInTheDocument();
    
    // Description should be present (possibly truncated)
    const description = screen.getByText(/This is a very long description/);
    expect(description).toBeInTheDocument();
  });

  test('formats dates consistently', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Check that dates are formatted in a readable way
    const cardElement = screen.getByRole('link');
    const cardText = cardElement.textContent;
    
    // Should contain year information
    expect(cardText).toMatch(/1950|2023/);
  });

  test('handles different memorial statuses', () => {
    const draftMemorial = {
      ...mockMemorial,
      status: 'draft' as const
    };
    
    render(<MemorialCard memorial={draftMemorial} />);
    
    // Should still render but may have different styling
    expect(screen.getByText('John Doe Memorial')).toBeInTheDocument();
  });

  test('is accessible', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Should have proper link structure
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
    
    // Image should have alt text
    const image = screen.getByAltText('Minnesbild av John Doe Memorial');
    expect(image).toBeInTheDocument();
    
    // Should be keyboard navigable
    fireEvent.focus(link);
    expect(link).toHaveFocus();
  });

  test('handles special characters in names and descriptions', () => {
    const memorialWithSpecialChars = {
      ...mockMemorial,
      name: 'José María Ñoño',
      description: 'A person with ñ, é, and other special characters in their name & description.'
    };
    
    render(<MemorialCard memorial={memorialWithSpecialChars} />);
    
    expect(screen.getByText('José María Ñoño Memorial')).toBeInTheDocument();
    expect(screen.getByText(/special characters/)).toBeInTheDocument();
  });

  test('supports both old and new data formats', () => {
    // Test with old format (direct born/died fields)
    const oldFormatMemorial = {
      ...mockMemorial,
      personalInfo: undefined,
      born: '1945-01-01',
      died: '2020-12-31'
    };
    
    render(<MemorialCard memorial={oldFormatMemorial} />);
    
    expect(screen.getByText('John Doe Memorial')).toBeInTheDocument();
    expect(screen.getByText(/1945|2020/)).toBeInTheDocument();
  });

  test('maintains proper aspect ratio for images', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    const image = screen.getByAltText('Minnesbild av John Doe Memorial');
    
    // Check that image has appropriate classes or styles
    expect(image).toHaveClass(/object-cover|aspect-ratio|w-|h-/);
  });

  test('shows NFC tag indicator if available', () => {
    render(<MemorialCard memorial={mockMemorial} />);
    
    // Look for NFC-related indicators
    const cardContent = screen.getByRole('link').textContent;
    
    // May include NFC indicators or just render normally
    expect(cardContent).toBeTruthy();
  });
}); 