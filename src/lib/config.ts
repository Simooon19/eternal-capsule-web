// Environment configuration
const config = {
  // App settings
  app: {
    name: 'Eternal Capsule',
    description: 'Digital memorial platform',
    url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
    environment: process.env.NODE_ENV || 'development',
  },

  // Sanity CMS
  sanity: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'sample-project',
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
    token: process.env.SANITY_API_TOKEN,
    useCdn: process.env.NODE_ENV === 'production',
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || '/studio',
  },

  // API settings
  api: {
    baseUrl: process.env.NEXT_PUBLIC_API_URL || '/api',
    timeout: parseInt(process.env.API_TIMEOUT || '30000'),
    retryAttempts: parseInt(process.env.API_RETRY_ATTEMPTS || '3'),
  },

  // Features
  features: {
    guestbook: {
      enabled: process.env.NEXT_PUBLIC_GUESTBOOK_ENABLED !== 'false',
      requireApproval: process.env.GUESTBOOK_REQUIRE_APPROVAL !== 'false',
      maxMessageLength: parseInt(process.env.GUESTBOOK_MAX_MESSAGE_LENGTH || '500'),
      profanityFilter: process.env.GUESTBOOK_PROFANITY_FILTER !== 'false',
    },
    analytics: {
      enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
      provider: process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER || 'none',
    },
    minnesbricka: {
      enabled: process.env.NEXT_PUBLIC_NFC_ENABLED === 'true',
    },
    maps: {
      enabled: process.env.NEXT_PUBLIC_MAPS_ENABLED !== 'false',
      defaultZoom: parseInt(process.env.NEXT_PUBLIC_MAPS_DEFAULT_ZOOM || '10'),
    },
  },

  // Rate limiting
  rateLimit: {
    guestbookEntries: {
      windowMs: parseInt(process.env.RATE_LIMIT_GUESTBOOK_WINDOW || '900000'), // 15 minutes
      max: parseInt(process.env.RATE_LIMIT_GUESTBOOK_MAX || '5'), // 5 entries per window
    },
    memorial: {
      windowMs: parseInt(process.env.RATE_LIMIT_MEMORIAL_WINDOW || '3600000'), // 1 hour
      max: parseInt(process.env.RATE_LIMIT_MEMORIAL_MAX || '3'), // 3 memorials per hour
    },
  },

  // Email settings (for notifications)
  email: {
    enabled: process.env.EMAIL_ENABLED === 'true',
    provider: process.env.EMAIL_PROVIDER || 'none',
    from: process.env.EMAIL_FROM || 'noreply@eternalcapsule.com',
    adminEmail: process.env.ADMIN_EMAIL,
  },

  // File upload settings
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    allowedImageTypes: (process.env.ALLOWED_IMAGE_TYPES || 'jpg,jpeg,png,webp').split(','),
    allowedVideoTypes: (process.env.ALLOWED_VIDEO_TYPES || 'mp4,mov,avi').split(','),
    allowedAudioTypes: (process.env.ALLOWED_AUDIO_TYPES || 'mp3,wav,m4a').split(','),
  },

  // Security
  security: {
    bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || '12'),
    jwtSecret: process.env.JWT_SECRET,
    sessionTimeout: parseInt(process.env.SESSION_TIMEOUT || '86400000'), // 24 hours
  },
}

// Validation - only throw in production or when actually needed
const requiredEnvVarsForProduction = [
  'NEXT_PUBLIC_SANITY_PROJECT_ID',
]

// Only validate in production or when not using sample data
if (config.app.environment === 'production' && config.sanity.projectId !== 'sample-project') {
  const missingEnvVars = requiredEnvVarsForProduction.filter(
    (envVar) => !process.env[envVar]
  )

  if (missingEnvVars.length > 0) {
    console.warn(
      `Missing environment variables for production: ${missingEnvVars.join(', ')}`
    )
  }
}

export default config

// Type-safe environment helpers
export const isDevelopment = config.app.environment === 'development'
export const isProduction = config.app.environment === 'production'
export const isClient = typeof window !== 'undefined'
export const isServer = !isClient

// Feature flags
export const features = config.features 