import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

interface Params {
  id: string;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const memorial = await client.fetch(
      `*[_type == "memorial" && _id == $id][0] {
        _id,
        title,
        subtitle,
        slug,
        bornAt,
        diedAt,
        createdAt,
        updatedAt,
        status,
        privacy,
        tags,
        gallery[] {
          _key,
          asset-> {
            _id,
            url,
            metadata {
              dimensions {
                width,
                height
              }
            }
          },
          alt,
          caption
        },
        storyBlocks,
        videos[] {
          _key,
          asset-> {
            _id,
            url,
            playbackId,
            filename
          },
          title,
          description
        },
        audioMemories[] {
          _key,
          asset-> {
            _id,
            url,
            filename
          },
          title,
          description
        },
        timeline[] {
          _key,
          date,
          title,
          description,
          image {
            asset-> {
              _id,
              url
            },
            alt
          }
        },
        guestbook[] | order(createdAt desc) {
          _id,
          author,
          message,
          createdAt,
          status,
          reactions[] {
            emoji,
            count
          }
        }
      }`,
      { id: params.id }
    );

    if (!memorial) {
      return NextResponse.json(
        { error: 'Memorial not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ memorial });
  } catch (error) {
    console.error('Error fetching memorial:', error);
    return NextResponse.json(
      { error: 'Failed to fetch memorial' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    const updates = await request.json();
    
    const result = await client
      .patch(params.id)
      .set({
        ...updates,
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ memorial: result });
  } catch (error) {
    console.error('Error updating memorial:', error);
    return NextResponse.json(
      { error: 'Failed to update memorial' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Params }
) {
  try {
    // Soft delete - move to trash
    const result = await client
      .patch(params.id)
      .set({
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting memorial:', error);
    return NextResponse.json(
      { error: 'Failed to delete memorial' },
      { status: 500 }
    );
  }
}