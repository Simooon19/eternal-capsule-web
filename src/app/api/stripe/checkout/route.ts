import { NextRequest, NextResponse } from 'next/server';
import { createCheckoutSession, subscriptionPlans, type PlanId } from '@/lib/stripe';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { client } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { funeralHomeId, planId } = await request.json();

      if (!funeralHomeId || !planId) {
        return NextResponse.json(
          { error: 'Missing funeral home ID or plan ID' },
          { status: 400 }
        );
      }

      if (!subscriptionPlans[planId as PlanId]) {
        return NextResponse.json(
          { error: 'Invalid plan ID' },
          { status: 400 }
        );
      }

      // Get funeral home details
      const funeralHome = await client.fetch(
        `*[_type == "funeralHome" && _id == $id][0]{
          _id,
          name,
          contact.email,
          contact.phone,
          address,
          subscription.stripeCustomerId
        }`,
        { id: funeralHomeId }
      );

      if (!funeralHome) {
        return NextResponse.json(
          { error: 'Funeral home not found' },
          { status: 404 }
        );
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      
      const session = await createCheckoutSession({
        customerId: funeralHome.subscription?.stripeCustomerId,
        planId: planId as PlanId,
        successUrl: `${baseUrl}/admin/billing/success`,
        cancelUrl: `${baseUrl}/admin/billing`,
        funeralHomeId,
      });

      return NextResponse.json({ 
        sessionId: session.id,
        url: session.url 
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