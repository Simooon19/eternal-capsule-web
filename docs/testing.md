# 🧪 Testing Guide - Eternal Capsule

This guide covers the comprehensive testing strategy for the Eternal Capsule platform, including unit tests, integration tests, and end-to-end testing.

## 📋 Testing Overview

Our testing strategy ensures high code quality, reliability, and performance across the entire platform:

- **Unit Tests**: Component and function-level testing with Jest and React Testing Library
- **Integration Tests**: API and service integration testing
- **End-to-End Tests**: Full user journey testing with Playwright
- **Performance Tests**: Core Web Vitals and load testing
- **Accessibility Tests**: WCAG compliance testing

## 🏗️ Testing Stack

### Core Testing Framework
- **Jest**: JavaScript testing framework with snapshot support
- **React Testing Library**: Component testing with user-centric approach
- **Playwright**: Cross-browser end-to-end testing
- **MSW (Mock Service Worker)**: API mocking for testing

### Coverage Goals
- **Branches**: 70% target
- **Functions**: 70% target
- **Lines**: 70% target
- **Statements**: 70% target

## 🚀 Quick Start

### Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run end-to-end tests
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# Run all validation (types, lint, tests)
pnpm validate
```

### Test File Structure

```
src/
├── components/
│   ├── __tests__/           # Component unit tests
│   │   ├── MemorialCard.test.tsx
│   │   └── HeroSection.test.tsx
│   └── Component.tsx
├── lib/
│   ├── __tests__/           # Utility function tests
│   │   ├── analytics.test.ts
│   │   └── cache.test.ts
│   └── utility.ts
└── app/
    └── __tests__/           # Page and API tests
        ├── api/
        │   └── health.test.ts
        └── page.test.tsx

e2e/                         # End-to-end tests
├── fixtures/                # Test data and fixtures
├── pages/                   # Page object models
└── tests/                   # E2E test files
    ├── memorial-creation.spec.ts
    ├── user-authentication.spec.ts
    └── payment-flow.spec.ts
```

## 🧪 Unit Testing

### Component Testing Best Practices

```typescript
// src/components/__tests__/MemorialCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemorialCard } from '../MemorialCard'

describe('MemorialCard', () => {
  const mockMemorial = {
    id: 'memorial-123',
    name: 'John Doe',
    birthDate: '1950-05-15',
    deathDate: '2023-12-01',
    description: 'A loving father...',
    photos: [{ asset: { url: 'test.jpg' }, alt: 'Portrait' }],
    location: { address: 'San Francisco, CA' },
    tags: ['father', 'loving'],
    stats: { views: 150, guestbookEntries: 12 }
  }

  it('renders memorial information correctly', () => {
    render(<MemorialCard memorial={mockMemorial} />)
    
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('1950 - 2023')).toBeInTheDocument()
    expect(screen.getByText(/A loving father/)).toBeInTheDocument()
    expect(screen.getByText('San Francisco, CA')).toBeInTheDocument()
  })

  it('handles user interactions', async () => {
    const user = userEvent.setup()
    render(<MemorialCard memorial={mockMemorial} />)
    
    const card = screen.getByRole('link')
    await user.click(card)
    
    expect(card).toHaveAttribute('href', '/memorial/john-doe-memorial')
  })

  it('displays fallback for missing data', () => {
    const minimalMemorial = { ...mockMemorial, photos: [], location: null }
    render(<MemorialCard memorial={minimalMemorial} />)
    
    expect(screen.getByText('No photo available')).toBeInTheDocument()
  })
})
```

### API Testing

```typescript
// src/app/api/__tests__/health.test.ts
import { GET } from '../health/route'
import { NextRequest } from 'next/server'

// Mock external dependencies
jest.mock('@/lib/prisma', () => ({
  prisma: { $queryRaw: jest.fn() }
}))

jest.mock('@/lib/sanity', () => ({
  sanityClient: { fetch: jest.fn() }
}))

describe('/api/health', () => {
  it('returns healthy status when all services are up', async () => {
    const request = new NextRequest('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data.status).toBe('healthy')
    expect(data.services).toHaveProperty('database')
    expect(data.services).toHaveProperty('sanity')
  })

  it('returns degraded status when services are slow', async () => {
    // Mock slow response
    jest.mocked(prisma.$queryRaw).mockImplementation(() => 
      new Promise(resolve => setTimeout(resolve, 3000))
    )
    
    const request = new NextRequest('http://localhost/api/health')
    const response = await GET(request)
    const data = await response.json()
    
    expect(data.status).toBe('degraded')
  })
})
```

### Bulk Memorial API Testing

```typescript
// src/app/api/__tests__/bulk-memorials.test.ts
import { POST } from '../memorials/bulk/route'
import { NextRequest } from 'next/server'
import { getServerSession } from 'next-auth'

// Mock dependencies
jest.mock('next-auth', () => ({
  getServerSession: jest.fn()
}))

jest.mock('@/lib/sanity', () => ({
  client: {
    create: jest.fn(),
    fetch: jest.fn()
  }
}))

jest.mock('@/lib/rateLimit', () => ({
  rateLimiters: {
    bulkCreation: {
      checkLimit: jest.fn()
    }
  }
}))

describe('/api/memorials/bulk', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('creates multiple memorials successfully', async () => {
    // Mock funeral home session
    jest.mocked(getServerSession).mockResolvedValue({
      user: { planId: 'funeral', id: 'user-123' }
    })

    // Mock rate limit success
    require('@/lib/rateLimit').rateLimiters.bulkCreation.checkLimit.mockResolvedValue({
      success: true
    })

    // Mock Sanity create responses
    const { client } = require('@/lib/sanity')
    client.create
      .mockResolvedValueOnce({
        _id: 'memorial-1',
        slug: { current: 'john-doe-memorial-1' },
        nfcTagUid: 'nfc_123_abc'
      })
      .mockResolvedValueOnce({
        _id: 'memorial-2', 
        slug: { current: 'jane-smith-memorial-2' },
        nfcTagUid: 'nfc_124_def'
      })

    const request = new NextRequest('http://localhost/api/memorials/bulk', {
      method: 'POST',
      body: JSON.stringify({
        memorials: [
          {
            name: 'John Doe',
            born: '1950-05-15',
            died: '2023-12-01',
            familyEmail: 'family@example.com'
          },
          {
            name: 'Jane Smith',
            born: '1955-08-20', 
            died: '2023-11-15',
            familyEmail: 'jane@example.com'
          }
        ]
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.created).toBe(2)
    expect(data.failed).toBe(0)
    expect(data.results).toHaveLength(2)
    expect(data.results[0].memorial.nfcTagUid).toMatch(/^nfc_\d+_[a-z0-9]+$/)
  })

  it('handles validation errors gracefully', async () => {
    jest.mocked(getServerSession).mockResolvedValue({
      user: { planId: 'funeral', id: 'user-123' }
    })

    require('@/lib/rateLimit').rateLimiters.bulkCreation.checkLimit.mockResolvedValue({
      success: true
    })

    const request = new NextRequest('http://localhost/api/memorials/bulk', {
      method: 'POST',
      body: JSON.stringify({
        memorials: [
          {
            name: '', // Missing required field
            born: '1950-05-15',
            died: '2023-12-01'
          }
        ]
      })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.created).toBe(0)
    expect(data.failed).toBe(1)
    expect(data.errors).toHaveLength(1)
    expect(data.errors[0].error).toContain('name')
  })

  it('rejects unauthorized users', async () => {
    jest.mocked(getServerSession).mockResolvedValue({
      user: { planId: 'free', id: 'user-123' } // Free plan not allowed
    })

    const request = new NextRequest('http://localhost/api/memorials/bulk', {
      method: 'POST',
      body: JSON.stringify({ memorials: [] })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(403)
    expect(data.error).toContain('funeral home or enterprise plan')
  })

  it('respects rate limits', async () => {
    jest.mocked(getServerSession).mockResolvedValue({
      user: { planId: 'funeral', id: 'user-123' }
    })

    // Mock rate limit exceeded
    require('@/lib/rateLimit').rateLimiters.bulkCreation.checkLimit.mockResolvedValue({
      success: false,
      message: 'Rate limit exceeded'
    })

    const request = new NextRequest('http://localhost/api/memorials/bulk', {
      method: 'POST',
      body: JSON.stringify({ memorials: [] })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(429)
    expect(data.error).toBe('Rate limit exceeded')
  })
})
```

### CSV Import Component Testing

```typescript
// src/components/__tests__/CSVImport.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useSession } from 'next-auth/react'
import CSVImport from '../memorial/CSVImport'

// Mock dependencies
jest.mock('next-auth/react')
jest.mock('@/lib/bulkMemorialHelper')

const mockSession = {
  user: { planId: 'funeral', id: 'user-123' }
}

describe('CSVImport Component', () => {
  beforeEach(() => {
    jest.mocked(useSession).mockReturnValue({
      data: mockSession,
      status: 'authenticated'
    })
    
    global.fetch = jest.fn()
    global.URL.createObjectURL = jest.fn(() => 'mock-url')
    global.URL.revokeObjectURL = jest.fn()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders for authorized users', () => {
    render(<CSVImport />)
    
    expect(screen.getByText('📄 CSV Memorial Import')).toBeInTheDocument()
    expect(screen.getByText('Download Template')).toBeInTheDocument()
    expect(screen.getByLabelText(/choose csv file/i)).toBeInTheDocument()
  })

  it('shows upgrade required for unauthorized users', () => {
    jest.mocked(useSession).mockReturnValue({
      data: { user: { planId: 'free' } },
      status: 'authenticated'
    })

    render(<CSVImport />)
    
    expect(screen.getByText('Upgrade Required')).toBeInTheDocument()
    expect(screen.getByText(/csv import requires/i)).toBeInTheDocument()
  })

  it('handles CSV file upload and parsing', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = jest.fn()
    
    // Mock CSV parsing helper
    const { generateSampleCSV } = require('@/lib/bulkMemorialHelper')
    generateSampleCSV.mockReturnValue('name,born,died\nJohn Doe,1950-05-15,2023-12-01')

    render(<CSVImport onSuccess={mockOnSuccess} />)
    
    const csvContent = 'name,born,died\nJohn Doe,1950-05-15,2023-12-01'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    const fileInput = screen.getByLabelText(/choose csv file/i)
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText(/preview/i)).toBeInTheDocument()
      expect(screen.getByText('John Doe')).toBeInTheDocument()
    })
  })

  it('validates CSV format and shows errors', async () => {
    const user = userEvent.setup()
    render(<CSVImport />)
    
    const invalidCsvContent = 'invalid,format\nno,data'
    const file = new File([invalidCsvContent], 'invalid.csv', { type: 'text/csv' })
    
    const fileInput = screen.getByLabelText(/choose csv file/i)
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(screen.getByText(/missing required column/i)).toBeInTheDocument()
    })
  })

  it('handles successful bulk import', async () => {
    const user = userEvent.setup()
    const mockOnSuccess = jest.fn()
    
    // Mock successful API response
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        success: true,
        created: 1,
        failed: 0,
        results: [{
          index: 0,
          success: true,
          memorial: {
            id: 'memorial-123',
            slug: 'john-doe-memorial-123',
            url: 'http://localhost:3000/memorial/john-doe-memorial-123',
            nfcTagUid: 'nfc_123_abc'
          }
        }]
      })
    })

    render(<CSVImport onSuccess={mockOnSuccess} />)
    
    // Upload valid CSV
    const csvContent = 'name,born,died\nJohn Doe,1950-05-15,2023-12-01'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    const fileInput = screen.getByLabelText(/choose csv file/i)
    await user.upload(fileInput, file)
    
    // Wait for preview and click import
    await waitFor(() => {
      expect(screen.getByText('Import Memorials')).toBeInTheDocument()
    })
    
    const importButton = screen.getByText('Import Memorials')
    await user.click(importButton)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        created: 1
      }))
    })
  })

  it('handles import errors gracefully', async () => {
    const user = userEvent.setup()
    const mockOnError = jest.fn()
    
    // Mock API error response
    jest.mocked(fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'Rate limit exceeded'
      })
    })

    render(<CSVImport onError={mockOnError} />)
    
    // Upload and try to import
    const csvContent = 'name,born,died\nJohn Doe,1950-05-15,2023-12-01'
    const file = new File([csvContent], 'test.csv', { type: 'text/csv' })
    
    const fileInput = screen.getByLabelText(/choose csv file/i)
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      const importButton = screen.getByText('Import Memorials')
      return user.click(importButton)
    })
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Rate limit exceeded')
    })
  })

  it('downloads sample CSV template', async () => {
    const user = userEvent.setup()
    
    // Mock template generation
    const { generateSampleCSV } = require('@/lib/bulkMemorialHelper')
    generateSampleCSV.mockReturnValue('name,born,died\nJohn Doe,1950-05-15,2023-12-01')
    
    render(<CSVImport />)
    
    const downloadButton = screen.getByText('Download Template')
    await user.click(downloadButton)
    
    expect(generateSampleCSV).toHaveBeenCalled()
    expect(global.URL.createObjectURL).toHaveBeenCalled()
  })

  it('validates file type restrictions', async () => {
    const user = userEvent.setup()
    const mockOnError = jest.fn()
    
    render(<CSVImport onError={mockOnError} />)
    
    const invalidFile = new File(['content'], 'test.txt', { type: 'text/plain' })
    const fileInput = screen.getByLabelText(/choose csv file/i)
    
    await user.upload(fileInput, invalidFile)
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith('Please select a CSV file')
    })
  })

  it('handles file size limitations', async () => {
    const user = userEvent.setup()
    const mockOnError = jest.fn()
    
    render(<CSVImport onError={mockOnError} />)
    
    // Create CSV with > 50 memorials
    const csvHeader = 'name,born,died\n'
    const csvRows = Array.from({ length: 51 }, (_, i) => `Person ${i},1950-01-01,2023-01-01`).join('\n')
    const largeCsv = csvHeader + csvRows
    
    const file = new File([largeCsv], 'large.csv', { type: 'text/csv' })
    const fileInput = screen.getByLabelText(/choose csv file/i)
    
    await user.upload(fileInput, file)
    
    await waitFor(() => {
      expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('more than 50 memorials'))
    })
  })
})
```

### Bulk Memorial Helper Testing

```typescript
// src/lib/__tests__/bulkMemorialHelper.test.ts
import {
  validateMemorial,
  validateBulkRequest,
  csvToMemorials,
  generateSampleCSV,
  formatBulkResponse
} from '../bulkMemorialHelper'

describe('Bulk Memorial Helper Functions', () => {
  describe('validateMemorial', () => {
    it('validates complete memorial data', () => {
      const memorial = {
        name: 'John Doe',
        born: '1950-05-15',
        died: '2023-12-01',
        familyEmail: 'family@example.com'
      }
      
      const result = validateMemorial(memorial)
      
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('catches missing required fields', () => {
      const memorial = {
        name: '',
        born: '1950-05-15',
        died: ''
      }
      
      const result = validateMemorial(memorial)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Name is required')
      expect(result.errors).toContain('Death date is required')
    })

    it('validates date logic', () => {
      const memorial = {
        name: 'John Doe',
        born: '2023-12-01',
        died: '1950-05-15' // Death before birth
      }
      
      const result = validateMemorial(memorial)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Death date must be after birth date')
    })

    it('validates email format', () => {
      const memorial = {
        name: 'John Doe',
        born: '1950-05-15',
        died: '2023-12-01',
        familyEmail: 'invalid-email'
      }
      
      const result = validateMemorial(memorial)
      
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Family email must be a valid email address')
    })
  })

  describe('csvToMemorials', () => {
    it('parses valid CSV data', () => {
      const csvData = 'name,born,died,familyEmail\nJohn Doe,1950-05-15,2023-12-01,family@example.com'
      
      const result = csvToMemorials(csvData)
      
      expect(result.memorials).toHaveLength(1)
      expect(result.memorials[0].name).toBe('John Doe')
      expect(result.memorials[0].familyEmail).toBe('family@example.com')
      expect(result.errors).toHaveLength(0)
    })

    it('handles CSV with tags', () => {
      const csvData = 'name,born,died,tags\nJohn Doe,1950-05-15,2023-12-01,father|husband|veteran'
      
      const result = csvToMemorials(csvData)
      
      expect(result.memorials[0].tags).toEqual(['father', 'husband', 'veteran'])
    })

    it('skips invalid rows and reports errors', () => {
      const csvData = 'name,born,died\nJohn Doe,1950-05-15,2023-12-01\n,1955-01-01,2023-01-01'
      
      const result = csvToMemorials(csvData)
      
      expect(result.memorials).toHaveLength(1)
      expect(result.skipped).toBe(1)
      expect(result.errors).toContain('Row 3: Name is required')
    })

    it('validates required headers', () => {
      const csvData = 'fullname,birthday\nJohn Doe,1950-05-15'
      
      const result = csvToMemorials(csvData)
      
      expect(result.memorials).toHaveLength(0)
      expect(result.errors).toContain('Missing required columns: name, born, died')
    })
  })

  describe('generateSampleCSV', () => {
    it('generates proper CSV format', () => {
      const csv = generateSampleCSV()
      const lines = csv.split('\n')
      
      expect(lines[0]).toBe('name,born,died,birthLocation,deathLocation,description,familyEmail,tags')
      expect(lines.length).toBeGreaterThan(1)
      expect(lines[1]).toContain('John Doe')
    })
  })

  describe('formatBulkResponse', () => {
    it('formats successful response', () => {
      const response = {
        success: true,
        created: 2,
        failed: 0,
        results: [
          {
            index: 0,
            success: true,
            memorial: {
              id: 'memorial-1',
              slug: 'john-doe',
              url: 'http://example.com/memorial/john-doe',
              nfcTagUid: 'nfc_123'
            }
          }
        ]
      }
      
      const formatted = formatBulkResponse(response)
      
      expect(formatted.summary).toContain('Created 2 of 2 memorials')
      expect(formatted.successList[0]).toContain('✅')
      expect(formatted.errorList).toHaveLength(0)
    })

    it('formats response with errors', () => {
      const response = {
        success: true,
        created: 1,
        failed: 1,
        results: [],
        errors: [{
          index: 1,
          error: 'Missing name field',
          data: {}
        }]
      }
      
      const formatted = formatBulkResponse(response)
      
      expect(formatted.summary).toContain('Created 1 of 2 memorials')
      expect(formatted.errorList[0]).toContain('❌ Row 2: Missing name field')
    })
  })
})
```

### Utility Function Testing

```typescript
// src/lib/__tests__/analytics.test.ts
import { trackEvent, getSessionId } from '../analytics'

describe('Analytics Utilities', () => {
  beforeEach(() => {
    localStorage.clear()
    jest.clearAllMocks()
  })

  describe('trackEvent', () => {
    it('tracks events with correct properties', () => {
      const mockGtag = jest.fn()
      global.gtag = mockGtag

      trackEvent('memorial_view', {
        memorial_id: 'test-123',
        source: 'qr_code'
      })

      expect(mockGtag).toHaveBeenCalledWith('event', 'memorial_view', {
        memorial_id: 'test-123',
        source: 'qr_code'
      })
    })

    it('handles missing gtag gracefully', () => {
      global.gtag = undefined
      
      expect(() => {
        trackEvent('test_event', {})
      }).not.toThrow()
    })
  })

  describe('getSessionId', () => {
    it('generates and persists session ID', () => {
      const sessionId = getSessionId()
      
      expect(sessionId).toBeDefined()
      expect(localStorage.getItem('session_id')).toBe(sessionId)
    })

    it('returns existing session ID', () => {
      localStorage.setItem('session_id', 'existing-session')
      
      const sessionId = getSessionId()
      expect(sessionId).toBe('existing-session')
    })
  })
})
```

## 🌐 End-to-End Testing

### Test Structure

```typescript
// e2e/tests/memorial-creation.spec.ts
import { test, expect } from '@playwright/test'
import { MemorialPage } from '../pages/MemorialPage'
import { AuthPage } from '../pages/AuthPage'

test.describe('Memorial Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const authPage = new AuthPage(page)
    await authPage.login('test@example.com', 'password123')
  })

  test('creates memorial with all required fields', async ({ page }) => {
    const memorialPage = new MemorialPage(page)
    
    await memorialPage.goto()
    await memorialPage.fillBasicInfo({
      name: 'John Doe',
      birthDate: '1950-05-15',
      deathDate: '2023-12-01',
      description: 'A loving father and husband...'
    })
    
    await memorialPage.uploadPhoto('test-photos/john-doe.jpg')
    await memorialPage.setLocation('San Francisco, CA')
    await memorialPage.addTags(['father', 'loving', 'husband'])
    
    await memorialPage.submit()
    
    await expect(page).toHaveURL(/\/memorial\/john-doe-memorial/)
    await expect(page.locator('h1')).toContainText('John Doe')
  })

  test('validates required fields', async ({ page }) => {
    const memorialPage = new MemorialPage(page)
    
    await memorialPage.goto()
    await memorialPage.submit()
    
    await expect(page.locator('.error-message')).toContainText('Name is required')
  })

  test('handles upload errors gracefully', async ({ page }) => {
    const memorialPage = new MemorialPage(page)
    
    await memorialPage.goto()
    await memorialPage.uploadInvalidFile('test-files/invalid.txt')
    
    await expect(page.locator('.error-message')).toContainText('Invalid file type')
  })
})
```

### CSV Import E2E Testing

```typescript
// e2e/tests/csv-import.spec.ts
import { test, expect } from '@playwright/test'
import { AuthPage } from '../pages/AuthPage'
import { CSVImportPage } from '../pages/CSVImportPage'
import { DashboardPage } from '../pages/DashboardPage'

test.describe('CSV Import Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login as funeral home user
    const authPage = new AuthPage(page)
    await authPage.login('funeral-home@example.com', 'password123', 'funeral')
  })

  test('complete CSV import workflow', async ({ page }) => {
    const dashboardPage = new DashboardPage(page)
    const csvImportPage = new CSVImportPage(page)
    
    // Navigate to CSV import
    await dashboardPage.goto()
    await dashboardPage.clickFuneralHomeTool('CSV Import')
    
    await expect(page).toHaveURL(/\/dashboard\/csv-import/)
    
    // Download template
    const downloadPromise = page.waitForEvent('download')
    await csvImportPage.downloadTemplate()
    const download = await downloadPromise
    expect(download.suggestedFilename()).toBe('memorial-template.csv')
    
    // Upload CSV file
    const csvContent = 'name,born,died,familyEmail\nJohn Doe,1950-05-15,2023-12-01,family@example.com\nJane Smith,1955-08-20,2023-11-15,jane@example.com'
    await csvImportPage.uploadCSV(csvContent)
    
    // Verify preview
    await expect(csvImportPage.previewTable).toBeVisible()
    await expect(csvImportPage.previewTable.locator('tbody tr')).toHaveCount(2)
    await expect(csvImportPage.previewTable).toContainText('John Doe')
    await expect(csvImportPage.previewTable).toContainText('Jane Smith')
    
    // Import memorials
    await csvImportPage.importMemorials()
    
    // Verify success
    await expect(page.locator('.success-banner')).toBeVisible()
    await expect(page.locator('.success-banner')).toContainText('Import Successful')
    await expect(page.locator('.success-banner')).toContainText('2 memorials')
  })

  test('handles CSV validation errors', async ({ page }) => {
    const csvImportPage = new CSVImportPage(page)
    
    await csvImportPage.goto()
    
    // Upload invalid CSV
    const invalidCSV = 'invalid,headers\nJohn Doe,1950-05-15'
    await csvImportPage.uploadCSV(invalidCSV)
    
    // Verify error message
    await expect(page.locator('.error-message')).toBeVisible()
    await expect(page.locator('.error-message')).toContainText('Missing required columns')
  })

  test('shows upgrade required for free users', async ({ page }) => {
    // Logout and login as free user
    await page.goto('/auth/signin')
    const authPage = new AuthPage(page)
    await authPage.login('free-user@example.com', 'password123', 'free')
    
    const csvImportPage = new CSVImportPage(page)
    await csvImportPage.goto()
    
    // Verify upgrade message
    await expect(page.locator('.upgrade-required')).toBeVisible()
    await expect(page.locator('.upgrade-required')).toContainText('CSV import requires a Funeral Home')
  })

  test('handles large CSV files appropriately', async ({ page }) => {
    const csvImportPage = new CSVImportPage(page)
    
    await csvImportPage.goto()
    
    // Create CSV with > 50 memorials
    const header = 'name,born,died\n'
    const rows = Array.from({ length: 51 }, (_, i) => `Person ${i},1950-01-01,2023-01-01`).join('\n')
    const largeCsv = header + rows
    
    await csvImportPage.uploadCSV(largeCsv)
    
    // Verify size limit error
    await expect(page.locator('.error-message')).toContainText('more than 50 memorials')
  })

  test('memorial approval workflow after import', async ({ page }) => {
    const csvImportPage = new CSVImportPage(page)
    const dashboardPage = new DashboardPage(page)
    
    // Import memorials
    await csvImportPage.goto()
    const csvContent = 'name,born,died\nTest Person,1950-05-15,2023-12-01'
    await csvImportPage.uploadCSV(csvContent)
    await csvImportPage.importMemorials()
    
    // Navigate to admin panel
    await dashboardPage.goto()
    await dashboardPage.clickFuneralHomeTool('Admin Panel')
    
    // Verify memorial appears in pending list
    await expect(page.locator('[data-testid="pending-memorial"]')).toBeVisible()
    await expect(page.locator('[data-testid="pending-memorial"]')).toContainText('Test Person')
    await expect(page.locator('.bulk-created-badge')).toBeVisible()
    
    // Approve memorial
    await page.locator('[data-testid="approve-memorial"]').click()
    
    // Verify approval success
    await expect(page.locator('.approval-success')).toBeVisible()
  })

  test('tracks import analytics', async ({ page }) => {
    const csvImportPage = new CSVImportPage(page)
    
    // Mock analytics tracking
    await page.route('/api/analytics/interaction', async route => {
      await route.fulfill({ status: 200, body: '{"tracked": true}' })
    })
    
    await csvImportPage.goto()
    
    // Download template (should track)
    await csvImportPage.downloadTemplate()
    
    // Upload CSV (should track)
    const csvContent = 'name,born,died\nTest Person,1950-05-15,2023-12-01'
    await csvImportPage.uploadCSV(csvContent)
    
    // Import (should track)
    await csvImportPage.importMemorials()
    
    // Verify analytics calls were made
    const analyticsRequests = await page.evaluate(() => 
      window.performance.getEntriesByName('/api/analytics/interaction')
    )
    expect(analyticsRequests.length).toBeGreaterThan(0)
  })
})
```

### CSV Import Page Object Model

```typescript
// e2e/pages/CSVImportPage.ts
import { Page, Locator } from '@playwright/test'

export class CSVImportPage {
  readonly page: Page
  readonly uploadInput: Locator
  readonly downloadTemplateButton: Locator
  readonly previewTable: Locator
  readonly importButton: Locator
  readonly cancelButton: Locator

  constructor(page: Page) {
    this.page = page
    this.uploadInput = page.locator('input[type="file"][accept=".csv"]')
    this.downloadTemplateButton = page.locator('button:has-text("Download Template")')
    this.previewTable = page.locator('[data-testid="csv-preview-table"]')
    this.importButton = page.locator('button:has-text("Import Memorials")')
    this.cancelButton = page.locator('button:has-text("Cancel")')
  }

  async goto() {
    await this.page.goto('/dashboard/csv-import')
  }

  async downloadTemplate() {
    await this.downloadTemplateButton.click()
  }

  async uploadCSV(csvContent: string) {
    // Create a temporary file with CSV content
    const buffer = Buffer.from(csvContent)
    const filename = 'test-upload.csv'
    
    await this.uploadInput.setInputFiles({
      name: filename,
      mimeType: 'text/csv',
      buffer: buffer
    })
    
    // Wait for processing
    await this.page.waitForTimeout(1000)
  }

  async importMemorials() {
    await this.importButton.click()
    
    // Wait for import to complete
    await this.page.waitForSelector('.success-banner, .error-message', { timeout: 30000 })
  }

  async cancelImport() {
    await this.cancelButton.click()
  }

  async getPreviewRowCount(): Promise<number> {
    const rows = await this.previewTable.locator('tbody tr').count()
    return rows
  }

  async getPreviewData(): Promise<string[][]> {
    const rows = await this.previewTable.locator('tbody tr').all()
    const data: string[][] = []
    
    for (const row of rows) {
      const cells = await row.locator('td').all()
      const rowData: string[] = []
      
      for (const cell of cells) {
        const text = await cell.textContent()
        rowData.push(text || '')
      }
      
      data.push(rowData)
    }
    
    return data
  }
}
```

### Dashboard Page Object Updates

```typescript
// e2e/pages/DashboardPage.ts (additions)
export class DashboardPage {
  // ... existing code ...

  async clickFuneralHomeTool(toolName: string) {
    const funeralHomeSection = this.page.locator('[data-testid="funeral-home-tools"]')
    const toolLink = funeralHomeSection.locator(`a:has-text("${toolName}")`)
    await toolLink.click()
  }

  async hasFuneralHomeTools(): Promise<boolean> {
    const funeralHomeSection = this.page.locator('[data-testid="funeral-home-tools"]')
    return await funeralHomeSection.isVisible()
  }
}
```

### Page Object Models

```typescript
// e2e/pages/MemorialPage.ts
import { Page, Locator } from '@playwright/test'

export class MemorialPage {
  readonly page: Page
  readonly nameInput: Locator
  readonly birthDateInput: Locator
  readonly deathDateInput: Locator
  readonly descriptionTextarea: Locator
  readonly photoUpload: Locator
  readonly submitButton: Locator

  constructor(page: Page) {
    this.page = page
    this.nameInput = page.locator('[data-testid="memorial-name"]')
    this.birthDateInput = page.locator('[data-testid="birth-date"]')
    this.deathDateInput = page.locator('[data-testid="death-date"]')
    this.descriptionTextarea = page.locator('[data-testid="description"]')
    this.photoUpload = page.locator('[data-testid="photo-upload"]')
    this.submitButton = page.locator('[data-testid="submit-memorial"]')
  }

  async goto() {
    await this.page.goto('/memorial/create')
  }

  async fillBasicInfo(info: {
    name: string
    birthDate: string
    deathDate: string
    description: string
  }) {
    await this.nameInput.fill(info.name)
    await this.birthDateInput.fill(info.birthDate)
    await this.deathDateInput.fill(info.deathDate)
    await this.descriptionTextarea.fill(info.description)
  }

  async uploadPhoto(filePath: string) {
    await this.photoUpload.setInputFiles(filePath)
  }

  async setLocation(address: string) {
    const locationInput = this.page.locator('[data-testid="location-input"]')
    await locationInput.fill(address)
    await this.page.locator('[data-testid="location-suggestion"]').first().click()
  }

  async addTags(tags: string[]) {
    for (const tag of tags) {
      await this.page.locator('[data-testid="tag-input"]').fill(tag)
      await this.page.keyboard.press('Enter')
    }
  }

  async submit() {
    await this.submitButton.click()
  }
}
```

## 🎭 Visual Regression Testing

### Screenshot Testing

```typescript
// e2e/tests/visual-regression.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Visual Regression Tests', () => {
  test('memorial page layout', async ({ page }) => {
    await page.goto('/memorial/sample-memorial')
    
    // Wait for images to load
    await page.waitForLoadState('networkidle')
    
    // Take screenshot
    await expect(page).toHaveScreenshot('memorial-page.png')
  })

  test('responsive memorial card', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }) // Mobile
    await page.goto('/memorial/explore')
    
    const memorialCard = page.locator('[data-testid="memorial-card"]').first()
    await expect(memorialCard).toHaveScreenshot('memorial-card-mobile.png')
  })
})
```

## 🚀 Performance Testing

### Core Web Vitals Testing

```typescript
// e2e/tests/performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Performance Tests', () => {
  test('memorial page meets Core Web Vitals', async ({ page }) => {
    await page.goto('/memorial/sample-memorial')
    
    const performanceEntries = await page.evaluate(() => {
      return new Promise((resolve) => {
        new PerformanceObserver((list) => {
          const entries = list.getEntries()
          resolve(entries.map(entry => ({
            name: entry.name,
            value: entry.startTime,
            type: entry.entryType
          })))
        }).observe({ entryTypes: ['paint', 'largest-contentful-paint'] })
      })
    })
    
    const fcp = performanceEntries.find(e => e.name === 'first-contentful-paint')
    const lcp = performanceEntries.find(e => e.name === 'largest-contentful-paint')
    
    expect(fcp?.value).toBeLessThan(2000) // FCP < 2s
    expect(lcp?.value).toBeLessThan(2500) // LCP < 2.5s
  })

  test('search results load quickly', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/memorial/explore')
    await page.fill('[data-testid="search-input"]', 'john')
    await page.keyboard.press('Enter')
    
    await page.waitForSelector('[data-testid="search-results"]')
    
    const loadTime = Date.now() - startTime
    expect(loadTime).toBeLessThan(3000) // Search results < 3s
  })
})
```

## ♿ Accessibility Testing

### A11y Testing

```typescript
// e2e/tests/accessibility.spec.ts
import { test, expect } from '@playwright/test'
import { injectAxe, checkA11y } from 'axe-playwright'

test.describe('Accessibility Tests', () => {
  test.beforeEach(async ({ page }) => {
    await injectAxe(page)
  })

  test('memorial page is accessible', async ({ page }) => {
    await page.goto('/memorial/sample-memorial')
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true }
    })
  })

  test('keyboard navigation works', async ({ page }) => {
    await page.goto('/memorial/explore')
    
    // Tab through memorial cards
    await page.keyboard.press('Tab')
    const firstCard = page.locator('[data-testid="memorial-card"]').first()
    await expect(firstCard).toBeFocused()
    
    // Enter should activate the card
    await page.keyboard.press('Enter')
    await expect(page).toHaveURL(/\/memorial\//)
  })

  test('screen reader landmarks', async ({ page }) => {
    await page.goto('/')
    
    const landmarks = await page.locator('[role="main"], [role="navigation"], [role="banner"], [role="contentinfo"]').count()
    expect(landmarks).toBeGreaterThan(2) // Should have main navigation and content areas
  })
})
```

## 🔄 Test Data Management

### Fixtures and Factories

```typescript
// e2e/fixtures/memorial.fixture.ts
export const memorialFixture = {
  basic: {
    name: 'John Doe',
    birthDate: '1950-05-15',
    deathDate: '2023-12-01',
    description: 'A loving father and devoted husband...'
  },
  
  withMedia: {
    name: 'Jane Smith',
    birthDate: '1945-08-20',
    deathDate: '2023-11-15',
    description: 'A wonderful mother and grandmother...',
    photos: ['jane-portrait.jpg', 'jane-family.jpg'],
    videos: ['jane-message.mp4']
  },
  
  withLocation: {
    name: 'Robert Johnson',
    birthDate: '1960-03-10',
    deathDate: '2023-10-05',
    description: 'A community leader and friend to all...',
    location: {
      address: 'Central Park, New York, NY',
      lat: 40.7829,
      lng: -73.9654
    }
  }
}

// Factory function for creating test memorials
export function createMemorialFixture(overrides = {}) {
  return {
    ...memorialFixture.basic,
    ...overrides,
    id: `memorial-${Date.now()}`,
    slug: `test-memorial-${Date.now()}`
  }
}
```

### Database Seeding

```typescript
// e2e/global-setup.ts
import { sanityClient } from '../src/lib/sanity'
import { memorialFixture } from './fixtures/memorial.fixture'

async function globalSetup() {
  // Clean up test data
  await sanityClient.delete({ query: '*[_type == "memorial" && slug.current match "test-*"]' })
  
  // Seed test data
  const testMemorials = [
    memorialFixture.basic,
    memorialFixture.withMedia,
    memorialFixture.withLocation
  ]
  
  for (const memorial of testMemorials) {
    await sanityClient.create({
      _type: 'memorial',
      ...memorial,
      slug: { current: `test-${memorial.name.toLowerCase().replace(/\s+/g, '-')}` }
    })
  }
  
  console.log('Test data seeded successfully')
}

export default globalSetup
```

## 📊 Test Reporting

### Coverage Reports

```bash
# Generate coverage report
pnpm test:coverage

# View coverage in browser
open coverage/lcov-report/index.html
```

### E2E Test Reports

```bash
# Run E2E tests with reporting
pnpm test:e2e

# View Playwright report
npx playwright show-report
```

### CI Integration

The GitHub Actions pipeline automatically:
- Runs all tests on pull requests
- Generates coverage reports
- Uploads test artifacts
- Posts results as PR comments
- Blocks deployment if tests fail

## 🏷️ Test Categorization

### Test Tags

Use test tags to categorize and run specific test suites:

```typescript
test.describe('Memorial Management', { tag: '@memorial' }, () => {
  // Memorial-specific tests
})

test.describe('Payment Flow', { tag: '@payment' }, () => {
  // Payment-specific tests
})

test.describe('Critical Path', { tag: '@critical' }, () => {
  // Critical functionality tests
})
```

### Running Tagged Tests

```bash
# Run only memorial tests
npx playwright test --grep "@memorial"

# Run critical path tests
npx playwright test --grep "@critical"

# Exclude flaky tests
npx playwright test --grep-invert "@flaky"
```

## 🔧 Test Configuration

### Environment-Specific Config

```typescript
// playwright.config.ts - Environment configs
const config = {
  // Base configuration
  ...baseConfig,
  
  projects: [
    {
      name: 'local',
      use: { baseURL: 'http://localhost:3000' }
    },
    {
      name: 'staging',
      use: { baseURL: 'https://staging.eternalcapsule.com' }
    },
    {
      name: 'production',
      use: { 
        baseURL: 'https://eternalcapsule.com',
        // More conservative settings for production
        timeout: 60000,
        retries: 3
      }
    }
  ]
}
```

## 📝 Best Practices

### 1. Test Organization
- Group related tests in describe blocks
- Use clear, descriptive test names
- Follow the AAA pattern (Arrange, Act, Assert)

### 2. Test Data
- Use fixtures for consistent test data
- Clean up test data after tests
- Avoid hardcoded values

### 3. Assertions
- Use specific assertions
- Test one thing per test
- Include both positive and negative test cases

### 4. Maintenance
- Update tests when features change
- Remove obsolete tests
- Keep test dependencies minimal

### 5. Performance
- Mock external dependencies
- Use test-specific builds
- Parallelize test execution

---

## 🚀 Getting Started with Testing

1. **Install dependencies**: `pnpm install`
2. **Run unit tests**: `pnpm test`
3. **Generate coverage**: `pnpm test:coverage`
4. **Install browsers**: `npx playwright install`
5. **Run E2E tests**: `pnpm test:e2e`
6. **View reports**: `npx playwright show-report`

For more detailed information, see our [API Documentation](./api.md) and [Deployment Guide](../DEPLOYMENT.md). 

## 🌍 Internationalization Testing

### I18n Test Coverage
Comprehensive testing for multi-language features ensures reliability across all supported locales.

#### **Locale Routing Tests**
```typescript
// e2e/tests/internationalization.spec.ts
import { test, expect } from '@playwright/test';

describe('Internationalization', () => {
  test('automatically redirects root to detected locale', async ({ page }) => {
    // Set Swedish browser language preference
    await page.context().addInitScript(() => {
      Object.defineProperty(navigator, 'language', { value: 'sv-SE' });
    });
    
    await page.goto('/');
    await expect(page).toHaveURL('/sv');
    await expect(page.locator('text=Minnslund')).toBeVisible();
  });

  test('redirects legacy URLs to localized versions', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.url()).toMatch(/\/(en|sv)\/pricing$/);
  });

  test('language switcher works correctly', async ({ page }) => {
    await page.goto('/en');
    
    // Switch to Swedish
    await page.click('text=🇺🇸 English');
    await page.click('text=🇸🇪 Svenska');
    
    await expect(page).toHaveURL('/sv');
    await expect(page.locator('text=Minnslund')).toBeVisible();
    
    // Switch back to English
    await page.click('text=🇸🇪 Svenska');
    await page.click('text=🇺🇸 English');
    
    await expect(page).toHaveURL('/en');
    await expect(page.locator('text=Eternal Capsule')).toBeVisible();
  });
});
```

#### **Translation Loading Tests**
```typescript
// src/components/__tests__/LanguageSwitcher.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { NextIntlClientProvider } from 'next-intl';
import LanguageSwitcher from '../ui/LanguageSwitcher';

// Mock next-intl hooks
jest.mock('next-intl', () => ({
  useLocale: () => 'en',
  useTranslations: () => (key: string) => key,
}));

jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: jest.fn() }),
  usePathname: () => '/en/pricing',
}));

describe('LanguageSwitcher', () => {
  it('displays current locale correctly', () => {
    render(
      <NextIntlClientProvider locale="en" messages={{}}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );
    
    expect(screen.getByText('🇺🇸')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
  });

  it('displays Swedish flag when locale is sv', () => {
    jest.mocked(useLocale).mockReturnValue('sv');
    
    render(
      <NextIntlClientProvider locale="sv" messages={{}}>
        <LanguageSwitcher />
      </NextIntlClientProvider>
    );
    
    expect(screen.getByText('🇸🇪')).toBeInTheDocument();
    expect(screen.getByText('Svenska')).toBeInTheDocument();
  });
});
```

#### **Localized Page Tests**
```typescript
// src/app/[locale]/__tests__/pricing.test.tsx
describe('Localized Pricing Page', () => {
  it('renders English pricing content', async () => {
    const PricingPage = require('../pricing/page').default;
    render(await PricingPage({ params: { locale: 'en' } }));
    
    expect(screen.getByText('Custom Pricing')).toBeInTheDocument();
    expect(screen.getByText('Contact Us')).toBeInTheDocument();
  });

  it('renders Swedish pricing content', async () => {
    const PricingPage = require('../pricing/page').default;
    render(await PricingPage({ params: { locale: 'sv' } }));
    
    expect(screen.getByText('Anpassad Prissättning')).toBeInTheDocument();
    expect(screen.getByText('Kontakta Oss')).toBeInTheDocument();
  });

  it('handles missing translations gracefully', async () => {
    // Mock console.error to avoid noise
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    const PricingPage = require('../pricing/page').default;
    render(await PricingPage({ params: { locale: 'en' } }));
    
    // Should not throw errors for missing translations
    expect(consoleSpy).not.toHaveBeenCalledWith(
      expect.stringContaining('MISSING_MESSAGE')
    );
    
    consoleSpy.mockRestore();
  });
});
```

### **I18n Integration Tests**
```typescript
// src/app/api/__tests__/i18n-integration.test.ts
describe('API I18n Integration', () => {
  it('serves localized page content correctly', async () => {
    // Test English page
    const enResponse = await fetch('http://localhost:3000/en/pricing');
    const enHtml = await enResponse.text();
    expect(enHtml).toContain('Custom Pricing');
    expect(enHtml).toContain('Eternal Capsule');

    // Test Swedish page  
    const svResponse = await fetch('http://localhost:3000/sv/pricing');
    const svHtml = await svResponse.text();
    expect(svHtml).toContain('Anpassad Prissättning');
    expect(svHtml).toContain('Minnslund');
  });

  it('middleware redirects work correctly', async () => {
    const response = await fetch('http://localhost:3000/pricing', {
      redirect: 'manual'
    });
    
    expect(response.status).toBe(307); // Temporary redirect
    expect(response.headers.get('location')).toMatch(/\/(en|sv)\/pricing$/);
  });
});
```

### **Test Data Localization**
```typescript
// e2e/fixtures/i18n-data.ts
export const testTranslations = {
  en: {
    pricing: {
      title: 'Memorial Preservation Plans',
      custom: { name: 'Custom Pricing' }
    }
  },
  sv: {
    pricing: {
      title: 'Minneslundsbevarandeplaner', 
      custom: { name: 'Anpassad Prissättning' }
    }
  }
};

export const mockMemorialData = {
  en: {
    name: 'John Doe',
    description: 'A loving father and husband'
  },
  sv: {
    name: 'John Doe', 
    description: 'En kärleksfull far och make'
  }
};
```

### **Performance Testing for I18n**
```typescript
// e2e/tests/i18n-performance.spec.ts
test('locale switching performance', async ({ page }) => {
  await page.goto('/en');
  
  // Measure time to switch languages
  const startTime = Date.now();
  
  await page.click('text=🇺🇸 English');
  await page.click('text=🇸🇪 Svenska');
  
  await expect(page.locator('text=Minnslund')).toBeVisible();
  
  const switchTime = Date.now() - startTime;
  expect(switchTime).toBeLessThan(2000); // Should switch within 2 seconds
});
```

### **Testing Requirements for I18n**

**Coverage Goals:**
- **Locale routing**: 100% coverage (all routes tested in both languages)
- **Translation loading**: 95% coverage (key translations verified)
- **Language switching**: 100% coverage (all switcher scenarios)
- **Fallback handling**: 90% coverage (missing translation scenarios)

**Test Scenarios:**
- [ ] Root URL redirects to detected locale
- [ ] Legacy URLs redirect to localized versions  
- [ ] Language switcher updates URL and content
- [ ] Page content renders in correct language
- [ ] Missing translations fall back gracefully
- [ ] Locale preference persists across sessions
- [ ] Authentication flows work in both languages
- [ ] Memorial creation/viewing works in both languages

---

## �� Testing Overview 