# 🔐 Authentication Guide - Eternal Capsule

This guide covers the authentication system, user management, and access control for the Eternal Capsule platform.

## 📋 Overview

Eternal Capsule uses **NextAuth.js v4** with a hybrid authentication approach:
- **Credentials Provider** - Email/password authentication with bcrypt hashing
- **Google OAuth Provider** - Social login with automatic trial setup
- **Prisma Adapter** - Database session management with PostgreSQL
- **JWT Strategy** - Stateless session tokens with custom callbacks

## 🌍 Localized Authentication Pages

### Multi-Language Auth Support
Authentication pages are fully localized and available in multiple languages:

**English Authentication URLs:**
- `/en/auth/signin` - English sign-in page
- `/en/auth/signup` - English registration page

**Swedish Authentication URLs:**
- `/sv/auth/signin` - Swedish sign-in page (Minnslund branding)
- `/sv/auth/signup` - Swedish registration page (Minnslund branding)

### Automatic Locale Detection
Users are automatically redirected to the appropriate language version based on:
1. **Geographic location** (IP-based detection)
2. **Browser language preference**
3. **Previously saved language preference**

### Authentication Flow Localization
```typescript
// Custom pages configuration supports localized auth flows
pages: {
  signIn: '/auth/signin',    // Automatically resolves to /[locale]/auth/signin
  error: '/auth/error',      // Automatically resolves to /[locale]/auth/error
}
```

**Authentication Experience:**
- **Sign-in forms** display in the user's preferred language
- **Error messages** are localized
- **Success redirects** maintain the user's language preference
- **Email notifications** are sent in the user's detected language

### Implementation Notes
```typescript
// NextAuth.js configuration automatically works with next-intl
export const authOptions: NextAuthOptions = {
  // ... existing configuration
  pages: {
    signIn: '/auth/signin',  // Routes through locale middleware
    error: '/auth/error',    // Automatically localized
  },
}
```

The middleware handles locale routing automatically, so authentication flows work seamlessly in both languages without additional configuration.

---

## 🏗️ Authentication Architecture

### **Authentication Flow**

```mermaid
flowchart TD
    A[User Login Request] --> B{Login Method?}
    B -->|Credentials| C[Email/Password Validation]
    B -->|OAuth| D[Google OAuth Flow]
    
    C --> E[Bcrypt Password Check]
    E -->|Valid| F[Create JWT Token]
    E -->|Invalid| G[Authentication Failed]
    
    D --> H[OAuth Validation]
    H -->|Valid| I[Check Existing User]
    H -->|Invalid| G
    
    I -->|New User| J[Create User + Trial]
    I -->|Existing| K[Update Session]
    
    J --> L[Send Welcome Email]
    K --> F
    F --> M[Set Session Cookie]
    L --> F
    
    M --> N[Redirect to Dashboard]
    G --> O[Redirect to Login]
```

### **Role-Based Access Control**

| Role | Permissions | Plan Access | Features |
|------|-------------|-------------|----------|
| **USER** | Create memorials, view own content | All plans | Basic memorial features |
| **FUNERAL_HOME** | Bulk creation, admin features | Funeral/Enterprise | CSV import, analytics |
| **ADMIN** | Full system access | All plans | Admin dashboard, metrics |

---

## 🚀 Setup & Configuration

### **Environment Variables**
```bash
# NextAuth.js Core
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters

# Google OAuth (Optional)
GOOGLE_CLIENT_ID=your-google-client-id.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Database (Required for Prisma Adapter)
DATABASE_URL=postgresql://username:password@localhost:5432/eternal_capsule
```

### **Google OAuth Setup**

#### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new project or select existing
3. Enable Google+ API
4. Navigate to "Credentials" → "Create Credentials" → "OAuth 2.0 Client ID"

#### Step 2: Configure OAuth Consent Screen
```
Application Name: Eternal Capsule
User Support Email: support@yourdomain.com
Developer Contact: dev@yourdomain.com
Authorized Domains: yourdomain.com
```

#### Step 3: Set Authorized URLs
```
Authorized JavaScript Origins:
- http://localhost:3000 (development)
- https://yourdomain.com (production)

Authorized Redirect URIs:
- http://localhost:3000/api/auth/callback/google (development)
- https://yourdomain.com/api/auth/callback/google (production)
```

---

## 🔧 NextAuth.js Configuration

### **Core Configuration (`src/lib/auth.ts`)**

```typescript
export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        // Password validation logic
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })
        
        if (!user || !user.password) return null
        
        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )
        
        return isPasswordValid ? {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planId: user.planId,
          subscriptionStatus: user.subscriptionStatus,
        } : null
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    // JWT and session callbacks
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}
```

### **Custom Callbacks**

#### JWT Callback
```typescript
async jwt({ token, user, trigger, session }) {
  // Add custom fields to JWT token
  if (user) {
    token.role = user.role
    token.planId = user.planId
    token.subscriptionStatus = user.subscriptionStatus
  }

  // Refresh token on session update
  if (trigger === "update" && session) {
    const updatedUser = await prisma.user.findUnique({
      where: { id: token.sub },
      select: {
        role: true,
        planId: true,
        subscriptionStatus: true,
        trialEndsAt: true,
      }
    })
    
    if (updatedUser) {
      Object.assign(token, updatedUser)
    }
  }

  return token
}
```

#### Session Callback
```typescript
async session({ session, token }) {
  // Add custom fields to session object
  if (token) {
    session.user.id = token.sub!
    session.user.role = token.role as string
    session.user.planId = token.planId as string
    session.user.subscriptionStatus = token.subscriptionStatus as string
    session.user.trialEndsAt = token.trialEndsAt as Date
  }
  return session
}
```

#### SignIn Callback (Trial Setup)
```typescript
async signIn({ user, account, profile }) {
  // Auto-create trial for new OAuth users
  if (account?.type === "oauth" && user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email }
    })

    if (!existingUser) {
      const planId = 'family'
      const trialEndsAt = new Date()
      trialEndsAt.setDate(trialEndsAt.getDate() + 30)

      // Create trial record
      await prisma.trial.create({
        data: {
          userId: user.id,
          planId,
          endsAt: trialEndsAt,
        }
      })

      // Update user with trial info
      await prisma.user.update({
        where: { id: user.id },
        data: {
          trialEndsAt,
          planId,
          subscriptionStatus: 'trialing',
        }
      })

      // Send welcome email
      const { sendEmail } = await import('./email')
      await sendEmail({
        to: user.email,
        subject: 'Welcome to Eternal Capsule',
        template: 'welcome',
        data: {
          userName: user.name || 'New User',
          planName: 'Family',
          isTrialing: true,
          trialEndsAt: trialEndsAt.toLocaleDateString(),
          dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard`,
          loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/signin`,
        },
      })
    }
  }

  return true
}
```

---

## 🛡️ Access Control System

### **Permission Helper Functions**

#### Check Feature Access
```typescript
export async function checkUserAccess(userId: string, feature: keyof typeof featureAccess) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      planId: true,
      trialEndsAt: true,
      subscriptionStatus: true,
    }
  })

  if (!user) return false

  // Check if trial is still active
  const isTrialActive = user.trialEndsAt && new Date() < user.trialEndsAt
  const currentPlan = isTrialActive ? 'family' : user.planId

  return featureAccess[feature].includes(currentPlan as any)
}
```

#### Check Subscription Limits
```typescript
export async function checkSubscriptionLimits(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      memorials: {
        where: { status: 'active' }
      }
    }
  })

  if (!user) return { canCreate: false, currentCount: 0, maxAllowed: 0 }

  const isTrialActive = user.trialEndsAt && new Date() < user.trialEndsAt
  const currentPlan = isTrialActive ? 'family' : user.planId
  
  const plan = subscriptionPlans[currentPlan]
  const currentCount = user.memorials.length
  const maxAllowed = plan.maxMemorials === -1 ? Infinity : plan.maxMemorials
  
  return {
    canCreate: currentCount < maxAllowed,
    currentCount,
    maxAllowed: plan.maxMemorials,
    planName: plan.name,
    isTrialActive
  }
}
```

### **Feature Access Matrix**
```typescript
const featureAccess = {
  nfcTags: ['family', 'funeral', 'enterprise'],
  customBranding: ['funeral', 'enterprise'],
  apiAccess: ['funeral', 'enterprise'],
  prioritySupport: ['family', 'funeral', 'enterprise'],
  analytics: ['family', 'funeral', 'enterprise'],
  whiteLabel: ['enterprise'],
} as const
```

---

## 💻 Client-Side Usage

### **Protecting Pages**
```typescript
// pages/dashboard.tsx
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/router'
import { useEffect } from 'react'

export default function Dashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return // Still loading
    if (!session) router.push('/auth/signin') // Not signed in
  }, [session, status, router])

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (!session) {
    return <div>Access Denied</div>
  }

  return (
    <div>
      <h1>Welcome {session.user.name}</h1>
      <p>Plan: {session.user.planId}</p>
      <p>Role: {session.user.role}</p>
    </div>
  )
}
```

### **Protecting API Routes**
```typescript
// pages/api/protected.ts
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export default async function handler(req, res) {
  const session = await getServerSession(req, res, authOptions)

  if (!session) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  // Check role-based access
  if (session.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Access denied' })
  }

  // Your protected logic here
  res.json({ message: 'Success', user: session.user })
}
```

### **Conditional Rendering**
```typescript
// components/AdminPanel.tsx
import { useSession } from 'next-auth/react'

export function AdminPanel() {
  const { data: session } = useSession()
  
  if (!session) return null
  
  // Show admin features only for admin users
  if (session.user.role !== 'ADMIN') {
    return <div>Access denied: Admin privileges required</div>
  }
  
  return (
    <div>
      <h2>Admin Panel</h2>
      {/* Admin features */}
    </div>
  )
}
```

---

## 🔐 Security Best Practices

### **Password Security**
```typescript
import bcrypt from 'bcryptjs'

// Hash password before storing
const hashPassword = async (password: string) => {
  const saltRounds = 12 // High security for production
  return await bcrypt.hash(password, saltRounds)
}

// Verify password during login
const verifyPassword = async (password: string, hashedPassword: string) => {
  return await bcrypt.compare(password, hashedPassword)
}
```

### **Session Security**
- **JWT Secret**: Use 32+ character random string
- **HTTPS Only**: Enable secure cookies in production
- **SameSite**: Set to 'lax' or 'strict' for CSRF protection
- **Session Timeout**: Configure appropriate session duration

### **Environment Security**
```bash
# Production security checklist
NEXTAUTH_URL=https://yourdomain.com  # HTTPS required
NEXTAUTH_SECRET=generated-by-openssl-rand-base64-32
NODE_ENV=production
```

---

## 🚨 Troubleshooting

### **Common Issues**

#### "NextAuth configuration error"
```bash
# Check environment variables
echo $NEXTAUTH_URL
echo $NEXTAUTH_SECRET

# Verify database connection
npx prisma studio
```

#### "OAuth callback error"
- Verify authorized redirect URIs in Google Console
- Check domain configuration
- Ensure HTTPS in production

#### "Session not persisting"
- Check NEXTAUTH_SECRET is set
- Verify database adapter configuration
- Check browser cookie settings

#### "Role/plan not updating"
- Call `update()` from `useSession` after changes
- Verify JWT callback is refreshing token
- Check database user record

### **Debug Mode**
```bash
# Enable NextAuth.js debug logging
DEBUG=nextauth* npm run dev

# Check session data
console.log(session)
```

---

## 📊 Authentication Analytics

### **User Metrics**
```typescript
// Track authentication events
const authMetrics = await prisma.user.groupBy({
  by: ['role'],
  _count: { role: true },
  where: {
    createdAt: { gte: startDate }
  }
})

// OAuth vs Credentials breakdown
const authMethods = await prisma.account.groupBy({
  by: ['provider'],
  _count: { provider: true }
})
```

### **Trial Conversion Tracking**
```typescript
// Monitor trial-to-paid conversion
const trialConversions = await prisma.trial.findMany({
  where: {
    status: 'converted',
    createdAt: { gte: lastMonth }
  },
  include: {
    user: {
      select: { subscriptionStatus: true, planId: true }
    }
  }
})
```

---

## 📚 Additional Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Prisma Adapter Guide](https://next-auth.js.org/adapters/prisma)
- [Google OAuth Setup](https://developers.google.com/identity/oauth2/web/guides/overview)
- [JWT Security Best Practices](https://auth0.com/blog/a-look-at-the-latest-draft-for-jwt-bcp/)

---

*This authentication system is designed for scalability and security. Report any security concerns immediately to the development team.* 