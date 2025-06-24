import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';
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
      nfcTagUid,
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

export async function POST(request: NextRequest) {
  try {
    const memorial = await request.json();
    
    // Add server-side validation
    if (!memorial.title || !memorial.bornAt || !memorial.diedAt) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Generate NFC tag UID for new memorials
    const nfcTagUid = `nfc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const result = await client.create({
      _type: 'memorial',
      ...memorial,
      nfcTagUid,
      privacy: memorial.privacy || 'public',
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ memorial: result });
  } catch (error) {
    console.error('Error creating memorial:', error);
    return NextResponse.json(
      { error: 'Failed to create memorial' },
      { status: 500 }
    );
  }
}