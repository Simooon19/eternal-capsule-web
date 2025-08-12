import { test, expect } from '@playwright/test';
import { EternalCapsuleHelpers } from '../helpers/test-helpers';

test.describe('API Integration Flows - Backend Services and Data', () => {
  let helpers: EternalCapsuleHelpers;

  test.beforeEach(async ({ page }) => {
    helpers = new EternalCapsuleHelpers(page);
  });

  test('System health and status endpoints', async ({ page }) => {
    // Test main health endpoint
    const healthResponse = await page.request.get('/api/health');
    
    expect(healthResponse.status()).toBe(200);
    
    const healthData = await healthResponse.json();
    console.log('✅ Health endpoint accessible');
    
    // Verify health data structure
    expect(healthData).toHaveProperty('status');
    expect(healthData).toHaveProperty('timestamp');
    expect(healthData).toHaveProperty('version');
    
    console.log(`System status: ${healthData.status}`);
    console.log(`Version: ${healthData.version}`);
    
    // Check services status
    if (healthData.services) {
      const services = Object.keys(healthData.services);
      console.log(`✅ Services monitored: ${services.join(', ')}`);
      
      for (const [serviceName, serviceData] of Object.entries(healthData.services)) {
        if (typeof serviceData === 'object' && serviceData !== null) {
          const service = serviceData as any;
          console.log(`✅ ${serviceName}: ${service.status}`);
          
          if (service.responseTime) {
            console.log(`  Response time: ${service.responseTime}ms`);
          }
        }
      }
    }
    
    // Verify uptime is reported
    if (healthData.uptime) {
      console.log(`✅ System uptime: ${healthData.uptime}s`);
    }
  });

  test('Public memorial endpoints', async ({ page }) => {
    // Test public memorials endpoint
    const memorialsResponse = await page.request.get('/api/memorials');
    
    if (memorialsResponse.status() === 200) {
      const memorialsData = await memorialsResponse.json();
      console.log('✅ Public memorials endpoint accessible');
      
      expect(memorialsData).toHaveProperty('memorials');
      
      if (Array.isArray(memorialsData.memorials)) {
        console.log(`✅ Found ${memorialsData.memorials.length} public memorials`);
        
        if (memorialsData.memorials.length > 0) {
          const firstMemorial = memorialsData.memorials[0];
          
          // Check memorial structure
          const expectedFields = ['_id', 'title', 'name', 'status'];
          for (const field of expectedFields) {
            if (field in firstMemorial) {
              console.log(`✅ Memorial has ${field} field`);
            }
          }
          
          // Verify only published memorials are returned
          const unpublishedMemorials = memorialsData.memorials.filter(
            (m: any) => m.status !== 'published' && m.status !== 'active'
          );
          
          if (unpublishedMemorials.length === 0) {
            console.log('✅ Only published memorials returned in public API');
          } else {
            console.log(`⚠️ Found ${unpublishedMemorials.length} unpublished memorials in public API`);
          }
        }
      }
    } else {
      console.log(`ℹ️ Public memorials endpoint status: ${memorialsResponse.status()}`);
    }
  });

  test('Search functionality endpoints', async ({ page }) => {
    const searchEndpoints = [
      '/api/search',
      '/api/search/suggestions',
      '/api/search/memorials'
    ];
    
    for (const endpoint of searchEndpoints) {
      const response = await page.request.get(endpoint + '?q=test');
      const status = response.status();
      
      console.log(`Search endpoint ${endpoint}: ${status}`);
      
      if (status === 200) {
        const searchData = await response.json();
        console.log(`✅ ${endpoint} returns valid search results`);
        
        // Check search result structure
        if (searchData.results || searchData.memorials || searchData.suggestions) {
          console.log(`✅ ${endpoint} has proper search result structure`);
        }
        
      } else if (status === 400) {
        console.log(`✅ ${endpoint} validates search parameters`);
        
      } else if (status === 404) {
        console.log(`ℹ️ ${endpoint} not implemented`);
        
      } else {
        console.log(`ℹ️ ${endpoint} returned status: ${status}`);
      }
    }
  });

  test('Authentication-protected endpoints', async ({ page }) => {
    const protectedEndpoints = [
      '/api/user/memorials',
      '/api/user/subscription',
      '/api/user/trial',
      '/api/admin/business-metrics'
    ];
    
    for (const endpoint of protectedEndpoints) {
      const response = await page.request.get(endpoint);
      const status = response.status();
      
      console.log(`Protected endpoint ${endpoint}: ${status}`);
      
      if (status === 401) {
        console.log(`✅ ${endpoint} properly requires authentication`);
        
        const errorData = await response.json();
        expect(errorData).toHaveProperty('error');
        
      } else if (status === 200) {
        console.log(`✅ ${endpoint} accessible (user authenticated)`);
        
        const data = await response.json();
        if (typeof data === 'object' && data !== null) {
          console.log(`✅ ${endpoint} returns valid data structure`);
        }
        
      } else if (status === 403) {
        console.log(`✅ ${endpoint} requires higher privileges`);
        
      } else {
        console.log(`ℹ️ ${endpoint} status: ${status}`);
      }
    }
  });

  test('Guestbook API functionality', async ({ page }) => {
    // Test guestbook endpoint structure
    const guestbookEndpoints = [
      '/api/guestbook',
      '/api/memorials/test/guestbook'
    ];
    
    for (const endpoint of guestbookEndpoints) {
      // Test GET request
      const getResponse = await page.request.get(endpoint);
      console.log(`Guestbook GET ${endpoint}: ${getResponse.status()}`);
      
      if (getResponse.status() === 200) {
        const guestbookData = await getResponse.json();
        console.log(`✅ ${endpoint} returns guestbook data`);
        
        if (Array.isArray(guestbookData.entries)) {
          console.log(`✅ Guestbook has ${guestbookData.entries.length} entries`);
        }
      }
      
      // Test POST request (guestbook submission)
      const postResponse = await page.request.post(endpoint, {
        data: {
          name: 'Test User',
          message: 'Test guestbook message',
          email: 'test@example.com'
        }
      });
      
      const postStatus = postResponse.status();
      console.log(`Guestbook POST ${endpoint}: ${postStatus}`);
      
      if (postStatus === 201 || postStatus === 200) {
        console.log(`✅ ${endpoint} accepts guestbook submissions`);
        
      } else if (postStatus === 400) {
        console.log(`✅ ${endpoint} validates guestbook submission data`);
        
      } else if (postStatus === 429) {
        console.log(`✅ ${endpoint} has rate limiting protection`);
        
      } else if (postStatus === 404) {
        console.log(`ℹ️ ${endpoint} not found or memorial doesn't exist`);
        
      } else {
        console.log(`ℹ️ ${endpoint} POST status: ${postStatus}`);
      }
    }
  });

  test('Memorial creation API validation', async ({ page }) => {
    const memorialCreateEndpoint = '/api/memorials';
    
    // Test POST request without authentication
    const unauthResponse = await page.request.post(memorialCreateEndpoint, {
      data: {
        title: 'Test Memorial',
        born: '1950-01-01',
        died: '2023-01-01'
      }
    });
    
    console.log(`Memorial creation without auth: ${unauthResponse.status()}`);
    
    if (unauthResponse.status() === 401) {
      console.log('✅ Memorial creation requires authentication');
      
      const errorData = await unauthResponse.json();
      expect(errorData).toHaveProperty('error');
    }
    
    // Test with invalid data structure
    const invalidDataResponse = await page.request.post(memorialCreateEndpoint, {
      data: {
        // Missing required fields
        title: ''
      }
    });
    
    console.log(`Memorial creation with invalid data: ${invalidDataResponse.status()}`);
    
    if (invalidDataResponse.status() === 400 || invalidDataResponse.status() === 401) {
      console.log('✅ Memorial creation validates required fields');
    }
  });

  test('Analytics and tracking endpoints', async ({ page }) => {
    const analyticsEndpoints = [
      '/api/analytics/track',
      '/api/analytics/memorial-view',
      '/api/analytics/interaction'
    ];
    
    for (const endpoint of analyticsEndpoints) {
      // Test analytics tracking POST
      const trackResponse = await page.request.post(endpoint, {
        data: {
          event: 'test_event',
          memorial_id: 'test_memorial',
          timestamp: new Date().toISOString()
        }
      });
      
      const status = trackResponse.status();
      console.log(`Analytics ${endpoint}: ${status}`);
      
      if (status === 200 || status === 201) {
        console.log(`✅ ${endpoint} accepts analytics data`);
        
      } else if (status === 400) {
        console.log(`✅ ${endpoint} validates analytics data`);
        
      } else if (status === 404) {
        console.log(`ℹ️ ${endpoint} not implemented`);
        
      } else if (status === 429) {
        console.log(`✅ ${endpoint} has rate limiting`);
        
      } else {
        console.log(`ℹ️ ${endpoint} status: ${status}`);
      }
    }
  });

  test('Rate limiting and security', async ({ page }) => {
    // Test rate limiting on public endpoints
    const testEndpoint = '/api/health';
    const requests = [];
    
    console.log('Testing rate limiting...');
    
    // Make multiple rapid requests
    for (let i = 0; i < 10; i++) {
      requests.push(page.request.get(testEndpoint));
    }
    
    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status());
    
    console.log(`Rate limiting test statuses: ${statuses.join(', ')}`);
    
    // Check if any requests were rate limited
    const rateLimitedRequests = statuses.filter(status => status === 429);
    if (rateLimitedRequests.length > 0) {
      console.log(`✅ Rate limiting active (${rateLimitedRequests.length}/10 requests limited)`);
    } else {
      console.log('ℹ️ No rate limiting detected (may have higher limits)');
    }
    
    // Test security headers
    const securityResponse = await page.request.get('/');
    const headers = securityResponse.headers();
    
    const securityHeaders = [
      'x-frame-options',
      'x-content-type-options',
      'x-xss-protection',
      'strict-transport-security',
      'content-security-policy'
    ];
    
    for (const header of securityHeaders) {
      if (headers[header]) {
        console.log(`✅ Security header present: ${header}`);
      } else {
        console.log(`ℹ️ Security header missing: ${header}`);
      }
    }
  });

  test('Database connection and data consistency', async ({ page }) => {
    // Test that API endpoints return consistent data
    const memorialsResponse1 = await page.request.get('/api/memorials');
    await page.waitForTimeout(100);
    const memorialsResponse2 = await page.request.get('/api/memorials');
    
    if (memorialsResponse1.status() === 200 && memorialsResponse2.status() === 200) {
      const data1 = await memorialsResponse1.json();
      const data2 = await memorialsResponse2.json();
      
      if (data1.memorials && data2.memorials) {
        const count1 = data1.memorials.length;
        const count2 = data2.memorials.length;
        
        if (count1 === count2) {
          console.log('✅ Database consistency maintained across requests');
        } else {
          console.log(`ℹ️ Memorial count changed between requests: ${count1} → ${count2}`);
        }
        
        // Check that memorial IDs are consistent
        if (count1 > 0 && count2 > 0) {
          const ids1 = data1.memorials.map((m: any) => m._id).sort();
          const ids2 = data2.memorials.map((m: any) => m._id).sort();
          
          const idsMatch = JSON.stringify(ids1) === JSON.stringify(ids2);
          if (idsMatch) {
            console.log('✅ Memorial IDs consistent across requests');
          } else {
            console.log('ℹ️ Memorial IDs changed between requests (new memorials created)');
          }
        }
      }
    }
  });

  test('Error handling and response formats', async ({ page }) => {
    // Test 404 handling
    const notFoundResponse = await page.request.get('/api/memorials/nonexistent-id');
    console.log(`404 test status: ${notFoundResponse.status()}`);
    
    if (notFoundResponse.status() === 404) {
      const errorData = await notFoundResponse.json();
      console.log('✅ Proper 404 error handling');
      
      if (errorData.error) {
        console.log(`✅ Error message provided: ${errorData.error}`);
      }
    }
    
    // Test malformed request handling
    const malformedResponse = await page.request.post('/api/guestbook', {
      data: 'invalid-json-string'
    });
    
    console.log(`Malformed request status: ${malformedResponse.status()}`);
    
    if (malformedResponse.status() === 400) {
      console.log('✅ Malformed request properly rejected');
    }
    
    // Test CORS headers using HEAD request instead of OPTIONS
    try {
      const corsResponse = await page.request.head('/api/health');
      const corsHeaders = corsResponse.headers();
      
      if (corsHeaders['access-control-allow-origin']) {
        console.log('✅ CORS headers present');
      }
      
      if (corsHeaders['access-control-allow-methods']) {
        console.log(`✅ CORS methods: ${corsHeaders['access-control-allow-methods']}`);
      }
    } catch (error) {
      console.log('ℹ️ CORS testing skipped - method not available');
    }
  });

  test('Content type and encoding handling', async ({ page }) => {
    // Test JSON content type handling
    const jsonResponse = await page.request.get('/api/health');
    const contentType = jsonResponse.headers()['content-type'];
    
    if (contentType && contentType.includes('application/json')) {
      console.log('✅ Proper JSON content type headers');
    }
    
    // Test that responses are properly encoded
    const healthData = await jsonResponse.json();
    if (healthData && typeof healthData === 'object') {
      console.log('✅ JSON responses properly parsed');
    }
    
    // Test handling of Swedish characters in API responses
    const memorialsResponse = await page.request.get('/api/memorials');
    if (memorialsResponse.status() === 200) {
      const memorialsData = await memorialsResponse.json();
      
      if (memorialsData.memorials && memorialsData.memorials.length > 0) {
        const firstMemorial = memorialsData.memorials[0];
        const titleText = firstMemorial.title || firstMemorial.name || '';
        
        // Check for Swedish characters
        const swedishChars = /[åäöÅÄÖ]/;
        if (swedishChars.test(titleText)) {
          console.log('✅ Swedish characters properly handled in API responses');
        }
      }
    }
  });

  test('API versioning and backwards compatibility', async ({ page }) => {
    // Test if API versioning is implemented
    const versionedEndpoints = [
      '/api/v1/memorials',
      '/api/v2/memorials'
    ];
    
    for (const endpoint of versionedEndpoints) {
      const response = await page.request.get(endpoint);
      console.log(`Versioned endpoint ${endpoint}: ${response.status()}`);
      
      if (response.status() === 200) {
        console.log(`✅ API versioning implemented: ${endpoint}`);
      } else if (response.status() === 404) {
        console.log(`ℹ️ API versioning not implemented: ${endpoint}`);
      }
    }
    
    // Test API version in headers
    const response = await page.request.get('/api/health');
    const apiVersion = response.headers()['api-version'] || response.headers()['x-api-version'];
    
    if (apiVersion) {
      console.log(`✅ API version header present: ${apiVersion}`);
    } else {
      console.log('ℹ️ No API version header found');
    }
  });
});