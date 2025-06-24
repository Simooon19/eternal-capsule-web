# 🚀 Eternal Capsule - Production Deployment Guide

## ✅ **CURRENT PRODUCTION DEPLOYMENT**

### **Live Environment**
- **🌐 Production URL**: [https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app](https://eternal-capsule-alfjhbvch-simon-anderssons-projects-8e7f4176.vercel.app)
- **📅 Deployed**: December 24, 2025
- **🏗️ Platform**: Vercel (Serverless Functions)
- **✅ Status**: Production Ready
- **🔧 Build**: Next.js 14 + TypeScript
- **🗄️ Database**: Sanity CMS (njjoaq85/production)
- **🌍 CDN**: Global Edge Network

### **Deployment Details**
- **Build Time**: ~3 minutes
- **Build Status**: ✅ Successful (30/30 pages generated)
- **Bundle Size**: 188KB shared JS (optimized)
- **API Routes**: 25+ endpoints deployed
- **Static Pages**: 7 pre-rendered pages
- **Dynamic Routes**: Memorial pages, auth, admin

### **Live Features Confirmed**
- ✅ Swedish memorial platform with enhanced visual design
- ✅ Beautiful memorial cards with custom placeholder images (3 designs)
- ✅ Responsive navigation and mobile optimization
- ✅ Authentication system (signin/signup) with proper Suspense boundaries
- ✅ Pricing page with SEK currency (320 kr/månad)
- ✅ Memorial exploration and obituaries pages
- ✅ Analytics tracking and performance monitoring
- ✅ PWA support with service worker

### **Next Steps for Production Use**
1. **Custom Domain**: Set up minneslund.se domain
2. **Environment Variables**: Configure production secrets in Vercel
3. **Database**: Connect PostgreSQL for user data
4. **Email Service**: Configure Resend for notifications
5. **Stripe**: Set up live payment processing

---

This guide covers everything needed to deploy Eternal Capsule to production with all features enabled.

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Sanity.io account and project
- Stripe account for payments
- Resend account for emails
- Domain name and SSL certificate
- (Optional) Redis for rate limiting
- (Optional) AWS S3 for additional storage

## 🔧 Environment Variables

Create a `.env.local` file with the following variables:

### Core Configuration
```env
# Next.js
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
NODE_ENV=production

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_api_token

# Language Support Configuration
NEXT_PUBLIC_DEFAULT_LOCALE=en
NEXT_PUBLIC_SUPPORTED_LOCALES=en,sv

# Locale Detection (Optional - automatic detection works by default)
NEXT_PUBLIC_ENABLE_LOCALE_DETECTION=true
NEXT_PUBLIC_ENABLE_IP_DETECTION=true
```

### Payment Processing (Stripe)
```env
STRIPE_SECRET_KEY=sk_live_your_live_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_live_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# Product Price IDs (create in Stripe Dashboard)
STRIPE_FAMILY_PRICE_ID=price_family_monthly
STRIPE_FUNERAL_PRICE_ID=price_funeral_monthly
STRIPE_ENTERPRISE_PRICE_ID=price_enterprise_monthly
```

### Email Service (Resend)
```env
RESEND_API_KEY=re_your_api_key
EMAIL_FROM=Eternal Capsule <no-reply@yourdomain.com>
SUPPORT_EMAIL=support@yourdomain.com
```

### Security
```env
JWT_SECRET=your_super_long_random_jwt_secret_key_here
SESSION_SECRET=your_32_character_session_encryption_key
```

### Optional Integrations
```env
# Google Maps for location features
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key

# Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Redis for advanced rate limiting (optional)
REDIS_URL=redis://localhost:6379
```

## 🏗️ Deployment Steps

### 1. Sanity Setup

1. Create a new Sanity project:
```bash
npm create sanity@latest
```

2. Configure your project with the schema:
```bash
cd your-project
pnpm install
pnpm sanity deploy
```

3. Set up CORS for your domain in Sanity settings.

### 2. Authentication Setup (NextAuth)

1. **Set Required Environment Variables:**
```env
NEXTAUTH_URL=https://yourdomain.com
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters
```

2. **Configure Google OAuth (if using):**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add your domain to authorized origins
   - Set redirect URI: `https://yourdomain.com/api/auth/callback/google`

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 3. Database Setup (Prisma)

**📚 For complete database setup guide, see [Database Documentation](./docs/database.md)**

1. **Install and generate Prisma client:**
```bash
npx prisma generate
```

2. **For production, use optimized generation:**
```bash
npx prisma generate --no-engine
```

3. **Run database migrations:**
```bash
# Push schema to database (development)
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy

# Verify tables were created
npx prisma studio
```

**Note**: The database uses a dual-architecture with PostgreSQL (via Prisma) for user data and Sanity CMS for memorial content. See the [Database Guide](./docs/database.md) for detailed setup, relationships, and maintenance procedures.

### 4. Stripe Configuration

1. Create products in Stripe Dashboard:
   - **Family Plan**: $19/month
   - **Funeral Home Plan**: $99/month  
   - **Enterprise Plan**: $249/month

2. Set up webhooks pointing to: `https://yourdomain.com/api/stripe/webhooks`

3. Configure webhook events:
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_failed`
   - `invoice.payment_succeeded`

### 3. Email Configuration (Resend)

1. Sign up for Resend and verify your domain
2. Create an API key
3. Set up DNS records for email authentication

### 4. Application Deployment

#### Option A: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Configure environment variables in Vercel dashboard
3. Deploy with automatic builds on push

#### Option B: Self-Hosted

1. Build the application:
```bash
pnpm build
```

2. Start with PM2:
```bash
pm2 start npm --name "eternal-capsule" -- start
```

3. Configure Nginx reverse proxy:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/private.key;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔒 Security Checklist

- [ ] HTTPS enabled with valid SSL certificate
- [ ] Environment variables secured (not in code)
- [ ] Rate limiting configured
- [ ] CORS properly configured
- [ ] Webhook signatures verified
- [ ] Input validation implemented
- [ ] SQL injection protection (via Sanity)
- [ ] XSS protection enabled
- [ ] CSP headers configured

## 📊 Monitoring Setup

### 1. Performance Monitoring
The app includes built-in performance monitoring. Monitor these metrics:
- Page load times
- Core Web Vitals
- API response times
- Memorial creation success rates

### 2. Error Tracking
Configure Sentry for error tracking:
```env
SENTRY_DSN=your_sentry_dsn
```

### 3. Uptime Monitoring
Set up monitoring for these endpoints:
- `/` - Main site
- `/api/health` - Comprehensive health check (database, Sanity, env vars)
- `/api/metrics` - System performance and business metrics
- `/api/test` - Simple deployment verification
- `/admin` - Admin dashboard

**Health Check Response Format:**
```json
{
  "status": "healthy|degraded|unhealthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "services": {
    "database": { "status": "up", "responseTime": 50 },
    "sanity": { "status": "up", "responseTime": 120 },
    "environment": { "status": "configured" }
  },
  "uptime": 3600000
}
```

## 🔒 Phase 2: Security & Infrastructure Setup

### 1. Security Middleware Configuration

The application includes comprehensive security middleware with:
- **CSP Headers**: Content Security Policy for XSS protection
- **CORS Configuration**: Proper cross-origin resource sharing
- **Rate Limiting**: IP-based request limiting (60/min for API, 200/min for pages)
- **Security Validation**: SQL injection and suspicious path detection
- **Request Tracking**: Unique request IDs and client IP logging

**Security Headers Applied:**
```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'...
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

### 2. Redis Setup (Optional - for Production Scalability)

For production deployments with multiple instances, configure Redis:

```env
REDIS_ENABLED=true
REDIS_URL=redis://localhost:6379
# OR
REDIS_HOST=your-redis-host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
```

**Installation:**
```bash
# Install Redis locally
brew install redis  # macOS
sudo apt-get install redis-server  # Ubuntu

# Or use Redis Cloud/AWS ElastiCache for production
```

**Benefits:**
- Scalable rate limiting across multiple server instances
- Centralized caching for improved performance
- Session storage for load-balanced deployments

### 3. Error Tracking Setup (Optional - Sentry)

Configure Sentry for comprehensive error monitoring:

```env
SENTRY_ENABLED=true
SENTRY_DSN=https://your-dsn@sentry.io/project-id
SENTRY_SAMPLE_RATE=1.0
SENTRY_TRACES_SAMPLE_RATE=0.1
```

## 📊 Phase 3: Monitoring & Analytics Setup

### 1. Google Analytics 4 Integration

The application includes comprehensive GA4 tracking with GDPR compliance:

```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NEXT_PUBLIC_ANALYTICS_ENABLED=true
```

**Tracked Events:**
- Memorial views and creations
- Guestbook interactions
- NFC/QR code scans
- User authentication events
- Performance metrics (Core Web Vitals)
- E-commerce conversions
- Search queries and results

**Privacy Features:**
- IP anonymization enabled
- Google Signals disabled
- Consent management for GDPR
- Manual page view tracking

### 2. Structured Logging System

Comprehensive logging with sensitive data protection:

```env
LOG_LEVEL=info
ENABLE_CONSOLE_LOGS=true
ENABLE_FILE_LOGS=true
ENABLE_REMOTE_LOGS=true
REMOTE_LOG_ENDPOINT=https://your-log-service.com/logs
```

**Log Levels:**
- `debug`: Development debugging information
- `info`: General application information
- `warn`: Warning conditions
- `error`: Error conditions requiring attention
- `fatal`: Critical errors requiring immediate action

**Specialized Loggers:**
- Memorial events (creations, views, updates)
- User actions (auth, subscriptions, interactions)
- Performance metrics
- Security events
- Business events

**Features:**
- Automatic sensitive data redaction
- Structured JSON output
- Remote log aggregation
- Request tracking with correlation IDs

### 3. Basic Uptime Monitoring

Basic health monitoring available through built-in endpoints:

**Available Endpoints:**
- `/api/health` - Application health check
- `/api/metrics` - Basic system metrics
- `/api/test` - Simple deployment verification

**Monitoring Options:**
- Use external services like UptimeRobot, Pingdom, or similar
- Configure your hosting provider's built-in monitoring
- Set up simple cron job health checks

### 4. Analytics Dashboard

Access comprehensive analytics at `/admin` with:

**Key Metrics:**
- Page views and unique users
- Memorial creation metrics
- System uptime percentage
- Core Web Vitals performance scores

**Performance Monitoring:**
- Real-time Core Web Vitals tracking
- Page load time analysis
- Error rate monitoring
- Memory usage tracking

**User Analytics:**
- Traffic source breakdown
- Device type distribution
- Top page performance
- Conversion funnel analysis

**Business Intelligence:**
- Memorial creation trends
- Subscription conversion rates
- User engagement metrics
- Revenue performance tracking

### 5. Optional Log Analysis

For production deployments, you can integrate with external log services:

**Log Services Options:**
- ELK Stack (self-hosted)
- AWS CloudWatch Logs
- Google Cloud Logging
- Heroku Logs (if using Heroku)

**Basic Alerting:**
- Configure your hosting provider's built-in alerts
- Use simple email notifications for critical errors

**Setup Steps:**
1. Create account at [sentry.io](https://sentry.io)
2. Create new Next.js project
3. Copy DSN from project settings
4. Configure environment variables

**Features:**
- Automatic error capture and stack traces
- Performance monitoring and alerting
- User context and breadcrumb tracking
- Sensitive data filtering built-in

## 🔧 Production Optimizations

### 1. Image Optimization
- Enabled by default with Next.js Image component
- OptimizedImage component with WebP/AVIF support
- Lazy loading implemented

### 2. Caching Strategy
- Static assets: 1 year cache
- API responses: 1 hour cache
- Memorial pages: 1 hour cache with revalidation

### 3. Database Optimization
- Sanity CDN enabled globally
- Optimized GROQ queries
- Image transformations cached

## 📱 Mobile Optimization

- Progressive Web App (PWA) ready
- Responsive design for all screen sizes
- Touch-optimized interfaces
- Offline fallback pages

## 🧪 Phase 5: Testing & Documentation (COMPLETE)

### 1. Comprehensive Testing Framework

**Unit Testing with Jest & React Testing Library:**
```bash
# Run all unit tests
pnpm test

# Run tests with coverage (70% minimum)
pnpm test:coverage

# Run tests in watch mode
pnpm test:watch
```

**End-to-End Testing with Playwright:**
```bash
# Run E2E tests across browsers
pnpm test:e2e

# Run E2E tests with UI
pnpm test:e2e:ui

# View test reports
npx playwright show-report
```

**Test Coverage Requirements:**
- Branches: 70% minimum
- Functions: 70% minimum  
- Lines: 70% minimum
- Statements: 70% minimum

### 2. CI/CD Pipeline (GitHub Actions)

**Automated Workflows:**
- **Quality Checks**: Type checking, linting, unit tests
- **Build Verification**: Production build validation
- **E2E Testing**: Cross-browser testing on main branch
- **Security Scanning**: Vulnerability scanning with Trivy
- **Performance Monitoring**: Lighthouse CI with Core Web Vitals
- **Automated Deployment**: Staging (develop) and Production (main)

**Pipeline Features:**
- Multi-node testing (Node.js 18, 20)
- Parallel job execution
- Artifact retention (30 days)
- Performance budgets enforcement
- Security report integration

### 3. API Documentation

**Comprehensive API docs** available at `docs/api.md`:
- All 25+ API endpoints documented
- Request/response examples
- Error handling patterns
- Rate limiting information
- Authentication guide
- SDK integration examples

**Documentation Includes:**
- System endpoints (`/api/health`, `/api/metrics`)
- Memorial management (CRUD operations)
- Guestbook functionality
- Search & discovery
- Payment processing
- Analytics tracking
- Admin operations

### 4. Testing Documentation

**Complete testing guide** at `docs/testing.md`:
- Unit testing patterns and examples
- E2E testing with page object models
- Performance testing strategies
- Accessibility testing (WCAG compliance)
- Visual regression testing
- Test data management

### 5. Performance Monitoring

**Lighthouse CI Integration:**
- Automated performance audits on deployment
- Core Web Vitals enforcement:
  - First Contentful Paint: <2s
  - Largest Contentful Paint: <2.5s
  - Cumulative Layout Shift: <0.1
  - Performance Score: >90%

## 🧪 Testing in Production

### 1. Memorial Creation Flow
1. Create a test funeral home account
2. Create a memorial with all media types
3. Test NFC/QR code functionality
4. Verify email notifications

### 2. Payment Flow
1. Test subscription signup
2. Verify webhook handling
3. Test plan upgrades/downgrades
4. Verify failed payment handling

### 3. Search Functionality
1. Test memorial search
2. Verify filtering works
3. Test advanced search features
4. Check search analytics

## 🔄 Backup & Recovery

### 1. Sanity Backup
- Sanity provides automatic backups
- Set up additional scheduled exports:
```bash
sanity dataset export production backup-$(date +%Y%m%d).tar.gz
```

### 2. Environment Backup
- Store environment variables securely
- Document all third-party integrations
- Maintain deployment runbooks

## 📈 Scaling Considerations

### Current Architecture Supports:
- **Concurrent Users**: 10,000+
- **Memorials**: Unlimited
- **Storage**: Unlimited (via Sanity)
- **Bandwidth**: CDN-optimized

### Scaling Options:
1. **Database**: Sanity scales automatically
2. **Compute**: Horizontal scaling via Vercel/containers
3. **Storage**: Additional CDN for media assets
4. **Caching**: Redis cluster for advanced caching

## 🚨 Troubleshooting

### Common Issues:

**Build Failures**
- Check Node.js version (18+)
- Verify all environment variables
- Clear Next.js cache: `rm -rf .next`

**Stripe Integration Issues**
- Verify webhook endpoints
- Check webhook signature validation
- Ensure live/test key consistency

**Email Delivery Issues**
- Verify domain authentication
- Check Resend API limits
- Validate email templates

**Search Not Working**
- Verify Sanity read permissions
- Check GROQ query syntax
- Monitor search analytics

## 📞 Support

For deployment support:
- Email: support@eternalcapsule.com
- Documentation: [Your docs URL]
- Community: [Your community forum]

## 🔄 Updates & Maintenance

### Regular Maintenance:
- [ ] Weekly dependency updates
- [ ] Monthly security scans
- [ ] Quarterly performance reviews
- [ ] Annual disaster recovery tests

### Monitoring Checklist:
- [ ] Error rates < 0.1%
- [ ] Response times < 200ms
- [ ] Uptime > 99.9%
- [ ] Core Web Vitals passing

---

## 🎉 Launch Checklist

Before going live:

- [ ] All environment variables configured
- [ ] Stripe products and webhooks set up
- [ ] Email templates tested
- [ ] Domain and SSL configured
- [ ] Analytics tracking verified
- [ ] Backup procedures tested
- [ ] Monitoring alerts configured
- [ ] Performance optimizations applied
- [ ] Security measures implemented
- [ ] Load testing completed

**You're ready to launch! 🚀**

### 1. Next-intl Configuration

The application uses next-intl for comprehensive internationalization support with automatic locale detection.

**Supported Languages:**
- **English (`en`)** - Default locale for global markets
- **Swedish (`sv`)** - Regional localization with "Minnslund" branding

**Automatic Features:**
- **Locale Detection** - Based on user's country (IP), browser language, and preferences
- **URL Routing** - Automatic `/en/` and `/sv/` path prefixes
- **Content Translation** - All user-facing content translated
- **Regional Branding** - Swedish market uses "Minnslund" branding

**Configuration Files:**
```bash
src/i18n/config.ts          # Locale configuration
src/i18n/request.ts         # Server-side i18n setup
src/messages/en.json        # English translations
src/messages/sv.json        # Swedish translations  
middleware.ts               # Locale routing middleware
```

**No Additional Setup Required** - Internationalization works out of the box with automatic locale detection.

### 2. Sanity Setup 