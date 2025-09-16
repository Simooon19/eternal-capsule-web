# Developer Guide

This guide summarizes the workflows, architecture, and common tasks for engineers working on the Minneslund digital memorial platform.

---

# 🤖 Minneslund Digital Memorial Platform

**Production-ready digital memorial platform connecting physical graves to digital memories through NFC technology, serving funeral homes and families in Sweden.**

**Live Production Site**: [https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)

---

## 🚀 ESSENTIAL COMMANDS

### **Development Workflow**
```bash
# Start development server
npm run dev

# Full validation (TypeScript + Linting + Tests)
npm run validate

# Comprehensive validation including E2E tests
npm run validate:full

# Check types only
npm run type-check

# Fix linting issues
npm run lint:fix
```

### **Testing Commands**
```bash
# Run all unit tests
npm test

# Run single test file
npm test -- src/components/__tests__/MemorialCard.test.tsx

# Run tests in watch mode
npm test:watch

# Generate coverage report
npm run test:coverage

# Run E2E tests
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run headed E2E tests (for debugging)
npm run test:e2e -- --headed
```

### **Database Operations**
```bash
# Generate Prisma client (REQUIRED after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio

# Seed database with test data
npm run db:seed
```

### **Build & Deployment**
```bash
# Production build
npm run build

# Start production server locally
npm run start

# Bundle analysis
npm run build:analyze

# Clean build artifacts
npm run clean

# Complete reset and setup
npm run reset
```

---

## 🏗️ CORE ARCHITECTURE

### **Stack Overview**
```typescript
Frontend:  Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
Backend:   Next.js API Routes + Serverless Functions  
Database:  Dual System - Sanity CMS (content) + PostgreSQL (metadata)
Auth:      NextAuth.js + JWT sessions + Route middleware protection
Payments:  Stripe subscriptions with webhooks
Email:     Resend with Swedish templates
Media:     Sanity CDN + Image optimization
PWA:       Service Worker + Manifest + Offline support
```

### **Dual Database Architecture**
The platform uses a sophisticated dual-database approach:

```typescript
// SANITY CMS (Primary Content Store)
- Memorial documents and content
- Photo galleries and media assets
- Public memorial data
- GROQ queries for content retrieval
- CDN-optimized media delivery

// POSTGRESQL + PRISMA (User Metadata)  
- User accounts and authentication
- Subscription and billing data
- Trial management and limits
- Session management
- Private user data
```

### **Authentication Flow Architecture**
```typescript
// Multi-layer authentication system:
1. NextAuth.js → JWT session management
2. Middleware → Route protection (/dashboard, /account, /memorial/create)
3. Prisma → User metadata and subscription limits
4. Sanity → Content permissions and memorial ownership

// Protected routes automatically redirect to /auth/signin
// Authenticated users redirected away from auth pages
```

### **User Management System**
The platform includes a complete user dashboard system:

```typescript
Routes:
/dashboard     → User memorial management, account status, welcome flow
/account       → Subscription management, trial controls, profile settings  
/memorial/create → Protected memorial creation with limit validation
/api/user/*    → User-specific API endpoints (memorials, subscription, trial)

Features:
- Welcome flow after signup/signin
- Trial management (30-day trials with upgrade prompts)
- Memorial limit enforcement per subscription tier
- Account status display and subscription management
```

---

## 🔧 CRITICAL VERSION DEPENDENCIES

### **React-Leaflet Version Lock**
```json
{
  "react-leaflet": "4.2.1"  // DO NOT UPGRADE - React 19 required for v5+
}
```

**If you encounter leaflet errors:**
1. `npm install leaflet-defaulticon-compatibility`
2. Import in components using maps
3. Ensure CSS is imported in globals.css

### **PostCSS Configuration**
```javascript
// CRITICAL: Keep CommonJS format - DO NOT convert to ESM
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### **Next.js Configuration**
```javascript
// Critical webpack configuration:
experimental: {
  esmExternals: false,  // Fixes module factory issues with react-leaflet
},
```

---

## 💼 BUSINESS LOGIC & SUBSCRIPTION SYSTEM

### **Subscription Tiers**
```typescript
const subscriptionPlans = {
  personal: { 
    price: 0, 
    memorials: 3, 
    features: ["basic", "guestbook"] 
  },
  nfc: { 
    price: 2900,  // SEK (29 kr/month) [Minnesbricka]
    memorials: 10, 
    features: ["nfc", "unlimited_photos", "priority_support"] 
  },
  custom: { 
    price: null, 
    memorials: -1, 
    features: ["api", "branding", "white_label"] 
  }
}
```

### **Trial System**
```typescript
// 30-day trials with automatic setup
- Auto-created for OAuth signups
- Manual trial cancellation available  
- Graceful downgrade to personal plan
- Email notifications for trial expiration
- Trial status enforcement at API level
```

### **Memorial Creation Workflow**
```typescript
1. Authentication check → Redirect to /auth/signin if needed
2. Subscription validation → Check memorial limits via /api/user/subscription
3. CreateMemorialWizard → Multi-step form with validation
4. Sanity document creation → Memorial stored with user association
5. NFC tag generation → Unique UID for physical tag linking
6. Email notification → Family notification (if provided)
7. Redirect to dashboard → Success message and memorial management
```

---

## 🛡️ SECURITY & MIDDLEWARE

### **Route Protection System**
```typescript
// middleware.ts implements comprehensive protection:
PROTECTED_ROUTES = ['/dashboard', '/account', '/memorial/create', '/api/user/*']
AUTH_ROUTES = ['/auth/signin', '/auth/signup']

// Automatic redirects:
- Unauthenticated → /auth/signin?callbackUrl={originalPath}
- Authenticated on auth pages → /dashboard
```

### **Security Headers**
```typescript
// Comprehensive security configuration:
- Content Security Policy with Sanity/Stripe allowlists
- Rate limiting (100 req/min API, 200 req/min pages)
- XSS protection and CSRF prevention
- CORS configuration for production domains
- Webhook signature verification
```

---

## 🎨 DEVELOPMENT PATTERNS

### **File Organization**
```typescript
// Consistent naming conventions:
page.tsx          // Next.js 14 App Router pages
route.ts          // API endpoints
components.tsx    // React components  
types.ts          // TypeScript definitions
utils.ts          // Utility functions

// API route patterns:
GET    /api/memorials     // List resources
POST   /api/memorials     // Create resource  
GET    /api/memorials/[id] // Single resource
PUT    /api/memorials/[id] // Update resource
```

### **Error Handling**
```typescript
// Consistent API error responses:
{
  error: string,
  message: string, 
  statusCode: number,
  details?: object
}

// Component error boundaries with fallbacks
// Loading states and skeleton components
// Toast notifications for user feedback
```

### **Data Fetching Patterns**
```typescript
// Server-side data fetching in pages:
async function getData() {
  const res = await fetch('/api/endpoint')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}

// Client-side with proper error handling:
const [data, setData] = useState(null)
const [loading, setLoading] = useState(true)
const [error, setError] = useState(null)
```

---

## 🐛 COMMON TROUBLESHOOTING

### **Build Failures**
```bash
# Debug build issues in order:
1. npm run type-check    # TypeScript errors
2. npm run lint         # ESLint errors
3. npx prisma generate  # Regenerate Prisma client
4. rm -rf .next && npm run build  # Clear cache
```

### **Hydration Issues**
```typescript
// Prevent SSR hydration mismatches:
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null

// Use dynamic imports for client-only components:
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})
```

### **Authentication Issues**
```bash
# Check environment variables:
NEXTAUTH_SECRET=your_secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database connectivity:
npx prisma migrate reset
npx prisma generate
npm run dev
```

---

## 📊 KEY INTEGRATIONS

### **Sanity CMS Setup**
```typescript
// Required environment variables:
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
SANITY_API_TOKEN=your_api_token  // Required for write operations

// Mock client for development:
- Falls back to sample data without token
- Perfect for development and testing
- Production requires valid token for write operations
```

### **Stripe Integration**
```typescript
// Webhook handling for subscription events:
- customer.subscription.created
- customer.subscription.updated  
- customer.subscription.deleted
- invoice.payment_failed

// Plan validation and limit enforcement at API level
```

### **Prisma Database**
```typescript
// Key models:
User → Authentication and subscription metadata
Trial → 30-day trial management
Memorial → Ownership tracking (references Sanity documents)

// Connection handling:
- Singleton pattern for development
- Connection pooling for production
```

---

## 🌍 SWEDISH LOCALIZATION

### **Language Implementation**
```typescript
// Complete Swedish translation implemented:
- All UI text in professional Swedish
- Currency in SEK (Swedish Krona)
- Date formatting in Swedish locale
- Business terminology appropriate for funeral industry

// No internationalization framework used:
- Direct Swedish text in components
- Clean URLs without language prefixes
- Consistent terminology throughout platform
```

---

## 🎯 PRODUCTION STATUS

### **Current Deployment**
- ✅ **Live on Vercel**: Full production deployment
- ✅ **Complete Feature Set**: User dashboard, memorial creation, subscription management
- ✅ **Authentication System**: Functional signin/signup with Google OAuth
- ✅ **Swedish Localization**: 100% Swedish interface with SEK pricing
- ✅ **API Endpoints**: 25+ routes with comprehensive functionality
- ✅ **PWA Ready**: Service worker and manifest for native installation

### **Recent Implementations**
- ✅ **User Dashboard**: Complete dashboard with memorial management at `/dashboard`
- ✅ **Account Management**: Subscription and trial management at `/account`
- ✅ **Memorial Creation**: Protected creation flow at `/memorial/create`
- ✅ **Route Protection**: Middleware-based authentication for protected routes
- ✅ **Trial System**: 30-day trials with upgrade prompts and cancellation

---

## 💡 BUSINESS STRATEGY SUMMARY

### **Market Focus**
- **Geographic**: Sweden-first launch, international expansion planned
- **Target**: Dual B2B (funeral homes) + B2C (families)
- **Revenue**: Subscription SaaS with NFC hardware sales
- **Scale**: 30-100 users year 1 → 1,000-10,000+ users target

### **Technical Priorities**
- **Hosting**: Vercel optimized for Next.js 14
- **Database**: Smart hybrid - Sanity CMS + PostgreSQL validated
- **Mobile**: Web-first responsive design approach
- **Features**: NFC integration priority over advanced AI features

### **Development Guidelines**
- **Language**: English development, Swedish UI (no i18n framework needed)
- **Performance**: Core Web Vitals monitoring enabled
- **Testing**: 93% test coverage maintained
- **Security**: Production-grade security headers and rate limiting

---

**The platform is production-ready with complete Swedish localization, user management system, and robust authentication flows.**