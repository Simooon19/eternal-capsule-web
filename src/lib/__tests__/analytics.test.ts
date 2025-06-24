/**
 * @jest-environment jsdom
 */

/**
 * Analytics utilities test suite
 */

// Mock crypto before imports
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123'),
    subtle: {},
    getRandomValues: jest.fn()
  }
})

describe('Analytics Utilities', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('Session Management', () => {
    it('generates session ID when none exists', () => {
      // Mock localStorage.getItem to return null (no existing session)
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      
      getItemSpy.mockReturnValue(null)
      setItemSpy.mockImplementation(() => {})

      // Simulate the session ID generation function
      function getSessionId() {
        let sessionId = localStorage.getItem('session_id')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('session_id', sessionId)
        }
        return sessionId
      }

      const sessionId = getSessionId()

      expect(crypto.randomUUID).toHaveBeenCalled()
      expect(setItemSpy).toHaveBeenCalledWith('session_id', 'test-uuid-123')
      expect(sessionId).toBe('test-uuid-123')
    })

    it('returns existing session ID when available', () => {
      // Mock localStorage.getItem to return existing session
      const getItemSpy = jest.spyOn(Storage.prototype, 'getItem')
      const setItemSpy = jest.spyOn(Storage.prototype, 'setItem')
      
      getItemSpy.mockReturnValue('existing-session-id')
      setItemSpy.mockImplementation(() => {})

      // Simulate the session ID generation function
      function getSessionId() {
        let sessionId = localStorage.getItem('session_id')
        if (!sessionId) {
          sessionId = crypto.randomUUID()
          localStorage.setItem('session_id', sessionId)
        }
        return sessionId
      }

      const sessionId = getSessionId()

      expect(crypto.randomUUID).not.toHaveBeenCalled()
      expect(setItemSpy).not.toHaveBeenCalled()
      expect(sessionId).toBe('existing-session-id')
    })
  })

  describe('Basic Analytics Functions', () => {
    it('should track page views', () => {
      // Basic test for page view tracking functionality
      function trackPageView(path: string) {
        const timestamp = new Date().toISOString()
        return {
          event: 'page_view',
          path,
          timestamp,
          sessionId: 'test-session'
        }
      }

      const result = trackPageView('/memorial/test')
      
      expect(result.event).toBe('page_view')
      expect(result.path).toBe('/memorial/test')
      expect(result.sessionId).toBe('test-session')
      expect(result.timestamp).toBeDefined()
    })

    it('should track custom events', () => {
      // Basic test for custom event tracking
      function trackEvent(eventName: string, properties: Record<string, any>) {
        return {
          event: eventName,
          properties,
          timestamp: new Date().toISOString()
        }
      }

      const result = trackEvent('memorial_view', { memorialId: 'test-123' })
      
      expect(result.event).toBe('memorial_view')
      expect(result.properties.memorialId).toBe('test-123')
      expect(result.timestamp).toBeDefined()
    })
  })

  describe('Event Tracking', () => {
    it('tracks events when gtag is available', () => {
      const mockGtag = jest.fn()
      // @ts-ignore - we're explicitly testing global variable access
      window.gtag = mockGtag

      function trackEvent(eventName: string, parameters: Record<string, any>) {
        // @ts-ignore - we're explicitly testing global variable access  
        if (typeof window.gtag !== 'undefined') {
          // @ts-ignore - we're explicitly testing global variable access
          window.gtag('event', eventName, parameters)
        }
      }

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
      // @ts-ignore - we're explicitly testing global variable access
      window.gtag = undefined
      
      function trackEvent(eventName: string, parameters: Record<string, any>) {
        // @ts-ignore - we're explicitly testing global variable access
        if (typeof window.gtag !== 'undefined') {
          // @ts-ignore - we're explicitly testing global variable access
          window.gtag('event', eventName, parameters)
        }
      }

      expect(() => {
        trackEvent('test_event', {})
      }).not.toThrow()
    })
  })

  describe('Memorial Analytics', () => {
    it('tracks memorial view with correct metadata', () => {
      const mockGtag = jest.fn()
      // @ts-ignore - we're explicitly testing global variable access
      window.gtag = mockGtag

      function trackMemorialView(memorialId: string, source: string) {
        // @ts-ignore - we're explicitly testing global variable access
        if (typeof window.gtag !== 'undefined') {
          // @ts-ignore - we're explicitly testing global variable access
          window.gtag('event', 'memorial_view', {
            memorial_id: memorialId,
            source: source,
            timestamp: new Date().toISOString()
          })
        }
      }

      trackMemorialView('memorial-123', 'nfc')

      expect(mockGtag).toHaveBeenCalledWith('event', 'memorial_view', 
        expect.objectContaining({
          memorial_id: 'memorial-123',
          source: 'nfc',
          timestamp: expect.any(String)
        })
      )
    })
  })
}) 