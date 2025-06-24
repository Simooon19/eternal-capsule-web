// Jest setup file for Eternal Capsule testing environment
require('@testing-library/jest-dom')

// Mock crypto.randomUUID for Node.js environment
global.crypto = {
  randomUUID: jest.fn(() => 'test-uuid-123'),
  subtle: {},
  getRandomValues: jest.fn()
}

// Mock Next.js router
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}))

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/',
}))

// Mock environment variables
process.env.NEXT_PUBLIC_SITE_URL = 'http://localhost:3000'
process.env.NEXT_PUBLIC_SANITY_PROJECT_ID = 'test_project'
process.env.NEXT_PUBLIC_SANITY_DATASET = 'test'
process.env.NODE_ENV = 'test'

// Mock Sanity client with proper urlForImage function
jest.mock('@/lib/sanity', () => ({
  client: {
    fetch: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  },
  urlForImage: jest.fn(() => ({
    url: () => 'https://example.com/test-image.jpg'
  })),
  writeClient: {
    fetch: jest.fn(),
    create: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn(),
  }
}))

// Mock Redis
jest.mock('@/lib/redis', () => ({
  rateLimit: jest.fn(),
  clearRateLimit: jest.fn(),
  getFromCache: jest.fn(),
  setCache: jest.fn(),
  isRedisConnected: () => false,
}))

// Mock Stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(),
      },
    },
    webhooks: {
      constructEvent: jest.fn(),
    },
  }))
})

// Mock Leaflet for map components
global.L = {
  map: jest.fn(() => ({
    setView: jest.fn(),
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
  })),
  marker: jest.fn(() => ({
    addTo: jest.fn(),
    bindPopup: jest.fn(),
  })),
  tileLayer: jest.fn(() => ({
    addTo: jest.fn(),
  })),
}

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}))

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.localStorage = localStorageMock

// Mock sessionStorage
const sessionStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
}
global.sessionStorage = sessionStorageMock

// Mock URL and URLSearchParams for Node.js environment
if (typeof globalThis.URL === 'undefined') {
  globalThis.URL = URL
}
if (typeof globalThis.URLSearchParams === 'undefined') {
  globalThis.URLSearchParams = URLSearchParams
}

// Custom test utilities with proper memorial data structure
global.mockMemorial = {
  _id: 'test-memorial-1',
  slug: { current: 'test-memorial' },
  name: 'Test Memorial',
  title: 'Test Memorial',
  born: '1950-01-01',
  died: '2023-01-01',
  subtitle: 'A loving memory',
  gallery: [
    {
      _key: 'photo1',
      asset: {
        _ref: 'image-123',
        url: 'https://example.com/test-image.jpg'
      },
      alt: 'Test photo'
    }
  ],
  bornAt: {
    location: 'New York, NY'
  },
  diedAt: {
    location: 'San Francisco, CA'
  },
  storyBlocks: [
    {
      _key: 'story1',
      _type: 'block',
      children: [{ _type: 'span', text: 'A wonderful life story' }]
    }
  ],
  stats: {
    views: 150,
    guestbookEntries: 12,
    lastActivity: new Date().toISOString()
  },
  _createdAt: '2023-01-01T00:00:00Z',
  _updatedAt: '2023-01-01T00:00:00Z'
}

global.mockUser = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  subscription: 'family',
}

// Suppress console warnings in tests unless explicitly testing them
const originalConsoleError = console.error
const originalConsoleWarn = console.warn

beforeAll(() => {
  console.error = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is no longer supported')
    ) {
      return
    }
    originalConsoleError.call(console, ...args)
  }

  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('componentWillReceiveProps has been renamed')
    ) {
      return
    }
    originalConsoleWarn.call(console, ...args)
  }
})

afterAll(() => {
  console.error = originalConsoleError
  console.warn = originalConsoleWarn
}) 