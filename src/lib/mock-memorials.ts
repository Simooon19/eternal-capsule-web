import { Memorial } from '@/types/memorial';

export const mockMemorials: Memorial[] = [
  {
    _id: 'mock-1',
    name: 'Anna Lindström',
    title: 'Anna Lindström',
    description: 'En älskad lärare och mormodern som berörd många liv',
    subtitle: 'En älskad lärare och mormodern som berörd många liv',
    slug: {
      current: 'anna-lindstrom-1942',
    },
    born: '1942-03-15',
    died: '2023-11-08',
    bornAt: {
      location: 'Stockholm, Sverige',
      coordinates: { lat: 59.3293, lng: 18.0686 }
    },
    diedAt: {
      location: 'Göteborg, Sverige',
      coordinates: { lat: 57.7089, lng: 11.9746 }
    },
    personalInfo: {
      dateOfBirth: '1942-03-15',
      dateOfDeath: '2023-11-08',
      age: 81,
      birthLocation: 'Stockholm, Sverige',
      deathLocation: 'Göteborg, Sverige',
      restingPlace: {
        cemetery: 'Östra kyrkogården',
        section: 'Sektion C',
        coordinates: { lat: 57.7089, lng: 11.9746 }
      }
    },
    coverImage: {
      url: '/images/memorial-photo-1.svg',
      alt: 'Anna Lindström minnesbild'
    },
    gallery: [
      {
        url: '/images/memorial-photo-1.svg',
        alt: 'Anna med sin familj',
        caption: 'Anna med sina barnbarn vid midsommar 2020'
      },
      {
        url: '/images/memorial-photo-2.svg',
        alt: 'Anna på jobbet',
        caption: 'Anna i sitt klassrum som hon älskade så mycket'
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story1',
        style: 'normal',
        text: 'Anna Lindström arbetade som grundskolelärare i över 40 år. Hon var känd för sin vänlighet och sitt tålamod med både elever och kollegor. Hennes passion för utbildning och omsorg om andra kommer att minnas för alltid.',
      }
    ],
    tags: ['lärare', 'mormor', 'vänlig'],
    status: 'published' as const,
    createdAt: '2023-11-15T10:00:00Z',
    updatedAt: '2023-11-15T10:00:00Z',
    _createdAt: '2023-11-15T10:00:00Z',
    _updatedAt: '2023-11-15T10:00:00Z',
    nfcTagUid: 'nfc_anna_1942_memorial',
    viewCount: 127,
    privacy: 'public'
  },
  {
    _id: 'mock-2',
    name: 'Erik Johansson',
    title: 'Erik Johansson',
    description: 'En begåvad musiker och musikpedagog',
    subtitle: 'En begåvad musiker och musikpedagog',
    slug: {
      current: 'erik-johansson-1955',
    },
    born: '1955-06-20',
    died: '2024-01-12',
    bornAt: {
      location: 'Malmö, Sverige',
      coordinates: { lat: 55.6050, lng: 13.0038 }
    },
    diedAt: {
      location: 'Malmö, Sverige',
      coordinates: { lat: 55.6050, lng: 13.0038 }
    },
    personalInfo: {
      dateOfBirth: '1955-06-20',
      dateOfDeath: '2024-01-12',
      age: 68,
      birthLocation: 'Malmö, Sverige',
      deathLocation: 'Malmö, Sverige',
      restingPlace: {
        cemetery: 'Sankt Pauli kyrkogård',
        section: 'Musikernas vila',
        coordinates: { lat: 55.6050, lng: 13.0038 }
      }
    },
    coverImage: {
      url: '/images/memorial-photo-2.svg',
      alt: 'Erik Johansson minnesbild'
    },
    gallery: [
      {
        url: '/images/memorial-photo-2.svg',
        alt: 'Erik vid pianot',
        caption: 'Erik vid sitt älskade piano hemma i studion'
      }
    ],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story2',
        style: 'normal',
        text: 'Erik var en passionerad musiker som undervisade i piano i över 35 år. Hans elever minns hans tålamod och förmåga att få dem att älska musik. Hans melodier kommer att leva vidare i allas hjärtan.',
      }
    ],
    tags: ['musiker', 'pianist', 'lärare'],
    status: 'published' as const,
    createdAt: '2024-01-20T14:00:00Z',
    updatedAt: '2024-01-20T14:00:00Z',
    _createdAt: '2024-01-20T14:00:00Z',
    _updatedAt: '2024-01-20T14:00:00Z',
    nfcTagUid: 'nfc_erik_1955_memorial',
    viewCount: 89,
    privacy: 'public'
  },
  {
    _id: 'mock-3',
    name: 'Margareta Svensson',
    title: 'Margareta Svensson',
    description: 'En hängiven sjuksköterska och samhällsengagerad kvinna',
    subtitle: 'En hängiven sjuksköterska och samhällsengagerad kvinna',
    slug: {
      current: 'margareta-svensson-1948',
    },
    born: '1948-12-03',
    died: '2023-09-22',
    bornAt: {
      location: 'Uppsala, Sverige',
      coordinates: { lat: 59.8586, lng: 17.6389 }
    },
    diedAt: {
      location: 'Stockholm, Sverige',
      coordinates: { lat: 59.3293, lng: 18.0686 }
    },
    personalInfo: {
      dateOfBirth: '1948-12-03',
      dateOfDeath: '2023-09-22',
      age: 74,
      birthLocation: 'Uppsala, Sverige',
      deathLocation: 'Stockholm, Sverige',
      restingPlace: {
        cemetery: 'Skogskyrkogården',
        section: 'Sektion 8',
        coordinates: { lat: 59.2581, lng: 18.1053 }
      }
    },
    coverImage: {
      url: '/images/memorial-photo-3.svg',
      alt: 'Margareta Svensson minnesbild'
    },
    gallery: [],
    storyBlocks: [
      {
        _type: 'block',
        _key: 'story3',
        style: 'normal',
        text: 'Margareta ägnade sitt liv åt att vårda andra som sjuksköterska på Karolinska sjukhuset. Hon var djupt involverad i sin gemenskap och volontärarbetade för flera välgörenhetsorganisationer.',
      }
    ],
    tags: ['sjuksköterska', 'volontär', 'omtänksam'],
    status: 'published' as const,
    createdAt: '2023-10-01T09:00:00Z',
    updatedAt: '2023-10-01T09:00:00Z',
    _createdAt: '2023-10-01T09:00:00Z',
    _updatedAt: '2023-10-01T09:00:00Z',
    nfcTagUid: 'nfc_margareta_1948_memorial',
    viewCount: 156,
    privacy: 'public'
  }
];