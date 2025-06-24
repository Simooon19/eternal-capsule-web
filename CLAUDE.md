# 🤖 CLAUDE.md - Minneslund Project Guide

**For AI Assistants working on the Minneslund Digital Memorial Platform**

---

## 🎯 PROJECT OVERVIEW

**Minneslund** is a production-ready digital memorial platform that connects physical graves to digital memories through NFC technology, serving funeral homes, families, and individuals. The name honors Sweden's tradition of memory groves (minneslundar) while bringing them into the digital age.

### Core Business Model
- **Target Market**: Funeral homes (primary), individual families (secondary)
- **Revenue**: Subscription-based SaaS with 3 tiers (Personal/NFC/Custom)
- **Key Value**: Bridge physical gravesites to digital memorials via NFC tags

### Current Status
- ✅ **Production-ready** platform (93% test coverage)
- ✅ **Complete feature set** implemented
- ✅ **Professional UI/UX** with responsive design
- ✅ **API-first architecture** with 25+ endpoints
- ✅ **Production Deployed** on Vercel (https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)

---

## 🏗️ TECHNICAL ARCHITECTURE

### Stack Overview
```typescript
Frontend:  Next.js 14 + TypeScript + Tailwind CSS + Framer Motion
Backend:   Next.js API Routes + Serverless Functions
Database:  Sanity CMS (primary) + Prisma + PostgreSQL (metadata)
Auth:      NextAuth.js + Session-based authentication
Payments:  Stripe subscriptions with webhooks
Email:     Resend with custom templates
Media:     Sanity CDN + Image optimization
PWA:       Service Worker + Manifest + Offline support
```

### Key Dependencies
```json
{
  "next": "14.1.0",
  "react": "18.2.0",
  "typescript": "5.3.3",
  "tailwindcss": "3.4.1",
  "framer-motion": "10.16.4",
  "sanity": "3.29.1",
  "prisma": "6.10.0",
  "next-auth": "4.24.11",
  "stripe": "18.2.1",
  "react-leaflet": "4.2.1"
}
```

### Directory Structure
```
src/
├── app/                    # Next.js 14 App Router
│   ├── api/               # API endpoints (25+ routes)
│   ├── auth/              # Authentication pages
│   ├── memorial/          # Memorial creation/viewing
│   ├── pricing/           # Subscription management
│   └── obituaries/        # Recent obituaries
├── components/            # React components
│   ├── ui/               # Base UI components
│   ├── memorial/         # Memorial-specific components
│   ├── admin/            # Admin dashboard components
│   └── pricing/          # Pricing page components
├── lib/                  # Utility libraries
├── sanity/               # Sanity CMS configuration
└── types/                # TypeScript definitions
```

---

## 🔑 CORE BUSINESS LOGIC

### Memorial Creation Workflow
1. **User Input** → Form with name, dates, photos, story
2. **Validation** → Required fields, date logic, file types
3. **Media Upload** → Sanity CDN with optimization
4. **Database Storage** → Sanity document creation
5. **NFC Generation** → Unique NFC tag UID assignment
6. **Email Notification** → Family notification (if provided)
7. **Admin Approval** → Moderation workflow (bulk imports)

### Subscription Management
```typescript
Plans: {
  personal: { price: 0, memorials: 3, features: ["basic"] },
  nfc: { price: 2900, memorials: 10, features: ["nfc", "unlimited_photos"] },
  custom: { price: null, memorials: -1, features: ["api", "branding"] }
}
```

### Data Schemas
**Memorial (Sanity)**:
```typescript
{
  _type: "memorial",
  name: string,
  personalInfo: {
    dateOfBirth: string,
    dateOfDeath: string,
    restingPlace: { coordinates: geopoint }
  },
  description: text,
  image: image,
  photos: array<image>,
  slug: slug,
  tags: array<string>
}
```

### NFC Integration
- **Physical Tags** → Generated UIDs link to memorial URLs
- **Web NFC API** → Browser-based scanning capability
- **QR Fallback** → For non-NFC devices
- **Deep Linking** → Direct memorial access via scan

---

## 💼 BUSINESS WORKFLOWS

### Funeral Home Process
1. **CSV Upload** → Bulk memorial creation (up to 50)
2. **Data Validation** → Required fields, format checking
3. **NFC Generation** → Automatic tag assignment
4. **Admin Review** → Memorial approval workflow
5. **Family Handoff** → Email notifications with access links
6. **Physical Distribution** → NFC tags to families

### Family Experience
1. **Memorial Access** → Via NFC scan or direct link
2. **Guestbook Interaction** → Leave messages, reactions
3. **Photo Viewing** → Gallery with lightbox
4. **Story Reading** → Rich text memorial content
5. **Sharing** → Social media integration

### Admin Operations
1. **Dashboard Monitoring** → Business metrics, health checks
2. **Content Moderation** → Memorial approval/rejection
3. **User Management** → Subscription limits, permissions
4. **Analytics Review** → Performance and usage metrics

---

## 🎨 UI/UX PATTERNS

### Design System
- **Colors**: Granite (grays) + Copper (brand accent)
- **Typography**: System fonts with careful hierarchy
- **Spacing**: Tailwind's standard scale (4px grid)
- **Components**: Consistent UI library in `/components/ui/`

### Responsive Strategy
```css
Mobile-first approach:
- Base styles for mobile (375px+)
- sm: 640px+ (tablet)
- md: 768px+ (desktop)
- lg: 1024px+ (large desktop)
- xl: 1280px+ (extra large)
```

### State Management
- **Server State**: Sanity CMS + SWR/fetch
- **Client State**: React useState/useReducer
- **Global State**: React Context for auth, theme
- **Form State**: Controlled components with validation

---

## 🔒 SECURITY & AUTHENTICATION

### Authentication Flow
```typescript
NextAuth.js providers:
- Email/password (primary)
- Google OAuth (harmonized across signin/signup)
- Session management with JWT
- Role-based access control

Harmonized Authentication Pages:
- /auth/signin: Functional NextAuth integration
- /auth/signup: Account creation + trial activation
- Consistent UI/UX with Swedish translations
- Removed non-functional OAuth providers (Facebook)
```

### Data Protection
- **Input Validation**: Zod schemas for API routes
- **Rate Limiting**: IP-based with Redis backing
- **CORS Configuration**: Restricted to allowed origins
- **Image Upload**: Size limits, type validation
- **SQL Injection**: Prisma ORM protection

### Subscription Security
- **Stripe Webhooks**: Cryptographic signature verification
- **Usage Limits**: Enforced at API level
- **Plan Validation**: Server-side subscription checks

---

## 🧪 TESTING STRATEGY

### Test Coverage
```typescript
Unit Tests: Jest + React Testing Library (70%+ coverage)
E2E Tests: Playwright (15 comprehensive scenarios)
API Tests: Integrated with business logic testing
Performance: Lighthouse CI + Core Web Vitals
```

### Test Patterns
- **Component Testing**: Isolated UI component behavior
- **Integration Testing**: API endpoints with database
- **User Journey Testing**: Complete workflows end-to-end
- **Performance Testing**: Load times, responsiveness

---

## 📊 ANALYTICS & MONITORING

### Health Monitoring
```typescript
/api/health endpoint returns:
- Database connectivity (Prisma + Sanity)
- API response times
- Environment configuration
- Service availability status
```

### Business Metrics
```typescript
/api/metrics endpoint tracks:
- User registrations and subscriptions
- Memorial creation rates
- Guestbook engagement
- NFC scan analytics
- Revenue metrics
```

### Error Tracking
- **Sentry Integration**: Production error monitoring
- **Custom Error Boundaries**: Graceful failure handling
- **API Error Logging**: Comprehensive request tracking

---

## 🚀 DEPLOYMENT & INFRASTRUCTURE

### Production Environment
- **Platform**: Vercel (recommended) or custom hosting
- **Database**: PostgreSQL + Sanity cloud
- **CDN**: Sanity CDN for media assets
- **Email**: Resend service
- **Monitoring**: Built-in health checks + Sentry

### Environment Variables
```env
# Core Configuration
NEXT_PUBLIC_SITE_URL=production_url
NEXT_PUBLIC_SANITY_PROJECT_ID=sanity_project
SANITY_API_TOKEN=write_token

# Authentication
NEXTAUTH_SECRET=secure_secret
NEXTAUTH_URL=production_url

# Payments
STRIPE_SECRET_KEY=stripe_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=stripe_public

# Email
RESEND_API_KEY=resend_key
EMAIL_FROM=noreply@eternalcapsule.com

# Database
DATABASE_URL=postgresql_connection
```

---

## 🚀 DEVELOPMENT WORKFLOW

### **Quick Start Commands**
```bash
# Start development (runs all necessary services)
npm run dev

# Full validation (TypeScript + Linting + Tests)
npm run validate

# Build for production
npm run build

# Run all tests
npm test

# Run E2E tests
npm run test:e2e

# Check types only
npm run type-check

# Fix linting issues
npm run lint:fix
```

### **Database Operations**
```bash
# Generate Prisma client (required after schema changes)
npx prisma generate

# Run database migrations
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# View database in browser
npx prisma studio
```

### **Common Development Tasks**
```bash
# Install dependencies
pnpm install

# Start Sanity Studio (CMS)
cd src/sanity && npm run dev

# Bundle analysis
npm run build:analyze

# Test coverage report
npm run test:coverage
```

### **Production Deployment**
```bash
# Build and validate for production
npm run build && npm run validate

# Run production server locally
npm run start

# Environment validation
node scripts/validate-env.js
```

---

## 🔧 DEVELOPMENT PATTERNS

### Code Organization
```typescript
// Consistent file naming
page.tsx          // Next.js pages
route.ts          // API endpoints  
components.tsx    // React components
types.ts          // TypeScript definitions
utils.ts          // Utility functions
```

### API Conventions
```typescript
// RESTful patterns
GET    /api/memorials     // List resources
GET    /api/memorials/id  // Get single resource
POST   /api/memorials     // Create resource
PUT    /api/memorials/id  // Update resource
DELETE /api/memorials/id  // Delete resource
```

### Error Handling
```typescript
// Consistent error responses
{
  error: string,
  message: string,
  statusCode: number,
  details?: object
}
```

### Data Fetching
```typescript
// Server-side data fetching in pages
async function getData() {
  const res = await fetch('api/endpoint')
  if (!res.ok) throw new Error('Failed to fetch')
  return res.json()
}
```

---

## 📚 KEY INTEGRATIONS

### Sanity CMS
- **Purpose**: Primary content storage for memorials
- **Schema**: Custom types for memorials, guestbook entries
- **Features**: Real-time updates, media management, GROQ queries
- **Studio**: Admin interface at `/studio` route

### Stripe Payments
- **Products**: Personal (free), NFC ($29/mo), Custom (contact)
- **Features**: Subscriptions, webhooks, payment methods
- **Webhooks**: Handle subscription updates, payment failures
- **Integration**: Custom plan validation and limits

### Leaflet Maps
- **Version**: react-leaflet@4.2.1 (React 18 compatible)
- **Purpose**: Memorial location display
- **Features**: Interactive maps, markers, coordinates
- **Configuration**: Custom markers, responsive design

---

## 🎭 PERFORMANCE CONSIDERATIONS

### Image Optimization
```typescript
// Next.js Image component with Sanity
<Image
  src={imageUrl}
  alt={altText}
  width={width}
  height={height}
  priority={isAboveFold}
  quality={85}
/>
```

### Code Splitting
- **Dynamic Imports**: Heavy components loaded on demand
- **Route-based Splitting**: Automatic with Next.js App Router
- **Vendor Splitting**: Separate bundles for libraries

### Caching Strategy
- **Static Assets**: Long-term caching for images, CSS, JS
- **API Routes**: Conditional caching based on content type
- **Database Queries**: Sanity CDN caching + SWR client-side

---

## 🐛 COMMON GOTCHAS & TROUBLESHOOTING

### **Development Issues**

#### **Build Failures**
```bash
# If build fails, check these in order:
1. npm run type-check  # Check TypeScript errors
2. npm run lint        # Check ESLint errors  
3. npx prisma generate # Regenerate Prisma client
4. rm -rf .next && npm run build # Clear Next.js cache
```

#### **Database Connection Issues**
```bash
# Reset database connection
npx prisma migrate reset
npx prisma generate
npm run dev
```

#### **Sanity CMS Issues**
```bash
# If Sanity Studio won't start:
1. Check NEXT_PUBLIC_SANITY_PROJECT_ID in .env.local
2. Verify SANITY_API_TOKEN has correct permissions
3. Run: cd src/sanity && npm install
```

### **Environment Setup**
```bash
# Required environment variables (see env.example):
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
SANITY_API_TOKEN=your_api_token
DATABASE_URL=your_database_url
NEXTAUTH_SECRET=your_secret
STRIPE_SECRET_KEY=your_stripe_key
```

### **Performance Optimization**
```bash
# Check bundle size
npm run build:analyze

# Run performance tests
npm run test:e2e -- --grep "performance"

# Check Core Web Vitals
# Use Chrome DevTools Lighthouse
```

### **React-Leaflet Version Lock**
```typescript
// CRITICAL: Keep react-leaflet@4.2.1 for React 18
// v5+ requires React 19 - do not upgrade yet
"react-leaflet": "4.2.1"

// If you get leaflet errors:
1. npm install leaflet-defaulticon-compatibility
2. Import in components using maps
3. Check that CSS is imported in globals.css
```

### **Hydration Issues**
```typescript
// Always check for client-side rendering
const [mounted, setMounted] = useState(false)
useEffect(() => setMounted(true), [])
if (!mounted) return null // Prevent hydration mismatch

// For maps and other client-only components:
import dynamic from 'next/dynamic'
const MapComponent = dynamic(() => import('./MapComponent'), {
  ssr: false,
  loading: () => <p>Loading map...</p>
})
```

### **Framer Motion with SSR**
```typescript
// Use conditional rendering for animations
{isMounted ? (
  <motion.div variants={fadeIn}>Content</motion.div>
) : (
  <div>Static content</div>
)}

// Or use the MotionConfig provider:
import { MotionConfig } from 'framer-motion'
<MotionConfig reducedMotion="user">
  <motion.div>Content</motion.div>
</MotionConfig>
```

### **PostCSS Configuration**
```javascript
// CRITICAL: Keep CommonJS format for Next.js compatibility
// Do NOT convert to ESM - will break build
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
```

### **Testing Issues**
```bash
# If tests fail to run:
1. Check jest.setup.js exists
2. Verify @testing-library packages are installed
3. Run: npm run test -- --clearCache

# If E2E tests fail:
1. Check playwright.config.ts
2. Install browsers: npx playwright install
3. Run headed: npm run test:e2e -- --headed
```

---

## 📋 BUSINESS RULES

### Subscription Limits
```typescript
const limits = {
  personal: { memorials: 3, storage: "50 photos" },
  nfc: { memorials: 10, storage: "unlimited" },
  custom: { memorials: -1, storage: "unlimited" }
}
```

### Content Moderation
- **Auto-approval**: Individual memorial creation
- **Manual approval**: Bulk imports from funeral homes
- **Content filtering**: Basic profanity and spam detection
- **Admin override**: Manual approval/rejection workflow

### Data Retention
- **Active memorials**: Preserved indefinitely
- **Deleted memorials**: 30-day recovery period
- **User accounts**: GDPR-compliant deletion
- **Analytics data**: Aggregated, anonymized metrics

---

## 📋 CONFIRMED BUSINESS STRATEGY

Based on detailed discussions with the founder, here's the confirmed strategic direction:

### 🎯 Market Focus & Strategy
- **Geographic Market**: Sweden-first launch, then international expansion
- **Language Strategy**: English development, Swedish translation postponed until requested
- **Target Customers**: Dual focus - B2B (funeral homes) + B2C (families). B2B expected to be easier sales channel
- **Partnerships**: No existing funeral home partnerships; waiting for NFC tag implementation
- **Go-to-Market**: One-person operation scaling from 30-100 users year 1 → 1,000-10,000+ users

### 🚀 Technical Infrastructure  
- **Hosting**: Vercel (confirmed preference for Next.js optimization)
- **Database**: Smart/budget hybrid - Sanity CMS + PostgreSQL (current architecture validated)
- **Mobile Strategy**: Web-first responsive design (phone, computer, tablet) 
- **Compliance**: Swedish GDPR + deceased person data regulations research needed

### 🎨 Feature Priorities
- **Multi-language**: HOLD - only implement if specifically requested
- **White-label**: NOT NEEDED for initial launch
- **Content Moderation**: AI verification system for scaling memorial approvals
- **Support Model**: Self-service + dedicated account management hybrid

### 💰 Business Operations
- **Payment**: Stripe sufficient for Swedish market launch
- **Email Marketing**: Not needed initially  
- **Funeral Software**: Research needed on Swedish funeral management systems
- **Target Growth**: 30-100 year 1 → 1,000-10,000 users (validated as reasonable for Swedish market)

---

## 🎯 IMMEDIATE NEXT STEPS

Based on current status:

1. **✅ Technical Implementation**: Platform is production-ready
2. **✅ GROQ Query Fixes**: Fixed count() and group function errors  
3. **✅ Visual Assets**: Hero background images integrated
4. **✅ Swedish Translation**: Complete rebranding to "Minneslund" with 100% Swedish translation
5. **✅ Authentication Harmonization**: Signin/signup pages unified with functional NextAuth
6. **✅ Currency Updates**: Converted pricing from USD to SEK (320 kr/månad)
7. **🚀 Phase 3**: Production deployment preparation
8. **📊 Monitoring**: Set up production analytics and alerts

**The platform is production-ready with complete Swedish localization and harmonized authentication flows.** 