# 🕊️ Minneslund - Digital Minneslundsplattform

**[English version below](#english-version)**

## Svenska

> **NFC-aktiverade digitala minneslundar för moderna begravningsbyråer**

Minneslund är en banbrytande digital minneslundsplattform som överbryggar den fysiska och digitala världen genom NFC-teknik, vilket gör det möjligt för familjer att skapa bestående hyllningar som är tillgängliga direkt från gravstenar.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)](#)
[![Next.js](https://img.shields.io/badge/Next.js-000000?logo=next.js&logoColor=white)](#)
[![Sanity](https://img.shields.io/badge/Sanity-F03E2F?logo=sanity&logoColor=white)](#)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed-Vercel-000000?logo=vercel&logoColor=white)](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)

---

## 🚀 **LIVE DEPLOYMENT**

### **Production Environment**
- **🌐 Live Site**: [https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)
- **✅ Status**: Production Ready - Fully Deployed
- **📅 Last Deployed**: December 24, 2025
- **🏗️ Platform**: Vercel (Optimized for Next.js 14)
- **🗄️ Database**: PostgreSQL + Sanity CMS
- **🌍 CDN**: Global Edge Network

### **Live Features**
- ✅ **Swedish Memorial Platform** with enhanced visual design
- ✅ **Beautiful Memorial Cards** with custom Swedish placeholder images
- ✅ **Responsive Design** optimized for all devices
- ✅ **Authentication System** (signin/signup with Google OAuth)
- ✅ **Pricing Page** with SEK currency (320 kr/månad)
- ✅ **API Endpoints** (25+ routes) for full functionality
- ✅ **Progressive Web App** with offline support
- ✅ **Performance Optimized** with Core Web Vitals monitoring

### **Test the Live Platform**
1. **Homepage**: Beautiful memorial cards with Swedish content
2. **Authentication**: `/auth/signin` and `/auth/signup` with Google OAuth
3. **Pricing**: `/pricing` page with Swedish currency
4. **Memorial Exploration**: `/memorial/explore` for browsing memorials
5. **Obituaries**: `/obituaries` for recent memorial listings

---

## 🌟 **PLATTFORMSFUNKTIONER**

### **🌍 Språkstöd**
- ✅ **Svenskt gränssnitt** - Professionellt språk anpassat för begravningsbranschen
- ✅ **Rena URL:er** - Direkt routing utan språkprefix (t.ex. `/pricing`, `/memorial/create`)
- ✅ **Konsekvent kommunikation** - Allt användarinnehåll på klar, professionell svenska
- ✅ **Branschterminologi** - Lämpligt språk för begravningsbyråer och familjer

### **💎 Core Platform**
- ✅ **Full-Stack Next.js 14** with TypeScript
- ✅ **Sanity CMS** with optimized schemas
- ✅ **NFC & QR Code Integration** for graveside access
- ✅ **Responsive Design** with mobile-first approach
- ✅ **Progressive Web App (PWA)** with offline support and native installation

### **🔐 Enterprise Security**
- ✅ **Rate Limiting System** (IP-based with Redis support)
- ✅ **Input Validation** and XSS protection
- ✅ **CORS Configuration** for production domains
- ✅ **Environment Security** with encrypted secrets

### **💳 Payment Processing**
- ✅ **Stripe Integration** with subscription management
- ✅ **Multi-tier Plans** (Free, Family, Funeral Home, Enterprise)
- ✅ **Webhook Handling** for automated billing
- ✅ **Pro-rated Upgrades** and cancellations

### **📧 Communication System**
- ✅ **Resend Email Service** with custom templates
- ✅ **Automated Notifications** (memorial created, guestbook entries)
- ✅ **Subscription Alerts** (payments, upgrades, failures)

### **🔍 Basic Search Engine**
- ✅ **Full-Text Search** across all memorial content
- ✅ **Basic Filtering** (date, location, tags)
- ✅ **Search Analytics** and popular searches

### **📊 Basic Analytics**
- ✅ **Basic Performance Monitoring**
- ✅ **Simple Usage Statistics** 
- ✅ **Basic Business Dashboard** with key insights

### **🎨 User Experience**
- ✅ **Optimized Images** with WebP/AVIF support
- ✅ **Lazy Loading** and infinite scroll
- ✅ **Toast Notifications** for user feedback
- ✅ **Error Boundaries** with graceful fallbacks
- ✅ **Skeleton Loaders** for perceived performance

### **🏢 Funeral Home Features**
- ✅ **Funeral Home Management** with role-based access
- ✅ **Subscription Limits** enforcement (100 memorials/month)
- ✅ **Basic Branding** with logo display
- ✅ **Bulk Memorial Creation** API for existing client data
- ✅ **CSV Import Interface** for bulk upload with validation
- ✅ **Family Handoff** workflow with email notifications

### **📄 CSV Import System**
- ✅ **Bulk Upload Interface** for funeral homes (up to 50 memorials)
- ✅ **CSV Template Download** with proper format and examples
- ✅ **Live Preview & Validation** before import with error detection
- ✅ **Permission-Based Access** (funeral/enterprise plans only)
- ✅ **Error Recovery** with detailed feedback and retry options
- ✅ **Success Tracking** with detailed import results and NFC tag generation

---

## 🚀 **QUICK START**

### **Prerequisites**
- **Node.js 18.0+** and pnpm
- **PostgreSQL 12+** (for Prisma database)
- **Sanity account** (for CMS)
- **Stripe account** (for payments)
- **Resend account** (for emails)
- **Redis** (optional, for production rate limiting)

### **Installation**

```bash
# Clone repository
git clone https://github.com/your-org/eternal-capsule-web
cd eternal-capsule-web

# Install dependencies
pnpm install

# Generate Prisma client (required)
npx prisma generate

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your credentials

# Run development server
pnpm dev
```

### **Environment Setup**

```env
# Core Configuration
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
SANITY_API_TOKEN=your_api_token

# No internationalization configuration needed

# Payment Processing
STRIPE_SECRET_KEY=sk_test_your_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_key

# Email Service
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=your-email@domain.com

# Database
DATABASE_URL=your_prisma_database_url
```

### **Important Notes**

- **React-Leaflet Compatibility**: This project uses `react-leaflet@4.2.1` for React 18 compatibility. Do not upgrade to v5+ without updating to React 19.
- **PostCSS Configuration**: Uses CommonJS format for Next.js compatibility. Do not convert to ESM.
- **Tailwind Setup**: Custom granite-copper color plugin requires specific configuration.
- **Webpack Configuration**: Uses `esmExternals: false` to fix module factory issues with ESM packages like react-leaflet and firebase-admin.

---

## 🏗️ **ARCHITECTURE**

### **Technology Stack**
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Serverless Functions
- **Database**: Sanity CMS with GROQ queries
- **Payments**: Stripe with webhook automation
- **Email**: Resend with custom templates
- **Storage**: Sanity CDN + optional S3 integration
- **Deployment**: Vercel (recommended) or self-hosted

### **Performance Goals** 
*(Target benchmarks for optimization)*
- **First Contentful Paint**: <1.8s 
- **Largest Contentful Paint**: <2.5s 
- **Cumulative Layout Shift**: <0.1 
- **Core Web Vitals**: Basic tracking enabled

---

## 💼 **BUSINESS MODEL**

### **Subscription Tiers**

| Feature | Free | Family ($19/mo) | Funeral Home ($99/mo) | Enterprise ($249/mo) |
|---------|------|---------------|-----------------------|---------------------|
| Memorials | 3 | 15 | 100 | Unlimited |
| Storage | 50 photos | Unlimited | Unlimited | Unlimited |
| NFC Tags | ❌ | ✅ | ✅ | ✅ |
| Custom Branding | ❌ | ❌ | ✅ | ✅ |
| API Access | ❌ | ❌ | ✅ | ✅ |
| Priority Support | ❌ | ✅ | ✅ | ✅ |
| Analytics | Basic | Standard | Advanced | Enterprise |

### **Revenue Streams**
1. **Subscription Revenue** - Monthly recurring billing
2. **NFC Tag Sales** - Hardware markup
3. **Custom Development** - Enterprise features
4. **White-label Licensing** - Platform licensing
5. **Training & Support** - Professional services

---

## 🎯 **TARGET MARKET**

### **Primary Customers**
- **Funeral Homes** (2,500+ in target markets)
- **Cemeteries** with progressive technology adoption
- **Memorial Service Providers**
- **Religious Organizations**

### **Market Opportunity**
- **TAM**: $2.1B (US funeral industry)
- **SAM**: $180M (tech-enabled segment)
- **SOM**: $18M (initial 3-year target)

---

## 📈 **SCALING ROADMAP**

### **Phase 1: Market Entry** *(Current)*
- ✅ Core platform development
- ✅ Initial funeral home partnerships
- ✅ Payment processing integration
- ✅ Basic analytics and monitoring

### **Phase 2: Growth** *(Q2 2024)*
- 🔄 Advanced search and AI features
- 🔄 Mobile app development
- 🔄 Marketplace for memorial products
- 🔄 International expansion (Canada, UK)

### **Phase 3: Scale** *(Q4 2024)*
- 📋 Enterprise sales team
- 📋 White-label solutions
- 📋 API marketplace
- 📋 Acquisition opportunities

---

## 🔧 **DEVELOPMENT**

### **Project Structure**
```
src/
├── app/                 # Next.js 14 app router
│   ├── api/            # API endpoints
│   ├── admin/          # Admin dashboard
│   └── memorial/       # Memorial pages
├── components/         # Reusable components
│   ├── ui/            # Base UI components
│   ├── memorial/      # Memorial-specific components
│   └── admin/         # Admin components
├── lib/               # Utility libraries
├── sanity/            # Sanity CMS configuration
└── types/             # TypeScript definitions
```

### **Key Scripts**
```bash
pnpm dev          # Development server
pnpm build        # Production build
pnpm lint         # Code linting
pnpm type-check   # TypeScript checking
pnpm test         # Run tests
```

### **Authentication & Permissions**

The platform uses **hybrid authentication** to ensure seamless development while maintaining production security:

#### **Development Mode** (No Token Required)
- Automatically uses **mock data** for guestbook and memorial operations
- All features work without Sanity authentication
- Perfect for local development and testing

#### **Production Mode** (Token Required)
```env
# Required for write operations in production
SANITY_API_TOKEN=sk_your_api_token_here
```

#### **Setting Up Sanity Token**
1. Go to your [Sanity Project Settings](https://manage.sanity.io/)
2. Navigate to **API** → **Tokens**
3. Create a new token with **Editor** permissions
4. Add the token to your `.env.local` file

**Note**: Without a token, the platform gracefully falls back to mock responses, ensuring guestbook entries work in development while alerting about the missing configuration.

### **AI Assistant Development**

This project is optimized for AI assistants like Claude:

```bash
# Quick validation of entire codebase
npm run validate

# Comprehensive testing including E2E
npm run validate:full

# Environment validation
node scripts/validate-env.js

# Full project setup
npm run setup
```

**Key Files for AI Assistants:**
- `CLAUDE.md` - Comprehensive development guide
- `scripts/validate-env.js` - Environment validation
- `docs/` - Complete API and feature documentation
- `env.example` - Environment variables template

### **Contributing**
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Run validation (`npm run validate`)
4. Commit changes (`git commit -m 'Add amazing feature'`)
5. Push to branch (`git push origin feature/amazing-feature`)
6. Open Pull Request

---

## 📊 **BASIC MONITORING & ANALYTICS**

### **Built-in Features**
- **Basic Performance Tracking**: Core Web Vitals collection
- **Simple Business Analytics**: Revenue, subscriptions, usage
- **Error Boundaries**: Graceful error handling
- **Basic User Analytics**: Memorial views and interactions

### **Health Checks**
- `/api/health` - Application health status
- `/api/metrics` - Basic system metrics

---

## 🔒 **SECURITY & COMPLIANCE**

### **Security Measures**
- **Rate Limiting**: IP-based with configurable limits
- **Input Validation**: Comprehensive sanitization
- **HTTPS Everywhere**: TLS 1.3 encryption
- **Webhook Verification**: Cryptographic signatures
- **Environment Security**: Encrypted secret management

### **Compliance Ready**
- **GDPR Ready**: Data retention and deletion capabilities
- **CCPA Compliant**: Privacy controls and data portability
- **Security Best Practices**: Comprehensive audit trails and monitoring
- **HIPAA Considerations**: Framework for protected health information

---

## 📞 **SUPPORT & DOCUMENTATION**

### **Complete Documentation**
- [Database Guide](./docs/database.md) - **🗄️ PostgreSQL + Prisma setup, schema, operations**
- [Authentication Guide](./docs/authentication.md) - **🔐 NextAuth.js, OAuth, role-based access**
- [Admin Dashboard Guide](./docs/admin-guide.md) - **👑 Business analytics, user management, reporting**
- [API Documentation](./docs/api.md) - Complete API reference with 25+ endpoints including bulk memorial creation
- [User Guide](./docs/user-guide.md) - **🏢 Funeral Home CSV import and bulk creation guide**
- [Testing Guide](./docs/testing.md) - Unit, API, and E2E testing documentation with CSV import tests
- [Deployment Guide](./DEPLOYMENT.md) - Production deployment and scaling

### **Support Channels**
- **Email**: support@eternalcapsule.com
- **Documentation**: docs.eternalcapsule.com
- **Status Page**: status.eternalcapsule.com
- **Community**: community.eternalcapsule.com

---

## 📜 **LICENSE**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 **ACKNOWLEDGMENTS**

- Built with [Next.js](https://nextjs.org/) and [Sanity](https://sanity.io/)
- Icons by [Heroicons](https://heroicons.com/)
- Design system inspired by [Tailwind UI](https://tailwindui.com/)
- Deployment powered by [Vercel](https://vercel.com/)

---

<div align="center">

**Eternal Capsule** - *Preserving memories for eternity* 🕊️

[Website](https://eternalcapsule.com) • [Documentation](https://docs.eternalcapsule.com) • [Support](mailto:support@eternalcapsule.com)

</div>
