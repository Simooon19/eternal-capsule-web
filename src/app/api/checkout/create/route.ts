import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/auth';
import { createCheckoutSession, createStripeCustomer, subscriptionPlans } from '@/lib/stripe';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

const bodySchema = z.object({
  planId: z.enum(['personal', 'minnesbricka', 'custom']),
  successUrl: z.string().url().optional(),
  cancelUrl: z.string().url().optional(),
});

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const session = await getServerSession(authOptions);

      if (!session?.user?.id) {
        return NextResponse.json(
          { error: 'You must be signed in to subscribe' },
          { status: 401 }
        );
      }

      const raw = await request.json();
      const parsed = bodySchema.safeParse(raw);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid payload', details: parsed.error.flatten() }, { status: 400 });
      }
      const { planId, successUrl, cancelUrl } = parsed.data;

      if (!planId || !subscriptionPlans[planId as keyof typeof subscriptionPlans]) {
        return NextResponse.json(
          { error: 'Invalid plan selected' },
          { status: 400 }
        );
      }

      // Personal plan has no checkout
      if (planId === 'personal') {
        return NextResponse.json({ message: 'Personal plan selected. No checkout required.' });
      }

      // Get user from database
      const user = await prisma.user.findUnique({
        where: { id: session.user.id }
      });

      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Create Stripe customer if they don't have one
      let stripeCustomerId = user.stripeCustomerId;
      
      if (!stripeCustomerId) {
        const stripeCustomer = await createStripeCustomer({
          name: user.name || '',
          email: user.email,
          phone: user.phone || undefined,
        });
        
        stripeCustomerId = stripeCustomer.id;
        
        // Update user with Stripe customer ID
        await prisma.user.update({
          where: { id: user.id },
          data: { stripeCustomerId }
        });
      }

      // Create checkout session
      const checkoutSession = await createCheckoutSession({
        customerId: stripeCustomerId,
        planId: planId as any,
        successUrl: successUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard?success=true`,
        cancelUrl: cancelUrl || `${process.env.NEXT_PUBLIC_SITE_URL}/pricing?canceled=true`,
        funeralHomeId: user.id, // Using user ID as funeral home ID for individual users
      });

      return NextResponse.json({
        sessionId: checkoutSession.id,
        url: checkoutSession.url
      });

    } catch (error) {
      console.error('Error creating checkout session:', error);
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      );
    }
  });
} 