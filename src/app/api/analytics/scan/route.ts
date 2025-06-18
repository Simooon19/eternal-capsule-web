import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

export async function POST(request: NextRequest) {
  try {
    const { memorialId, scanType, timestamp, userAgent, referrer } = await request.json();

    if (!memorialId || !scanType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update memorial scan count
    await client
      .patch(memorialId)
      .inc({ 
        scanCount: 1,
        [`${scanType}Count`]: 1 
      })
      .set({
        lastScanned: timestamp,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    // Create scan analytics record
    const scanRecord = {
      _type: 'scanAnalytics',
      memorial: {
        _type: 'reference',
        _ref: memorialId
      },
      scanType,
      timestamp,
      userAgent,
      referrer,
      deviceInfo: {
        isMobile: /Mobile|Android|iPhone|iPad/i.test(userAgent),
        browser: getBrowserInfo(userAgent),
        os: getOSInfo(userAgent)
      },
      createdAt: new Date().toISOString()
    };

    await client.create(scanRecord);

    return NextResponse.json({ 
      success: true,
      message: 'Scan tracked successfully'
    });
  } catch (error) {
    console.error('Error tracking scan:', error);
    return NextResponse.json(
      { error: 'Failed to track scan' },
      { status: 500 }
    );
  }
}

function getBrowserInfo(userAgent: string): string {
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getOSInfo(userAgent: string): string {
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac OS')) return 'macOS';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iPhone') || userAgent.includes('iPad')) return 'iOS';
  if (userAgent.includes('Linux')) return 'Linux';
  return 'Unknown';
}