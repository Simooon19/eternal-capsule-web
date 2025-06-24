# 🗄️ Database Guide - Eternal Capsule

This guide covers the database architecture, setup, and management for the Eternal Capsule platform.

## 📋 Overview

Eternal Capsule uses a **dual-database architecture**:
- **PostgreSQL** (via Prisma) - User authentication, subscriptions, business logic
- **Sanity CMS** - Memorial content, media storage, public content

This separation provides optimal performance, scalability, and content management capabilities.

---

## 🏗️ Database Architecture

### **Core Models Overview**

```mermaid
erDiagram
    User ||--o{ Account : has
    User ||--o{ Session : has
    User ||--o{ Memorial : creates
    User ||--o{ ContactSubmission : submits
    User ||--o{ Trial : has
    User {
        string id PK
        string email UK
        string planId
        string subscriptionStatus
        datetime trialEndsAt
        enum role
    }
    
    Memorial ||--|| User : belongs_to
    Memorial {
        string id PK
        string title
        string slug UK
        string userId FK
        string sanityId
        string status
    }
    
    Trial ||--|| User : belongs_to
    Trial {
        string id PK
        string userId FK
        string planId
        datetime endsAt
        string status
    }
```

### **Model Relationships**

| Model | Purpose | Key Relationships |
|-------|---------|-------------------|
| **User** | Core user account and subscription info | → Account, Session, Memorial, Trial |
| **Memorial** | Memorial metadata and Sanity references | → User (creator) |
| **Trial** | Free trial tracking and management | → User (one-to-one) |
| **ContactSubmission** | Lead capture and sales pipeline | → User (optional) |
| **SubscriptionEvent** | Stripe webhook event tracking | → User (via userId) |

---

## 🚀 Database Setup

### **Prerequisites**
- PostgreSQL 12+ running locally or hosted
- Node.js 18+ with pnpm
- Environment variables configured

### **Step 1: Install Dependencies**
```bash
# Install Prisma CLI globally (optional)
npm install -g prisma

# Install project dependencies
pnpm install
```

### **Step 2: Configure Database URL**
```bash
# Add to .env.local
DATABASE_URL="postgresql://username:password@localhost:5432/eternal_capsule"

# For development with local PostgreSQL
DATABASE_URL="postgresql://postgres:password@localhost:5432/eternal_capsule_dev"

# For production (example with Supabase)
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
```

### **Step 3: Generate Prisma Client**
```bash
# Generate the Prisma client
npx prisma generate

# Verify generation completed
ls node_modules/@prisma/client
```

### **Step 4: Database Migration**
```bash
# Push schema to database (development)
npx prisma db push

# Or run migrations (production)
npx prisma migrate deploy

# Verify tables were created
npx prisma studio
```

### **Step 5: Seed Initial Data (Optional)**
```bash
# Create admin user (if seeding script exists)
npx prisma db seed

# Or manually via Prisma Studio
npx prisma studio
```

---

## 📊 Schema Details

### **User Model**
Central user account with subscription and authentication data.

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  
  // Subscription information
  stripeCustomerId    String?
  subscriptionId      String?
  subscriptionStatus  String?
  planId              String    @default("free")
  trialEndsAt         DateTime?
  subscriptionEndsAt  DateTime?
  
  // Profile information
  organization        String?
  phone              String?
  
  // Timestamps
  createdAt          DateTime @default(now())
  updatedAt          DateTime @updatedAt
  
  // Relations
  accounts           Account[]
  sessions           Session[]
  contactSubmissions ContactSubmission[]
  memorials          Memorial[]
}
```

**Key Fields:**
- `planId`: Subscription plan (free, family, funeral, enterprise)
- `subscriptionStatus`: Current status (active, trialing, past_due, canceled)
- `trialEndsAt`: When free trial expires
- `role`: User permission level (USER, ADMIN, FUNERAL_HOME)

### **Memorial Model**
Lightweight memorial tracking with Sanity CMS references.

```prisma
model Memorial {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  userId      String
  sanityId    String?  // Reference to Sanity memorial
  status      String   @default("active") // active, archived, deleted
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@index([userId])
  @@index([status])
}
```

**Purpose:**
- Track memorial count for subscription limits
- Link PostgreSQL users to Sanity memorial content
- Enable fast queries for user dashboard

### **Trial Model**
Free trial management and conversion tracking.

```prisma
model Trial {
  id        String   @id @default(cuid())
  userId    String   @unique
  planId    String
  startedAt DateTime @default(now())
  endsAt    DateTime
  status    String   @default("active") // active, expired, converted, cancelled
  
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  @@index([endsAt])
  @@index([status])
}
```

**Business Logic:**
- New users get 30-day family plan trial
- Trial status tracked for feature access
- Conversion metrics for business analytics

---

## 🔧 Database Operations

### **Common Queries**

#### Check User Subscription Status
```typescript
const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    planId: true,
    subscriptionStatus: true,
    trialEndsAt: true,
    subscriptionEndsAt: true,
  }
})

// Check if trial is active
const isTrialActive = user.trialEndsAt && new Date() < user.trialEndsAt
const effectivePlan = isTrialActive ? 'family' : user.planId
```

#### Count User Memorials
```typescript
const memorialCount = await prisma.memorial.count({
  where: {
    userId: userId,
    status: 'active'
  }
})
```

#### Get User with Relations
```typescript
const userWithMemorials = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    memorials: {
      where: { status: 'active' },
      orderBy: { createdAt: 'desc' }
    },
    _count: {
      select: { memorials: true }
    }
  }
})
```

### **Database Maintenance**

#### Backup Database
```bash
# Create database backup
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Compressed backup
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

#### Restore Database
```bash
# Restore from backup
psql $DATABASE_URL < backup_20240101_120000.sql

# From compressed backup
gunzip -c backup_20240101_120000.sql.gz | psql $DATABASE_URL
```

#### Clean Up Old Records
```sql
-- Remove expired sessions (older than 30 days)
DELETE FROM "Session" WHERE expires < NOW() - INTERVAL '30 days';

-- Archive old contact submissions (older than 1 year)
UPDATE "ContactSubmission" 
SET status = 'archived' 
WHERE "createdAt" < NOW() - INTERVAL '1 year';
```

---

## 🔍 Monitoring & Analytics

### **Database Health Checks**

```typescript
// Check database connectivity
async function checkDatabaseHealth() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return { status: 'healthy', responseTime: Date.now() - start };
  } catch (error) {
    return { status: 'unhealthy', error: error.message };
  }
}
```

### **Performance Monitoring**

```typescript
// Monitor slow queries
const slowQueries = await prisma.$queryRaw`
  SELECT query, mean_exec_time, calls
  FROM pg_stat_statements 
  WHERE mean_exec_time > 1000 
  ORDER BY mean_exec_time DESC 
  LIMIT 10;
`;
```

### **Business Metrics Queries**

```typescript
// Subscription analytics
const subscriptionMetrics = await prisma.user.groupBy({
  by: ['planId'],
  _count: { planId: true },
  where: {
    subscriptionStatus: 'active'
  }
});

// Trial conversion rates
const trialMetrics = await prisma.trial.groupBy({
  by: ['status'],
  _count: { status: true },
  where: {
    createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
  }
});
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### "Prisma Client not generated"
```bash
# Regenerate Prisma client
npx prisma generate

# Clear node_modules and reinstall
rm -rf node_modules
pnpm install
npx prisma generate
```

#### "Database connection failed"
```bash
# Test database connectivity
npx prisma db execute --preview-feature --stdin < /dev/null

# Check connection string
echo $DATABASE_URL

# Verify PostgreSQL is running
pg_isready -h localhost -p 5432
```

#### "Migration failed"
```bash
# Reset database (development only)
npx prisma migrate reset

# Force push schema changes
npx prisma db push --force-reset

# Check migration status
npx prisma migrate status
```

#### "Out of sync schema"
```bash
# Generate new migration from schema changes
npx prisma migrate dev --name describe_changes

# Apply pending migrations
npx prisma migrate deploy

# Manually sync in development
npx prisma db push
```

---

## 🔒 Security Considerations

### **Database Security**
- Use environment variables for connection strings
- Enable SSL connections in production
- Regularly update PostgreSQL versions
- Implement connection pooling for scalability

### **Access Control**
- Use least-privilege database users
- Enable audit logging for sensitive operations
- Regular security updates for Prisma client
- Monitor for unusual query patterns

### **Data Protection**
- Hash passwords using bcrypt (12+ rounds)
- Never store plain text passwords
- Encrypt sensitive PII at application level
- Regular automated backups with encryption

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [NextAuth.js Prisma Adapter](https://next-auth.js.org/adapters/prisma)
- [Database Scaling Guide](./scaling.md)

---

*This documentation is maintained alongside schema changes. Report issues or suggestions to the development team.* 