import NextAuth from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
      role: string
      planId: string
      subscriptionStatus?: string | null
      trialEndsAt?: Date | null
    }
  }

  interface User {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: string
    planId: string
    subscriptionStatus?: string | null
    trialEndsAt?: Date | null
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    planId: string
    subscriptionStatus?: string | null
    trialEndsAt?: Date | null
  }
} 