# 👑 Admin Dashboard Guide - Eternal Capsule

This guide covers the comprehensive admin dashboard features, analytics, and management capabilities for administrators and funeral home operators.

## 📋 Overview

The Eternal Capsule admin dashboard provides **four basic analytics modules**:
- **📊 Business Dashboard** - Basic revenue, subscriptions, and growth metrics
- **🔍 Analytics Dashboard** - Simple user behavior and engagement tracking  
- **⚡ Performance Dashboard** - Basic Core Web Vitals and system performance
- **🔎 Search Dashboard** - Basic search analytics and insights

**Access Levels:**
- **ADMIN** - Full access to all dashboards and system metrics
- **FUNERAL_HOME** - Access to business metrics and funeral-specific analytics
- **USER** - No admin access (redirected to user dashboard)

---

## 🚀 Accessing the Admin Dashboard

### **URL Access**
```
Direct Access: /admin
From Dashboard: Dashboard → Admin Panel (if authorized)
```

### **Permission Requirements**
```typescript
// Required roles for admin access
const adminRoles = ['ADMIN', 'FUNERAL_HOME']

// Plan-based feature access
const dashboardAccess = {
  business: ['funeral', 'enterprise', 'admin'],
  analytics: ['family', 'funeral', 'enterprise', 'admin'], 
  performance: ['funeral', 'enterprise', 'admin'],
  search: ['funeral', 'enterprise', 'admin']
}
```

---

## 📊 Business Dashboard

### **Revenue Analytics**
Basic financial metrics and subscription tracking.

#### **Key Metrics Displayed**
- **Total Revenue** - Monthly, quarterly, yearly breakdowns
- **Monthly Recurring Revenue (MRR)** - Trending over time
- **Average Revenue Per User (ARPU)** - By plan and overall
- **Revenue Growth Rate** - Month-over-month percentage change
- **Churn Rate** - Subscription cancellation metrics

#### **Subscription Management**
```typescript
// Real-time subscription breakdown
{
  total: 1250,           // Total active subscriptions
  active: 1100,          // Currently active
  churned: 45,           // Recently canceled
  newThisMonth: 78,      // New subscribers this month
  byPlan: {
    free: 800,           // Free plan users
    family: 200,         // Family plan subscribers
    funeral: 45,         // Funeral home accounts
    enterprise: 5        // Enterprise clients
  }
}
```

#### **Revenue Calculations**
```typescript
// Business metrics calculation example
const revenue = {
  total: 125000,         // Total revenue to date
  monthly: 15000,        // Current month revenue
  quarterly: 42000,      // Quarterly revenue
  yearly: 180000,        // Annual revenue
  growth: {
    monthly: 8.5,        // 8.5% month-over-month growth
    quarterly: 12.3,     // 12.3% quarter-over-quarter
    yearly: 45.7         // 45.7% year-over-year
  }
}
```

### **Funeral Home Analytics**
Specific metrics for funeral home operators.

- **Memorial Creation Rate** - Memorials created per month
- **Family Handoff Success** - Email delivery and engagement rates
- **CSV Import Usage** - Bulk upload success metrics
- **NFC Tag Distribution** - Physical tag generation and usage
- **Client Satisfaction** - Based on guestbook engagement

---

## 🔍 Analytics Dashboard

### **User Behavior Tracking**
Comprehensive user engagement and behavior analytics.

#### **Memorial Engagement**
- **Memorial Views** - Total and unique visitor counts
- **Guestbook Interactions** - Messages, reactions, media uploads
- **Search Behavior** - Query patterns and result click-through
- **Session Duration** - Average time spent on memorial pages
- **Return Visitor Rate** - User retention and engagement

#### **Geographic Distribution**
```typescript
// Geographic analytics example
const geoMetrics = {
  topCountries: [
    { country: 'United States', visitors: 8500, percentage: 68.2 },
    { country: 'Canada', visitors: 1200, percentage: 9.6 },
    { country: 'United Kingdom', visitors: 800, percentage: 6.4 }
  ],
  topStates: [
    { state: 'California', visitors: 2100, percentage: 24.7 },
    { state: 'Texas', visitors: 1800, percentage: 21.2 },
    { state: 'Florida', visitors: 1200, percentage: 14.1 }
  ]
}
```

#### **Device & Browser Analytics**
- **Device Types** - Mobile vs Desktop vs Tablet usage
- **Browser Distribution** - Chrome, Safari, Firefox, Edge analytics
- **Operating Systems** - iOS, Android, Windows, macOS breakdown
- **Screen Resolutions** - Responsive design optimization insights

### **Conversion Tracking**
Monitor user journey from visitor to subscriber.

```typescript
// Conversion funnel metrics
const conversionFunnel = {
  visitors: 12500,           // Total unique visitors
  signups: 625,              // User registrations (5% conversion)
  trialStarts: 425,          // Trial activations (68% of signups)
  paidConversions: 127,      // Trial to paid (30% conversion)
  totalConversionRate: 1.02  // Overall visitor to paid (1.02%)
}
```

---

## ⚡ Performance Dashboard

### **Core Web Vitals Monitoring**
Real-time performance metrics tracking.

#### **Performance Metrics**
- **First Contentful Paint (FCP)** - Target: <2.0s
- **Largest Contentful Paint (LCP)** - Target: <2.5s  
- **Cumulative Layout Shift (CLS)** - Target: <0.1
- **First Input Delay (FID)** - Target: <100ms
- **Time to Interactive (TTI)** - Target: <3.5s

#### **Performance Scoring**
```typescript
// Performance scoring system
const performanceScore = {
  overall: 92,              // Overall Lighthouse score
  performance: 89,          // Performance score
  accessibility: 95,        // Accessibility score
  bestPractices: 93,        // Best practices score
  seo: 97,                  // SEO score
  pwa: 87                   // PWA score
}
```

### **System Health Monitoring**
Server and database performance tracking.

#### **Resource Usage**
- **Memory Usage** - Current and historical usage patterns
- **CPU Usage** - Server load monitoring
- **Database Performance** - Query response times
- **Cache Hit Rates** - Redis and CDN performance
- **Error Rates** - 4xx and 5xx error tracking

#### **Real-time Metrics**
```typescript
// System health example
const systemHealth = {
  memory: {
    used: 256,              // MB used
    total: 512,             // MB total
    percentage: 50          // 50% utilization
  },
  uptime: 3600000,          // Milliseconds uptime
  responseTime: 125,        // Average response time (ms)
  errorRate: 0.02,          // 0.02% error rate
  activeConnections: 45     // Current database connections
}
```

---

## 🔎 Search Dashboard

### **Search Analytics**
Comprehensive search behavior and optimization insights.

#### **Search Metrics**
- **Total Searches** - Daily, weekly, monthly volumes
- **Popular Queries** - Most searched terms and phrases
- **Search Success Rate** - Queries returning relevant results
- **Zero-Result Searches** - Failed queries needing content
- **Search-to-Click Rate** - Result engagement metrics

#### **Query Analysis**
```typescript
// Search analytics example
const searchMetrics = {
  totalSearches: 8500,
  uniqueQueries: 3200,
  avgResultsPerSearch: 5.2,
  popularQueries: [
    { query: "john smith", count: 245, clickRate: 78.2 },
    { query: "memorial flowers", count: 189, clickRate: 65.1 },
    { query: "veteran", count: 167, clickRate: 82.6 }
  ],
  zeroResultQueries: [
    { query: "obituary template", count: 45 },
    { query: "memorial service music", count: 32 }
  ]
}
```

### **Search Optimization**
Tools and insights for improving search functionality.

- **Content Gaps** - Identify missing content based on failed searches
- **Tag Optimization** - Most effective memorial tags and categories
- **Autocomplete Performance** - Suggestion click-through rates
- **Filter Usage** - How users refine search results
- **Mobile Search Behavior** - Mobile-specific search patterns

---

## 🛠️ Administrative Tools

### **User Management**
Comprehensive user administration capabilities.

#### **User Operations**
- **View User Details** - Complete profile and subscription info
- **Change User Roles** - Promote to admin or funeral home status
- **Subscription Management** - View and modify plans
- **Trial Extensions** - Extend or convert trial periods
- **Account Suspension** - Temporary or permanent account actions

#### **Bulk Operations**
```typescript
// Bulk user management examples
const bulkOperations = {
  extendTrials: {
    users: ['user1', 'user2', 'user3'],
    extension: 7  // Additional days
  },
  upgradePlans: {
    fromPlan: 'free',
    toPlan: 'family',
    criteria: 'active_memorial_creator'
  },
  sendNotifications: {
    userSegment: 'trial_ending_soon',
    template: 'trial_reminder',
    scheduledFor: '2024-01-15T09:00:00Z'
  }
}
```

### **Memorial Management**
Administrative oversight of memorial content.

#### **Content Moderation**
- **Review Queue** - Pending memorial approvals
- **Content Reports** - User-reported inappropriate content
- **Bulk Approval** - Approve multiple memorials simultaneously
- **Content Guidelines** - Enforce community standards
- **Archive Management** - Handle archived or deleted memorials

#### **Memorial Analytics**
- **Most Viewed Memorials** - Popular content identification
- **Engagement Metrics** - Guestbook activity and sharing
- **Content Quality** - Photos, descriptions, and completeness
- **Family Interaction** - Owner engagement with their memorials

---

## 📈 Reporting & Exports

### **Business Reports**
Generate comprehensive business intelligence reports.

#### **Financial Reports**
- **Revenue Summary** - Monthly/quarterly financial performance
- **Subscription Analysis** - Plan distribution and trends
- **Churn Analysis** - Cancellation patterns and reasons
- **Forecasting** - Revenue projections and growth models

#### **Operational Reports**
- **User Activity** - Registration and engagement trends
- **Content Metrics** - Memorial creation and interaction rates
- **Support Tickets** - Customer service performance
- **System Performance** - Technical health and uptime

### **Data Export Capabilities**
```typescript
// Export functionality
const exportOptions = {
  formats: ['CSV', 'Excel', 'PDF', 'JSON'],
  dataTypes: [
    'user_analytics',
    'memorial_metrics', 
    'financial_reports',
    'performance_data',
    'search_analytics'
  ],
  scheduling: {
    frequency: ['daily', 'weekly', 'monthly'],
    delivery: ['email', 'download', 'api']
  }
}
```

---

## 🚨 Alerts & Notifications

### **System Monitoring Alerts**
Proactive monitoring and alerting system.

#### **Alert Categories**
- **Performance Alerts** - Slow response times or high error rates
- **Business Alerts** - Significant changes in key metrics
- **Security Alerts** - Suspicious activity or failed authentication
- **Capacity Alerts** - Resource usage approaching limits
- **Feature Alerts** - New feature adoption and usage patterns

#### **Alert Configuration**
```typescript
// Alert thresholds and settings
const alertConfig = {
  performance: {
    responseTime: { threshold: 2000, severity: 'warning' },
    errorRate: { threshold: 5, severity: 'critical' },
    uptime: { threshold: 99.5, severity: 'critical' }
  },
  business: {
    churnRate: { threshold: 10, severity: 'warning' },
    revenueGrowth: { threshold: -5, severity: 'critical' },
    trialConversion: { threshold: 20, severity: 'warning' }
  }
}
```

---

## 🔐 Access Control & Security

### **Role-Based Permissions**
Granular access control for different admin functions.

#### **Permission Matrix**
| Feature | ADMIN | FUNERAL_HOME | USER |
|---------|-------|--------------|------|
| Business Dashboard | ✅ Full | ✅ Limited | ❌ None |
| User Management | ✅ Full | ❌ None | ❌ None |
| System Settings | ✅ Full | ❌ None | ❌ None |
| Analytics | ✅ Full | ✅ Own Data | ❌ None |
| Performance Metrics | ✅ Full | ✅ Limited | ❌ None |
| Bulk Operations | ✅ Full | ✅ Own Users | ❌ None |

### **Audit Logging**
Comprehensive tracking of administrative actions.

```typescript
// Audit log example
const auditLog = {
  timestamp: '2024-01-15T14:30:00Z',
  userId: 'admin_user_123',
  action: 'user_role_change',
  target: 'user_456',
  changes: {
    before: { role: 'USER', planId: 'free' },
    after: { role: 'FUNERAL_HOME', planId: 'funeral' }
  },
  ipAddress: '192.168.1.100',
  userAgent: 'Mozilla/5.0...'
}
```

---

## 📚 Best Practices

### **Dashboard Usage Guidelines**
1. **Regular Monitoring** - Check key metrics daily
2. **Trend Analysis** - Focus on weekly and monthly trends
3. **Alert Response** - Respond to system alerts promptly
4. **Data Privacy** - Follow GDPR and privacy guidelines
5. **Performance Optimization** - Use insights to improve user experience

### **Security Practices**
- **Two-Factor Authentication** - Enable for all admin accounts
- **Session Management** - Regular session timeouts and monitoring
- **Access Reviews** - Quarterly review of admin permissions
- **Audit Trail** - Maintain comprehensive action logs
- **Incident Response** - Document and respond to security events

---

## 🚨 Troubleshooting

### **Common Issues**

#### "Dashboard not loading"
- Check user role and permissions
- Verify session is still valid
- Clear browser cache and cookies
- Check for JavaScript errors in console

#### "Metrics showing as zero"
- Verify database connectivity
- Check data aggregation scripts
- Ensure proper date range selection
- Validate API endpoint responses

#### "Performance data missing"
- Confirm Core Web Vitals tracking is enabled
- Check Google Analytics integration
- Verify performance monitoring scripts
- Review data collection permissions

### **Data Accuracy Verification**
```typescript
// Verify metrics accuracy
const dataValidation = {
  crossReference: 'Compare with Stripe dashboard',
  sampleChecks: 'Manually verify random data points',
  timeZoneConsistency: 'Ensure UTC consistency across metrics',
  cacheRefresh: 'Clear cache if data seems stale'
}
```

---

## 📞 Support & Training

### **Admin Training**
- **Onboarding Session** - Complete dashboard walkthrough
- **Best Practices Guide** - Optimal usage patterns
- **Advanced Features** - Power user capabilities
- **Troubleshooting** - Common issue resolution

### **Support Channels**
- **Admin Help Desk** - Priority support for admin users
- **Documentation** - Comprehensive feature documentation
- **Video Tutorials** - Visual guides for complex features
- **Office Hours** - Weekly Q&A sessions with development team

---

*The admin dashboard is continuously updated with new features and improvements. Check back regularly for the latest capabilities and best practices.* 