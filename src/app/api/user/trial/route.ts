import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { getTrialStatus, isTrialActive } from '@/lib/stripe';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user with trial information
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        planId: true,
        trialEndsAt: true,
        subscriptionStatus: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get trial status
    const trialStatus = getTrialStatus(user.trialEndsAt);
    const isCurrentlyTrialing = user.subscriptionStatus === 'trialing';

    // Get trial record for additional details
    const trialRecord = await prisma.trial.findUnique({
      where: { userId: user.id },
      select: {
        planId: true,
        startedAt: true,
        endsAt: true,
        status: true,
      },
    });

    return NextResponse.json({
      trial: {
        isActive: trialStatus.isActive && isCurrentlyTrialing,
        daysRemaining: trialStatus.daysRemaining,
        endsAt: trialStatus.endsAt,
        planId: trialRecord?.planId || user.planId,
        startedAt: trialRecord?.startedAt || user.createdAt,
        status: trialRecord?.status || (trialStatus.isActive ? 'active' : 'expired'),
      },
      user: {
        planId: user.planId,
        subscriptionStatus: user.subscriptionStatus,
      },
    });

  } catch (error) {
    console.error('Trial status error:', error);
    return NextResponse.json(
      { error: 'Failed to get trial status' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action } = await request.json();

    if (action === 'cancel_trial') {
      // Cancel trial and downgrade to free
      await prisma.$transaction(async (tx) => {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            planId: 'personal',
            subscriptionStatus: 'active',
            trialEndsAt: null,
          },
        });

        await tx.trial.updateMany({
          where: { userId: session.user.id },
          data: { status: 'cancelled' },
        });
      });

      return NextResponse.json({
        success: true,
        message: 'Trial cancelled successfully',
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Trial action error:', error);
    return NextResponse.json(
      { error: 'Failed to process trial action' },
      { status: 500 }
    );
  }
} 