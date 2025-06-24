import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { rateLimiters } from '@/lib/rateLimit';
import type { BulkMemorialRequest, BulkMemorialResponse, BulkMemorialData } from '@/types/api';

export async function POST(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResult = await rateLimiters.bulkCreation.checkLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      );
    }

    // Verify authentication and funeral home permissions
    const session = await getServerSession(authOptions);
    if (!session || !['funeral', 'enterprise'].includes(session.user.planId)) {
      return NextResponse.json(
        { error: 'Bulk creation requires funeral home or enterprise plan' },
        { status: 403 }
      );
    }

    const { memorials }: BulkMemorialRequest = await request.json();
    
    if (!Array.isArray(memorials) || memorials.length === 0) {
      return NextResponse.json(
        { error: 'Invalid memorial data. Expected array of memorials.' },
        { status: 400 }
      );
    }

    if (memorials.length > 50) {
      return NextResponse.json(
        { error: 'Bulk creation limited to 50 memorials per request.' },
        { status: 400 }
      );
    }

    const results = [];
    const errors = [];

    for (let i = 0; i < memorials.length; i++) {
      const memorial = memorials[i];
      
      try {
        // Validate required fields
        if (!memorial.name || !memorial.born || !memorial.died) {
          errors.push({
            index: i,
            error: 'Missing required fields: name, born, died',
            data: memorial
          });
          continue;
        }

        // Generate unique slug
        const slug = memorial.name
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-+|-+$/g, '');

        // Generate NFC tag UID
        const nfcTagUid = `nfc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Create memorial in Sanity
        const result = await client.create({
          _type: 'memorial',
          title: memorial.name,
          name: memorial.name, // Backward compatibility
          subtitle: memorial.description,
          slug: { current: `${slug}-${Date.now()}` },
          bornAt: {
            date: memorial.born,
            location: memorial.birthLocation || '',
          },
          diedAt: {
            date: memorial.died, 
            location: memorial.deathLocation || '',
          },
          tags: memorial.tags || [],
          gallery: [],
          storyBlocks: [],
          nfcTagUid,
          privacy: 'public',
          status: 'pending', // Requires approval
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          // Track bulk creation metadata
          bulkCreated: true,
          createdBy: session.user.id,
          familyEmail: memorial.familyEmail,
        });

        results.push({
          index: i,
          success: true,
          memorial: {
            id: result._id,
            slug: result.slug.current,
            url: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/${result.slug.current}`,
            nfcTagUid: result.nfcTagUid,
          }
        });

        // Send email to family if provided
        if (memorial.familyEmail) {
          try {
            const { sendMemorialCreatedEmail } = await import('@/lib/email');
            await sendMemorialCreatedEmail({
              to: [memorial.familyEmail],
              deceasedName: memorial.name,
              memorialUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/memorial/${result.slug.current}`,
              funeralHomeName: session.user.name || 'Your Funeral Home',
              familyEmail: memorial.familyEmail,
            });
          } catch (emailError) {
            console.warn(`Failed to send email for ${memorial.name}:`, emailError);
          }
        }

      } catch (error) {
        errors.push({
          index: i,
          error: error instanceof Error ? error.message : 'Unknown error',
          data: memorial
        });
      }
    }

    const response: BulkMemorialResponse = {
      success: true,
      created: results.length,
      failed: errors.length,
      results,
      errors: errors.length > 0 ? errors : undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Bulk memorial creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create memorials' },
      { status: 500 }
    );
  }
} 