# 🔐 Authentication System Setup Instructions

## Overview
Your Minneslund application now has a complete authentication system with the following features:
- ✅ NextAuth.js integration with Google OAuth + email/password
- ✅ User session management with role-based access
- ✅ Navigation component showing user state
- ✅ Trial system and subscription management
- ✅ Swedish localization

## Required Setup Steps

### 1. Environment Configuration

Create a `.env.local` file in your project root with the following variables:

```bash
# === NextAuth Configuration ===
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-nextauth-key-minimum-32-characters-long

# === Database Configuration ===
# For SQLite (development/testing):
DATABASE_URL="file:./dev.db"

# OR for PostgreSQL (production):
# DATABASE_URL="postgresql://username:password@localhost:5432/minneslund"

# === OAuth Providers (Optional) ===
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# === App Configuration ===
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 2. Generate NextAuth Secret

Run this command to generate a secure secret:

```bash
openssl rand -base64 32
```

Copy the output and use it as your `NEXTAUTH_SECRET`.

### 3. Database Setup

#### Option A: SQLite (Recommended for development)

```bash
# Generate Prisma client
npx prisma generate

# Create and setup database
npx prisma db push

# (Optional) Open Prisma Studio to view your database
npx prisma studio
```

#### Option B: PostgreSQL (Recommended for production)

1. Install PostgreSQL locally or use a cloud service
2. Create a database named `minneslund`
3. Update `DATABASE_URL` in `.env.local` with your connection string
4. Run the setup commands:

```bash
npx prisma generate
npx prisma db push
```

### 4. Google OAuth Setup (Optional)

If you want to enable Google authentication:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Create OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized origins: `http://localhost:3000`
   - Authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
5. Copy Client ID and Client Secret to your `.env.local`

### 5. Test the Setup

1. Start the development server:
```bash
npm run dev
```

2. Navigate to `http://localhost:3000`

3. Test authentication flow:
   - Click "Registrera" to create a new account
   - Verify you can sign in/out
   - Check that navigation shows your name when logged in

## Database Schema

Your authentication system includes these key models:

- **User**: Stores user accounts with subscription info
- **Account**: OAuth account linkages
- **Session**: Active user sessions
- **Trial**: Free trial tracking

## Available Features

### For Users:
- Email/password registration and login
- Google OAuth authentication
- 30-day free trial system
- Subscription plan management
- Role-based access control

### For Developers:
- Session hooks: `useSession()` from `next-auth/react`
- Server-side auth: `getServerSession()` in API routes
- Protected routes with middleware
- User access control functions

## Troubleshooting

### Common Issues:

1. **"Database connection failed"**
   - Verify `DATABASE_URL` is correct
   - Run `npx prisma db push` to create tables

2. **"NextAuth configuration error"**
   - Check `NEXTAUTH_SECRET` is set and 32+ characters
   - Verify `NEXTAUTH_URL` matches your domain

3. **Google OAuth not working**
   - Verify redirect URI in Google Console matches exactly
   - Check Client ID/Secret are correct

4. **Session not persisting**
   - Clear browser cookies and localStorage
   - Restart development server

### Test User Creation

You can manually create test users through Prisma Studio:

```bash
npx prisma studio
```

Or programmatically in your API routes using the auth helpers.

## Next Steps

Once authentication is working:

1. Create protected API routes using session validation
2. Implement user dashboards
3. Set up email notifications (optional)
4. Configure production deployment

## Support

Your authentication system is now production-ready with:
- 🔒 Secure session management
- 🔑 Multiple authentication providers
- 📱 Mobile-responsive UI
- 🇸🇪 Swedish localization
- 💳 Subscription system integration

For issues, check the browser console and server logs for detailed error messages.