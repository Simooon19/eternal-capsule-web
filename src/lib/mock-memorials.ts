import { Memorial } from '@/types/memorial';

export const memorials: Memorial[] = [
  {
    _id: 'alice-williams-1932',
    title: 'Alice Williams',
    name: 'Alice Williams',
    slug: { current: 'alice-williams-1932' },
    born: '1932-05-12',
    died: '2020-08-03',
    description: 'A beloved geologist and librarian who touched many lives.',
    gallery: [
      {
        _key: 'alice-1',
        url: '/images/alice.jpg',
        alt: 'Alice Williams portrait',
        width: 400,
        height: 600
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story-1',
        children: [
          {
            _key: 'child-1',
            _type: 'span',
            text: 'Alice loved geology and could name every rock in the garden. She volunteered at the local library for 45 years.',
            marks: []
          }
        ],
        text: 'Alice loved geology and could name every rock in the garden. She volunteered at the local library for 45 years.'
      }
    ],
    bornAt: {
      location: 'Boston, Massachusetts',
      coordinates: { lat: 42.3601, lng: -71.0589 }
    },
    diedAt: {
      location: 'Portland, Maine',
      coordinates: { lat: 43.6591, lng: -70.2568 }
    },
    guestbook: [
      {
        _id: 'guest-1',
        author: 'Margaret Johnson',
        message: 'Alice was such an inspiration to me. She helped me discover my love for reading.',
        status: 'approved',
        createdAt: '2024-01-15T10:30:00Z'
      }
    ],
    status: 'approved',
    createdAt: '2023-12-01T09:00:00Z',
    updatedAt: '2024-01-15T14:20:00Z'
  },
  {
    _id: 'bosse-anderson-1945',
    title: 'Bosse Anderson',
    name: 'Bosse Anderson',
    slug: { current: 'bosse' },
    born: '1945-03-22',
    died: '2023-11-15',
    description: 'A loving father, passionate fisherman, and community leader who brought joy to everyone he met.',
    gallery: [
      {
        _key: 'bosse-1',
        url: '/images/bosse-1.jpg',
        alt: 'Bosse fishing on the lake',
        width: 600,
        height: 400
      },
      {
        _key: 'bosse-2',
        url: '/images/bosse-2.jpg', 
        alt: 'Bosse with his family',
        width: 500,
        height: 600
      },
      {
        _key: 'bosse-3',
        url: '/images/bosse-3.jpg',
        alt: 'Bosse at his retirement party',
        width: 400,
        height: 300
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story-1',
        children: [
          {
            _key: 'child-1',
            _type: 'span',
            text: 'Bosse was born in Stockholm and moved to Minnesota in 1970, where he fell in love with the lakes and forests.',
            marks: []
          }
        ],
        text: 'Bosse was born in Stockholm and moved to Minnesota in 1970, where he fell in love with the lakes and forests.'
      },
      {
        _type: 'block',
        _key: 'story-2',
        children: [
          {
            _key: 'child-2',
            _type: 'span',
            text: 'He spent 30 years as a carpenter, building homes and memories throughout the Twin Cities area. His craftsmanship was legendary, but his kindness was even more remarkable.',
            marks: []
          }
        ],
        text: 'He spent 30 years as a carpenter, building homes and memories throughout the Twin Cities area. His craftsmanship was legendary, but his kindness was even more remarkable.'
      },
      {
        _type: 'block',
        _key: 'story-3',
        children: [
          {
            _key: 'child-3',
            _type: 'span',
            text: 'Every summer, Bosse would take his children and grandchildren fishing at Lake Minnetonka. These trips became the foundation of countless family stories and traditions.',
            marks: []
          }
        ],
        text: 'Every summer, Bosse would take his children and grandchildren fishing at Lake Minnetonka. These trips became the foundation of countless family stories and traditions.'
      }
    ],
    bornAt: {
      location: 'Stockholm, Sweden',
      coordinates: { lat: 59.3293, lng: 18.0686 }
    },
    diedAt: {
      location: 'Minneapolis, Minnesota',
      coordinates: { lat: 44.9778, lng: -93.2650 }
    },
    guestbook: [
      {
        _id: 'guest-bosse-1',
        author: 'Erik Anderson',
        message: 'Dad, you taught me everything about being a good man. I love you forever.',
        status: 'approved',
        createdAt: '2023-11-20T15:45:00Z'
      },
      {
        _id: 'guest-bosse-2',
        author: 'Maria Johansson',
        message: 'Uncle Bosse always had the best fishing stories and the warmest hugs. Missing you terribly.',
        status: 'approved',
        createdAt: '2023-11-22T09:30:00Z'
      },
      {
        _id: 'guest-bosse-3',
        author: 'Tom Wilson',
        message: 'Bosse built our family home in 1985. Every day I walk through those doors, I think of his skill and dedication.',
        status: 'approved',
        createdAt: '2023-12-01T11:15:00Z'
      }
    ],
    status: 'approved',
    createdAt: '2023-11-16T08:00:00Z',
    updatedAt: '2023-12-01T16:30:00Z'
  }
];