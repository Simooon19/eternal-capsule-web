import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { client } from '@/lib/sanity';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Fetch user's memorials from Sanity
    const query = `*[_type == "memorial" && createdBy == $userId] {
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
      viewCount,
      minnesbrickaTagUid,
      privacy,
      tags[]
    } | order(_createdAt desc)`;

    const memorials = await client.fetch(query, { userId: session.user.id });
    
    return NextResponse.json({ memorials });
  } catch (error) {
    console.error('Error fetching user memorials:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memorials' },
      { status: 500 }
    );
  }
}