import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"
import { subscriptionPlans } from "./stripe"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any, // Type compatibility fix for NextAuth v4
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
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: {
            email: credentials.email
          }
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          planId: user.planId,
          subscriptionStatus: user.subscriptionStatus,
        }
      }
    })
  ],
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.role = user.role
        token.planId = user.planId
        token.subscriptionStatus = user.subscriptionStatus
      }

      // If user updates their session, refresh the token
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
          token.role = updatedUser.role
          token.planId = updatedUser.planId
          token.subscriptionStatus = updatedUser.subscriptionStatus
          token.trialEndsAt = updatedUser.trialEndsAt
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.planId = token.planId as string
        session.user.subscriptionStatus = token.subscriptionStatus as string
        session.user.trialEndsAt = token.trialEndsAt as Date
      }
      return session
    },
    async signIn({ user, account, profile }) {
      // Start a trial for new OAuth users
      if (account?.type === "oauth" && user.email) {
        try {
          // Check if user already has a trial (regardless of when they signed up)
          const existingTrial = await prisma.trial.findUnique({
            where: { userId: user.id }
          })

          if (!existingTrial) {
            // Use database transaction to ensure consistency
            await prisma.$transaction(async (tx) => {
              const planId = 'minnesbricka'; // Default to minnesbricka for OAuth signups
              
              // Start 30-day trial for new users
              const trialEndsAt = new Date()
              trialEndsAt.setDate(trialEndsAt.getDate() + 30)

              // Use upsert to handle race conditions safely
              await tx.trial.upsert({
                where: { userId: user.id },
                create: {
                  userId: user.id,
                  planId,
                  endsAt: trialEndsAt,
                },
                update: {
                  // If somehow a trial was created between our check and now, don't overwrite it
                }
              })

              // Update user with trial information
              await tx.user.update({
                where: { id: user.id },
                data: {
                  trialEndsAt: trialEndsAt,
                  planId,
                  subscriptionStatus: 'trialing',
                }
              })
            })

            // Send welcome email for new OAuth trial users (outside transaction)
            try {
              const selectedPlan = subscriptionPlans['minnesbricka' as keyof typeof subscriptionPlans];
              const { sendEmail } = await import('./email');
              
              const trialEndsAt = new Date()
              trialEndsAt.setDate(trialEndsAt.getDate() + 30)
              
              await sendEmail({
                to: user.email,
                subject: 'Welcome to Eternal Capsule',
                template: 'welcome',
                data: {
                  userName: user.name || 'New User',
                  planName: selectedPlan.name,
                  isTrialing: true,
                  trialEndsAt: trialEndsAt.toLocaleDateString(),
                  dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
                  loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/signin`,
                },
              });
            } catch (emailError) {
              console.error('Failed to send OAuth welcome email:', emailError);
            }
          }
        } catch (error) {
          console.error('Error setting up OAuth user trial:', error);
          // Don't fail the sign-in process if trial setup fails
          // User can still sign in and we can set up trial later
        }
      }

      return true
    }
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
}

// Helper function to check if user has access to a feature
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
  const currentPlan = isTrialActive ? 'minnesbricka' : user.planId

  return featureAccess[feature].includes(currentPlan as any)
}

// Helper function to check subscription limits
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

  // Check if trial is still active
  const isTrialActive = user.trialEndsAt && new Date() < user.trialEndsAt
  const currentPlan = isTrialActive ? 'minnesbricka' : user.planId
  
  const plan = subscriptionPlans[currentPlan as keyof typeof subscriptionPlans]
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

// Feature access control
const featureAccess = {
  minnesbrickaTags: ['minnesbricka', 'custom'],
  customBranding: ['custom'],
  apiAccess: ['custom'],
  prioritySupport: ['minnesbricka', 'custom'],
  analytics: ['minnesbricka', 'custom'],
  whiteLabel: ['custom'],
} as const 