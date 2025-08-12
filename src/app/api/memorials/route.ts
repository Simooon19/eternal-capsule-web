import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions, checkSubscriptionLimits } from '@/lib/auth';
import { client } from '@/lib/sanity';
import { prisma } from '@/lib/prisma';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';
import { Memorial } from '@/types/memorial';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'published';
    const search = searchParams.get('search');
    const hasPhotos = searchParams.get('hasPhotos') === 'true';
    const hasStories = searchParams.get('hasStories') === 'true';
    const yearRange = searchParams.get('yearRange') || 'all';
    
    let query = `*[_type == "memorial" && status == "${status}"`;
    
    if (search) {
      query += ` && (title match "${search}*" || subtitle match "${search}*")`;
    }
    
    if (hasPhotos) {
      query += ` && count(gallery) > 0`;
    }
    
    if (hasStories) {
      query += ` && count(storyBlocks) > 0`;
    }
    
    if (yearRange === 'recent') {
      const currentYear = new Date().getFullYear();
      query += ` && dateTime(_createdAt) >= dateTime("${currentYear - 1}-01-01T00:00:00Z")`;
    } else if (yearRange === 'old') {
      const currentYear = new Date().getFullYear();
      query += ` && dateTime(_createdAt) < dateTime("${currentYear - 1}-01-01T00:00:00Z")`;
    }
    
    query += `] {
      _id,
      title,
      name,
      subtitle,
      slug,
      personalInfo,
      "born": coalesce(personalInfo.dateOfBirth, born),
      "died": coalesce(personalInfo.dateOfDeath, died),
      bornAt,
      diedAt,
      coverImage,
      description,
      createdAt,
      updatedAt,
      status,
      gallery,
      storyBlocks,
      viewCount,
      minnesbrickaTagUid,
      privacy,
      tags[]
    } | order(_createdAt desc)`;

    const memorials = await client.fetch(query);

    return NextResponse.json({ memorials });
  } catch (error) {
    console.error('Error fetching memorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memorials' },
      { status: 500 }
    );
  }
}

const memorialSchema = z.object({
  title: z.string().min(1),
  bornAt: z.string().min(1),
  diedAt: z.string().min(1),
  privacy: z.enum(['public', 'unlisted', 'password-protected']).optional(),
  slug: z
    .object({ current: z.string().min(1) })
    .optional(),
}).strict();

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.creation, async () => {
    try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

      const json = await request.json();
      const parseResult = memorialSchema.safeParse(json);
      if (!parseResult.success) {
        return NextResponse.json(
          { error: 'Invalid payload', details: parseResult.error.flatten() },
          { status: 400 }
        );
      }
      const memorial = parseResult.data as any;

      // Check subscription limits
      const subscriptionData = await checkSubscriptionLimits(session.user.id);
      if (!subscriptionData.canCreate) {
        return NextResponse.json(
          { error: 'Memorial limit reached for your subscription plan' },
          { status: 403 }
        );
      }

      // Determine initial status based on subscription type
      // Auto-approve for paying members (not free/personal plan)
      const isPaying = subscriptionData.planName !== 'Personal' || subscriptionData.isTrialActive;
      const initialStatus = isPaying ? 'published' : 'pending';
      
      // Generate Minnesbricka tag UID for new memorials
      const minnesbrickaTagUid = `minnesbricka_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
      
      let sanityMemorial: any = null;
      let prismaMemorial: any = null;

      try {
        // Create memorial in Sanity first
        sanityMemorial = await client.create({
          _type: 'memorial',
          ...memorial,
          minnesbrickaTagUid,
          privacy: memorial.privacy || 'public',
          status: initialStatus,
          createdBy: session.user.id,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        // Create corresponding record in Prisma for tracking
        prismaMemorial = await prisma.memorial.create({
          data: {
            title: memorial.title,
            slug: sanityMemorial.slug?.current || sanityMemorial._id,
            userId: session.user.id,
            sanityId: sanityMemorial._id,
            status: 'active',
          },
        });

        return NextResponse.json({ 
          memorial: sanityMemorial,
          status: initialStatus,
          autoApproved: isPaying 
        });

      } catch (error) {
        // If either creation fails, try to rollback
        console.error('Error creating memorial:', error);
        
        // Try to clean up Sanity document if Prisma creation failed
        if (sanityMemorial && !prismaMemorial) {
          try {
            await client.delete(sanityMemorial._id);
          } catch (rollbackError) {
            console.error('Failed to rollback Sanity memorial:', rollbackError);
          }
        }

        // Try to clean up Prisma record if something else failed
        if (prismaMemorial && error) {
          try {
            await prisma.memorial.delete({ where: { id: prismaMemorial.id } });
          } catch (rollbackError) {
            console.error('Failed to rollback Prisma memorial:', rollbackError);
          }
        }

        throw error;
      }

    } catch (error) {
      console.error('Error creating memorial:', error);
      return NextResponse.json(
        { error: 'Failed to create memorial' },
        { status: 500 }
      );
    }
  });
}