import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions, checkSubscriptionLimits } from '@/lib/auth';
import { getTrialStatus } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const subscriptionData = await checkSubscriptionLimits(session.user.id);
    const trialStatus = getTrialStatus(session.user.trialEndsAt || null);

    return NextResponse.json({
      planId: session.user.planId || 'personal',
      subscriptionStatus: session.user.subscriptionStatus || 'active',
      trialEndsAt: session.user.trialEndsAt || null,
      subscriptionEndsAt: null,
      memorialCount: subscriptionData.currentCount,
      maxMemorials: subscriptionData.maxAllowed,
      canCreate: subscriptionData.canCreate,
      planName: subscriptionData.planName,
      isTrialActive: trialStatus.isActive,
      trialDaysRemaining: trialStatus.daysRemaining,
      // Business rules transparency
      limits: {
        personal: 3,
        minnesbricka: 10,
        custom: 'unlimited',
      },
    });

  } catch (error) {
    console.error('Subscription API error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription data' },
      { status: 500 }
    );
  }
} 