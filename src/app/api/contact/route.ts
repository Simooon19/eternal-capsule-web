import { NextRequest, NextResponse } from 'next/server';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { prisma } from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.general, async () => {
    try {
      const { firstName, lastName, email, organization, planId, message } = await request.json();

      if (!firstName || !lastName || !email || !message) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        );
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        );
      }

      // Save to database
      const submission = await prisma.contactSubmission.create({
        data: {
          firstName,
          lastName,
          email,
          organization: organization || null,
          planId: planId || null,
          message,
        },
      });

      // Send notification email to admin
      const adminEmailSent = await sendEmail({
        to: process.env.ADMIN_EMAIL || 'admin@eternalcapsule.com',
        subject: `New Contact Form Submission - ${planId ? `${planId} plan` : 'General Inquiry'}`,
        template: 'contact_notification',
        data: {
          firstName,
          lastName,
          email,
          organization: organization || 'Not provided',
          planId: planId || 'Not specified',
          message,
          submissionId: submission.id,
        }
      });

      // Send confirmation email to user
      const userEmailSent = await sendEmail({
        to: email,
        subject: 'Thank you for contacting Eternal Capsule',
        template: 'contact_confirmation',
        data: {
          firstName,
          planId: planId || 'General Inquiry',
        }
      });

      // Check if user exists and link the submission
      const existingUser = await prisma.user.findUnique({
        where: { email }
      });

      if (existingUser) {
        await prisma.contactSubmission.update({
          where: { id: submission.id },
          data: { userId: existingUser.id }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Thank you for your message. We\'ll get back to you soon!',
        submissionId: submission.id,
        emailsSent: {
          admin: adminEmailSent,
          user: userEmailSent
        }
      });

    } catch (error) {
      console.error('Error handling contact form:', error);
      return NextResponse.json(
        { error: 'Failed to submit form. Please try again.' },
        { status: 500 }
      );
    }
  });
} 