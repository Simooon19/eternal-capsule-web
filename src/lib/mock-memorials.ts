import { Memorial } from '@/types/memorial';

export const mockMemorials: Memorial[] = [
  {
    _id: 'mock-1',
    name: 'Alice Williams',
    title: 'Alice Williams',
    description: 'A beloved geologist and library volunteer',
    subtitle: 'A beloved geologist and library volunteer',
    slug: {
      current: 'alice-williams-1932',
    },
    born: '1932-05-12',
    died: '2020-08-03',
    bornAt: {
      location: 'New York, NY',
      coordinates: { lat: 40.7128, lng: -74.0060 }
    },
    diedAt: {
      location: 'San Francisco, CA',
      coordinates: { lat: 37.7749, lng: -122.4194 }
    },
    gallery: [
      {
        _key: 'img1',
        url: '/alice.jpg',
        alt: 'Alice Williams',
        width: 400,
        height: 300,
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story1',
        text: 'Alice loved geology and could name every rock in the garden. She volunteered at the local library for 45 years.',
      }
    ],
    status: 'published' as const,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
    _createdAt: '2024-01-15T10:00:00Z',
    _updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    _id: 'mock-2',
    name: 'Bosse Anderson',
    title: 'Bosse Anderson',
    description: 'A talented musician and teacher',
    subtitle: 'A talented musician and teacher',
    slug: {
      current: 'bosse',
    },
    born: '1945-03-20',
    died: '2023-11-12',
    bornAt: {
      location: 'Stockholm, Sweden',
      coordinates: { lat: 59.3293, lng: 18.0686 }
    },
    diedAt: {
      location: 'Stockholm, Sweden',
      coordinates: { lat: 59.3293, lng: 18.0686 }
    },
    gallery: [
      {
        _key: 'img2',
        url: '/bosse.jpg',
        alt: 'Bosse Anderson',
        width: 400,
        height: 300,
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story2',
        text: 'Bosse was a passionate musician who taught piano for over 30 years. His students remember his patience and kindness.',
      }
    ],
    status: 'published' as const,
    createdAt: '2024-02-01T14:00:00Z',
    updatedAt: '2024-02-01T14:00:00Z',
    _createdAt: '2024-02-01T14:00:00Z',
    _updatedAt: '2024-02-01T14:00:00Z',
  },
  {
    _id: 'mock-3',
    name: 'Maria Rodriguez',
    title: 'Maria Rodriguez',
    description: 'A dedicated nurse and community leader',
    subtitle: 'A dedicated nurse and community leader',
    slug: {
      current: 'maria-rodriguez',
    },
    born: '1960-09-15',
    died: '2023-06-30',
    bornAt: {
      location: 'Madrid, Spain',
      coordinates: { lat: 40.4168, lng: -3.7038 }
    },
    diedAt: {
      location: 'Los Angeles, CA',
      coordinates: { lat: 34.0522, lng: -118.2437 }
    },
    gallery: [],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story3',
        text: 'Maria dedicated her life to caring for others as a nurse and was deeply involved in her community.',
      }
    ],
    status: 'published' as const,
    createdAt: '2023-12-10T09:00:00Z',
    updatedAt: '2023-12-10T09:00:00Z',
    _createdAt: '2023-12-10T09:00:00Z',
    _updatedAt: '2023-12-10T09:00:00Z',
  }
];