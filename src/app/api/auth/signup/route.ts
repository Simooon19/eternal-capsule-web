import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { sendEmail } from '@/lib/email';
import { subscriptionPlans } from '@/lib/stripe';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { name, email, password, organization, planId = 'free' } = await request.json();

      // Validate required fields
      if (!name?.trim() || !email?.trim() || !password) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Validate password strength
      if (password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }

      // Validate plan ID
      if (!subscriptionPlans[planId as keyof typeof subscriptionPlans]) {
        return NextResponse.json(
          { error: 'Invalid plan selected' },
          { status: 400 }
        );
      }

      const normalizedEmail = email.trim().toLowerCase();

      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: normalizedEmail }
      });

      if (existingUser) {
        return NextResponse.json(
          { error: 'An account with this email already exists' },
          { status: 409 }
        );
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Determine trial setup
      const isTrialEligible = planId !== 'free';
      const trialEndsAt = isTrialEligible ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 days

      // Get selected plan for later use
      const selectedPlan = subscriptionPlans[planId as keyof typeof subscriptionPlans];

      // Create user with transaction
      const user = await prisma.$transaction(async (tx: any) => {
        // Create user
        const newUser = await tx.user.create({
          data: {
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword,
            organization: organization?.trim() || null,
            planId: isTrialEligible ? planId : 'free',
            trialEndsAt,
            subscriptionStatus: isTrialEligible ? 'trialing' : 'active',
            role: 'USER',
          },
        });

        // Create trial record if applicable
        if (isTrialEligible && trialEndsAt) {
          await tx.trial.create({
            data: {
              userId: newUser.id,
              planId,
              endsAt: trialEndsAt,
            },
          });
        }

        return newUser;
      });

      // Send welcome email (non-blocking)
      try {
        await sendEmail({
          to: user.email,
          subject: 'Welcome to Eternal Capsule',
          template: 'welcome',
          data: {
            userName: user.name || 'New User',
            planName: selectedPlan.name,
            isTrialing: isTrialEligible,
            trialEndsAt: trialEndsAt?.toLocaleDateString(),
            dashboardUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard`,
            loginUrl: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/signin`,
          },
        });
      } catch (emailError) {
        console.error('Failed to send welcome email:', emailError);
        // Don't fail the signup if email fails
      }

      // Log successful signup
      console.log(`✅ New user signup: ${user.email} (Plan: ${planId}${isTrialEligible ? ' - Trial' : ''})`);

      // Return success (don't include sensitive data)
      return NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          planId: user.planId,
          isTrialing: isTrialEligible,
          trialEndsAt: trialEndsAt?.toISOString(),
        },
        message: isTrialEligible 
          ? `Account created with ${selectedPlan.name} trial!` 
          : 'Account created successfully!',
      });

    } catch (error) {
      console.error('Signup error:', error);
      
      // Handle specific Prisma errors
      if (error instanceof Error) {
        if (error.message.includes('Unique constraint')) {
          return NextResponse.json(
            { error: 'An account with this email already exists' },
            { status: 409 }
          );
        }
      }

      return NextResponse.json(
        { error: 'Failed to create account. Please try again.' },
        { status: 500 }
      );
    }
  });
} 