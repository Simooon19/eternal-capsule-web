# 📚 Eternal Capsule API Documentation

## Overview

The Eternal Capsule API provides a comprehensive set of endpoints for managing digital memorials, user authentication, payments, and analytics. All endpoints follow REST conventions and return JSON responses.

**Base URL**: `https://eternalcapsule.com/api`  
**Authentication**: NextAuth.js sessions, API keys for external integrations  
**Rate Limiting**: 60 requests/minute for API endpoints, 200 requests/minute for pages

---

## 🔐 Authentication

### Session Management

All authenticated endpoints require a valid NextAuth.js session or API key.

**Headers:**
```http
Authorization: Bearer <session-token>
Content-Type: application/json
```

**Rate Limits:**
- General API: 100 requests/minute
- Guestbook: 5 submissions per 15 minutes
- Bulk operations: 100 requests/hour (funeral homes only)

---

## 📊 System Endpoints

### Health Check

Check the application's health status and service availability.

```http
GET /api/health
```

**Response:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "0.1.0",
  "services": {
    "database": { "status": "up", "responseTime": 50 },
    "sanity": { "status": "up", "responseTime": 120 },
    "environment": { "status": "configured" }
  },
  "uptime": 3600000
}
```

**Status Codes:**
- `200` - Healthy or degraded
- `503` - Unhealthy

### Performance Metrics

Get system performance and business metrics.

```http
GET /api/metrics
```

**Response:**
```json
{
  "timestamp": "2024-01-01T00:00:00.000Z",
  "performance": {
    "uptime": 3600000,
    "memoryUsage": {
      "rss": 25165824,
      "heapTotal": 18874368,
      "heapUsed": 16785000,
      "external": 1089
    },
    "responseTime": 125
  },
  "business": {
    "totalUsers": 340,
    "totalMemorials": 1250,
    "totalContactSubmissions": 45,
    "activeTrials": 23,
    "subscriptionBreakdown": {
      "free": 800,
      "family": 200,
      "funeral": 45,
      "enterprise": 5
    }
  },
  "sanity": {
    "connectionStatus": "connected",
    "projectInfo": {
      "projectId": "your-project-id",
      "dataset": "production"
    }
  }
}
```

**Headers:**
- `Accept: application/json` - JSON format
- `Accept: text/plain` - Prometheus format

### Test Endpoint

Simple endpoint for deployment verification.

```http
GET /api/test
```

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "environment": "production",
  "version": "1.0.0"
}
```

---

## 🏠 Memorial Management

### List Memorials

Retrieve a paginated list of memorials with optional filtering.

```http
GET /api/memorials?page=1&limit=10&search=john&tags=father,husband
```

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 50) - Items per page
- `search` (string) - Search term for names and descriptions
- `tags` (string) - Comma-separated tags filter
- `location` (string) - Location filter
- `sort` (string) - Sort order: `created|updated|name|date`

**Response:**
```json
{
  "memorials": [
    {
      "id": "memorial-123",
      "slug": "john-doe-memorial",
      "name": "John Doe",
      "birthDate": "1950-05-15",
      "deathDate": "2023-12-01",
      "description": "A loving father...",
      "photos": [
        {
          "_key": "photo1",
          "asset": {
            "url": "https://cdn.sanity.io/images/...",
            "_ref": "image-123"
          },
          "alt": "John Doe portrait"
        }
      ],
      "location": {
        "lat": 37.7749,
        "lng": -122.4194,
        "address": "San Francisco, CA"
      },
      "tags": ["loving", "father", "husband"],
      "stats": {
        "views": 150,
        "guestbookEntries": 12,
        "lastActivity": "2023-12-15T10:30:00Z"
      },
      "createdAt": "2023-12-01T00:00:00Z",
      "updatedAt": "2023-12-15T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "pages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Get Memorial

Retrieve a specific memorial by ID.

```http
GET /api/memorials/{id}
```

**Path Parameters:**
- `id` (string) - Memorial ID or slug

**Response:**
```json
{
  "memorial": {
    "id": "memorial-123",
    "slug": "john-doe-memorial",
    "name": "John Doe",
    "birthDate": "1950-05-15",
    "deathDate": "2023-12-01",
    "description": "A loving father and devoted husband...",
    "story": "John was born in...",
    "photos": [...],
    "videos": [...],
    "location": {...},
    "tags": [...],
    "guestbookEntries": [...],
    "timeline": [...],
    "stats": {...},
    "createdAt": "2023-12-01T00:00:00Z",
    "updatedAt": "2023-12-15T10:30:00Z"
  }
}
```

**Status Codes:**
- `200` - Success
- `404` - Memorial not found
- `429` - Rate limit exceeded

### Create Memorial

Create a new memorial (requires authentication).

```http
POST /api/memorials
```

**Request Body:**
```json
{
  "name": "John Doe",
  "birthDate": "1950-05-15",
  "deathDate": "2023-12-01",
  "description": "A loving father and devoted husband...",
  "photos": [
    {
      "asset": { "_ref": "image-123" },
      "alt": "John Doe portrait"
    }
  ],
  "location": {
    "lat": 37.7749,
    "lng": -122.4194,
    "address": "San Francisco, CA"
  },
  "tags": ["loving", "father", "husband"],
  "story": "John was born in..."
}
```

**Response:**
```json
{
  "memorial": {
    "id": "memorial-456",
    "slug": "john-doe-memorial-456",
    "name": "John Doe",
    ...
  },
  "message": "Memorial created successfully"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request data
- `401` - Not authenticated
- `403` - Not authorized (subscription limits)
- `429` - Rate limit exceeded

### Update Memorial

Update an existing memorial (requires ownership or admin).

```http
PUT /api/memorials/{id}
```

**Request Body:** Same as create memorial

**Response:**
```json
{
  "memorial": {...},
  "message": "Memorial updated successfully"
}
```

### Delete Memorial

Delete a memorial (requires ownership or admin).

```http
DELETE /api/memorials/{id}
```

**Response:**
```json
{
  "message": "Memorial deleted successfully"
}
```

### Bulk Create Memorials

Create multiple memorials at once (funeral home and enterprise plans only).

```http
POST /api/memorials/bulk
```

**Request Body:**
```json
{
  "memorials": [
    {
      "name": "John Doe",
      "born": "1950-05-15",
      "died": "2023-12-01",
      "birthLocation": "New York, NY",
      "deathLocation": "San Francisco, CA",
      "description": "A loving father and devoted husband",
      "familyEmail": "family@example.com",
      "tags": ["father", "husband", "veteran"]
    },
    {
      "name": "Jane Smith",
      "born": "1955-08-20",
      "died": "2023-11-15",
      "birthLocation": "Chicago, IL",
      "deathLocation": "Chicago, IL",
      "description": "A beloved teacher and community leader",
      "familyEmail": "smith.family@example.com",
      "tags": ["teacher", "community-leader"]
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [
    {
      "index": 0,
      "success": true,
      "memorial": {
        "id": "memorial-456",
        "slug": "john-doe-memorial-456",
        "url": "https://eternalcapsule.com/memorial/john-doe-memorial-456",
        "nfcTagUid": "nfc_1234567890_abc123"
      }
    },
    {
      "index": 1,
      "success": true,
      "memorial": {
        "id": "memorial-457",
        "slug": "jane-smith-memorial-457",
        "url": "https://eternalcapsule.com/memorial/jane-smith-memorial-457",
        "nfcTagUid": "nfc_1234567891_def456"
      }
    }
  ]
}
```

**Features:**
- Automatically generates NFC tag UIDs for each memorial
- Sends email notifications to families if email provided
- Creates memorials in "pending" status for admin approval
- Supports up to 50 memorials per request
- Returns detailed success/error information for each memorial

**Status Codes:**
- `200` - Batch processed (check individual results)
- `400` - Invalid request data
- `403` - Not authorized (requires funeral/enterprise plan)
- `429` - Rate limit exceeded

### Export Memorial

Export memorial data and media as a ZIP file.

```http
GET /api/memorials/{id}/export
```

**Response:** ZIP file download containing:
- `memorial.json` - Memorial data
- `photos/` - All photos
- `videos/` - All videos
- `guestbook.json` - Guestbook entries

---

## 📝 Guestbook Management

### Get Guestbook Entries

Retrieve guestbook entries for a memorial.

```http
GET /api/guestbook?memorial={id}&page=1&limit=10
```

**Query Parameters:**
- `memorial` (string, required) - Memorial ID
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 50) - Items per page

**Response:**
```json
{
  "entries": [
    {
      "id": "entry-123",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "message": "John was such a wonderful person...",
      "isAnonymous": false,
      "reactions": {
        "heart": 5,
        "pray": 3,
        "memory": 2
      },
      "createdAt": "2023-12-15T10:30:00Z"
    }
  ],
  "pagination": {...}
}
```

### Add Guestbook Entry

Add a new guestbook entry (rate limited).

```http
POST /api/guestbook
```

**Request Body:**
```json
{
  "memorialId": "memorial-123",
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "John was such a wonderful person...",
  "isAnonymous": false
}
```

**Response:**
```json
{
  "entry": {
    "id": "entry-456",
    "name": "Jane Smith",
    "message": "John was such a wonderful person...",
    "createdAt": "2023-12-15T10:30:00Z"
  },
  "message": "Guestbook entry added successfully"
}
```

**Status Codes:**
- `201` - Created successfully
- `400` - Invalid request data
- `429` - Rate limit exceeded (1 entry per IP per memorial per hour)

---

## 🔍 Search & Discovery

### Search Memorials

Perform full-text search across all memorials.

```http
GET /api/search?q=john&filters=location:san-francisco&page=1&limit=10
```

**Query Parameters:**
- `q` (string, required) - Search query
- `filters` (string) - Filters in format `field:value,field2:value2`
- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 50) - Items per page

**Response:**
```json
{
  "results": [
    {
      "memorial": {...},
      "score": 0.95,
      "highlights": {
        "name": ["<mark>John</mark> Doe"],
        "description": ["A loving father named <mark>John</mark>..."]
      }
    }
  ],
  "facets": {
    "tags": [
      { "tag": "father", "count": 25 },
      { "tag": "husband", "count": 18 }
    ],
    "locations": [
      { "location": "San Francisco, CA", "count": 12 }
    ]
  },
  "pagination": {...},
  "totalResults": 245,
  "queryTime": 45
}
```

### Search Suggestions

Get search suggestions and autocomplete.

```http
GET /api/search/suggestions?q=joh&limit=5
```

**Response:**
```json
{
  "suggestions": [
    {
      "text": "John Doe",
      "type": "name",
      "count": 3
    },
    {
      "text": "John Smith",
      "type": "name",
      "count": 1
    },
    {
      "text": "Johnson Family",
      "type": "name",
      "count": 2
    }
  ]
}
```

---

## 💳 Payment & Subscription Management

### Create Checkout Session

Create a Stripe checkout session for subscription.

```http
POST /api/checkout/create
```

**Request Body:**
```json
{
  "priceId": "price_family_monthly",
  "mode": "subscription",
  "successUrl": "https://eternalcapsule.com/dashboard?success=true",
  "cancelUrl": "https://eternalcapsule.com/pricing"
}
```

**Response:**
```json
{
  "sessionId": "cs_test_123...",
  "url": "https://checkout.stripe.com/pay/cs_test_123..."
}
```

### Webhook Handler

Handle Stripe webhooks for payment events.

```http
POST /api/stripe/webhooks
```

**Headers:**
- `stripe-signature` (required) - Stripe webhook signature

**Events Handled:**
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

### Get User Subscription

Get current user's subscription status.

```http
GET /api/user/subscription
```

**Response:**
```json
{
  "subscription": {
    "id": "sub_123",
    "status": "active",
    "plan": "family",
    "currentPeriodEnd": "2024-02-01T00:00:00Z",
    "cancelAtPeriodEnd": false,
    "limits": {
      "memorials": 15,
      "storage": "unlimited",
      "features": ["nfc", "analytics"]
    },
    "usage": {
      "memorials": 3,
      "storage": "2.5GB"
    }
  }
}
```

---

## 📊 Analytics & Tracking

### Track Interaction

Track user interactions for analytics.

```http
POST /api/analytics/interaction
```

**Request Body:**
```json
{
  "event": "memorial_view",
  "memorialId": "memorial-123",
  "properties": {
    "source": "qr_code",
    "device": "mobile",
    "location": "graveside"
  }
}
```

**Response:**
```json
{
  "tracked": true,
  "eventId": "event-456"
}
```

### Track NFC/QR Scan

Track NFC tag or QR code scans.

```http
POST /api/analytics/scan
```

**Request Body:**
```json
{
  "type": "nfc|qr",
  "memorialId": "memorial-123",
  "location": {
    "lat": 37.7749,
    "lng": -122.4194
  },
  "deviceInfo": {
    "userAgent": "Mozilla/5.0...",
    "platform": "iOS"
  }
}
```

### Search Analytics

Track search queries for analytics.

```http
POST /api/analytics/search
```

**Request Body:**
```json
{
  "query": "john doe",
  "filters": ["location:san-francisco"],
  "resultsCount": 12,
  "clickedResult": "memorial-123"
}
```

### Performance Metrics

Track Core Web Vitals and performance metrics.

```http
POST /api/analytics/performance
```

**Request Body:**
```json
{
  "url": "/memorial/john-doe",
  "metrics": {
    "fcp": 1200,
    "lcp": 2100,
    "cls": 0.05,
    "fid": 85,
    "ttfb": 250
  },
  "deviceInfo": {
    "connection": "4g",
    "deviceMemory": 8
  }
}
```

---

## 🏢 Admin Endpoints

### Business Metrics

Get comprehensive business analytics (admin only).

```http
GET /api/admin/business-metrics
```

**Query Parameters:**
- `period` (string) - Time period: `7d|30d|90d|1y`
- `timezone` (string) - Timezone for date calculations

**Response:**
```json
{
  "overview": {
    "totalMemorials": 1250,
    "activeUsers": 340,
    "revenue": {
      "monthly": 12450,
      "growth": 15.2
    },
    "subscriptions": {
      "total": 250,
      "churn": 2.1
    }
  },
  "charts": {
    "memorialCreation": [...],
    "userSignups": [...],
    "revenue": [...],
    "engagement": [...]
  },
  "topMemorials": [...],
  "recentActivity": [...]
}
```

---

## 📧 Communication

### Contact Form

Submit contact form messages.

```http
POST /api/contact
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "subject": "Question about pricing",
  "message": "I would like to know more about...",
  "type": "general|support|sales|partnership"
}
```

**Response:**
```json
{
  "message": "Message sent successfully",
  "ticketId": "ticket-123"
}
```

---

## 🔍 Obituaries Integration

### Get Obituaries

Retrieve obituaries from integrated sources.

```http
GET /api/obituaries?location=san-francisco&date=2023-12-01&limit=10
```

**Response:**
```json
{
  "obituaries": [
    {
      "id": "obit-123",
      "name": "John Doe",
      "deathDate": "2023-12-01",
      "funeralHome": "Smith Funeral Home",
      "location": "San Francisco, CA",
      "hasMemorial": false,
      "source": "legacy.com"
    }
  ],
  "pagination": {...}
}
```

---

## 🚨 Error Handling

All endpoints follow consistent error response format:

```json
{
  "error": {
    "code": "INVALID_REQUEST",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "requestId": "req-123",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

**Common Error Codes:**
- `INVALID_REQUEST` (400) - Bad request
- `UNAUTHORIZED` (401) - Authentication required
- `FORBIDDEN` (403) - Access denied
- `NOT_FOUND` (404) - Resource not found
- `RATE_LIMITED` (429) - Too many requests
- `INTERNAL_ERROR` (500) - Server error
- `SERVICE_UNAVAILABLE` (503) - Service temporarily unavailable

---

## 📝 Rate Limiting

Rate limits are applied per IP address and user:

| Endpoint Type | Anonymous | Authenticated | Admin |
|---------------|-----------|---------------|--------|
| API Endpoints | 60/min | 120/min | 300/min |
| Page Requests | 200/min | 400/min | 600/min |
| Guestbook | 1/hour/memorial | 5/hour/memorial | Unlimited |
| Search | 20/min | 60/min | 120/min |

**Rate Limit Headers:**
- `X-RateLimit-Limit` - Request limit
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp

---

## 🔐 Security

### API Keys

For external integrations, use API keys in the Authorization header:

```http
Authorization: Bearer sk_live_your_api_key_here
```

### CORS

CORS is configured for these origins:
- `https://eternalcapsule.com`
- `https://*.eternalcapsule.com`
- `http://localhost:3000` (development)

### Content Security Policy

Strict CSP headers are applied to prevent XSS attacks.

### Request Validation

All requests are validated for:
- SQL injection attempts
- XSS payloads
- Suspicious file paths
- Malformed JSON
- Invalid content types

---

## 📚 SDK & Integration

### JavaScript SDK

```javascript
import { EternalCapsuleAPI } from '@eternal-capsule/sdk'

const api = new EternalCapsuleAPI({
  apiKey: 'your-api-key',
  baseURL: 'https://eternalcapsule.com/api'
})

// Get memorial
const memorial = await api.memorials.get('memorial-123')

// Create guestbook entry
await api.guestbook.create({
  memorialId: 'memorial-123',
  name: 'Jane Smith',
  message: 'Beautiful memorial...'
})
```

### Webhook Integration

Subscribe to events using webhooks:

```json
{
  "url": "https://your-site.com/webhooks/eternal-capsule",
  "events": ["memorial.created", "guestbook.entry_added"],
  "secret": "your-webhook-secret"
}
```

---

## 🚨 Troubleshooting

### Bulk Memorial Creation Issues

#### "Not authorized for bulk creation"
**Status:** `403 Forbidden`  
**Cause:** Account doesn't have funeral home or enterprise plan  
**Solution:** 
- Upgrade to Funeral Home plan ($99/month) or Enterprise plan ($249/month)
- Verify account plan with `GET /api/user/subscription`

#### "Rate limit exceeded"
**Status:** `429 Too Many Requests`  
**Cause:** Exceeded 100 requests/hour limit for funeral homes  
**Solution:**
- Wait one hour before next request
- Contact support for higher limits (enterprise plans)
- Implement exponential backoff in your integration

#### "CSV contains more than 50 memorials"
**Status:** `400 Bad Request`  
**Cause:** Bulk request exceeds 50 memorial limit  
**Solution:**
- Split large files into batches of 50 or fewer
- Process multiple smaller requests
- Consider using the API directly for larger volumes

#### "Missing required fields: name, born, died"
**Status:** `400 Bad Request`  
**Cause:** Required memorial data is missing  
**Solution:**
- Ensure all memorials have name, born, and died fields
- Validate data before sending request
- Check for empty strings or null values

#### "Invalid date format"
**Status:** `400 Bad Request`  
**Cause:** Birth/death dates not in YYYY-MM-DD format  
**Solution:**
- Convert dates to ISO 8601 format (1950-05-15)
- Avoid MM/DD/YYYY or DD-MM-YYYY formats
- Use JavaScript's `toISOString().split('T')[0]` for conversion

### CSV Import Component Issues

#### File upload not working
**Cause:** Browser compatibility or file format issues  
**Solution:**
- Use modern browsers (Chrome 80+, Firefox 75+, Safari 13+)
- Save files in proper CSV format (not Excel .xlsx)
- Check file size limits (< 5MB recommended)

#### Preview showing incorrect data
**Cause:** CSV parsing errors or encoding issues  
**Solution:**
- Save CSV with UTF-8 encoding
- Avoid special characters in file names
- Remove empty rows and columns
- Use proper column headers exactly as specified

### Common Integration Patterns

#### Exponential Backoff for Rate Limits
```javascript
async function createMemorialsWithRetry(memorials, maxRetries = 3) {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch('/api/memorials/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memorials })
      })
      
      if (response.status === 429) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
        await new Promise(resolve => setTimeout(resolve, delay))
        continue
      }
      
      return await response.json()
    } catch (error) {
      if (attempt === maxRetries - 1) throw error
    }
  }
}
```

#### Batch Processing Large Datasets
```javascript
async function processMassiveDataset(allMemorials) {
  const batchSize = 50
  const results = []
  
  for (let i = 0; i < allMemorials.length; i += batchSize) {
    const batch = allMemorials.slice(i, i + batchSize)
    
    try {
      const result = await createMemorialsWithRetry(batch)
      results.push(result)
      
      // Respect rate limits
      if (i + batchSize < allMemorials.length) {
        await new Promise(resolve => setTimeout(resolve, 37000)) // ~100/hour
      }
    } catch (error) {
      console.error(`Batch ${i/batchSize + 1} failed:`, error)
      results.push({ error: error.message, batch: i/batchSize + 1 })
    }
  }
  
  return results
}
```

---

## 📞 Support

- **API Status**: [status.eternalcapsule.com](https://status.eternalcapsule.com)
- **Documentation**: [docs.eternalcapsule.com](https://docs.eternalcapsule.com)
- **Support Email**: [api@eternalcapsule.com](mailto:api@eternalcapsule.com)
- **Community**: [community.eternalcapsule.com](https://community.eternalcapsule.com)

### Specialized Support
- **Technical Support**: api-support@eternalcapsule.com  
- **Funeral Home Support**: funeral-support@eternalcapsule.com
- **Enterprise Support**: enterprise@eternalcapsule.com
- **Emergency Support**: Available 24/7 for Enterprise customers 

## 🌍 Internationalization & Locale Routing

### Supported Locales
- **English (`en`)** - Default locale
- **Swedish (`sv`)** - Regional localization with "Minnslund" branding

### Locale Detection
The application automatically detects the appropriate locale using:
1. **URL path prefix** (`/en/`, `/sv/`)
2. **User's geographic location** (IP-based)
3. **Browser Accept-Language header**
4. **Saved user preference** (cookie)

### URL Structure
All user-facing pages follow the localized URL pattern:

```
https://eternalcapsule.com/en/page    # English
https://eternalcapsule.com/sv/page    # Swedish (Minnslund)
```

**Localized Page Examples:**
```
/en/pricing          → English pricing page
/sv/pricing          → Swedish pricing (Minneslundsbevarandeplaner)
/en/contact          → English contact page  
/sv/contact          → Swedish contact (Minnslund branding)
/en/memorial/explore → English memorial gallery
/sv/memorial/explore → Swedish memorial gallery (Utforska Minneslundar)
/en/auth/signin      → English sign-in page
/sv/auth/signin      → Swedish sign-in page
```

### Automatic Redirects
**Non-localized URLs automatically redirect:**
```
/pricing     → /en/pricing (or /sv/pricing based on detection)
/contact     → /en/contact (or /sv/contact based on detection)  
/            → /en/        (or /sv/ based on detection)
```

**Legacy URL Support:**
All old URLs are automatically redirected to the appropriate localized version based on the user's detected locale. 