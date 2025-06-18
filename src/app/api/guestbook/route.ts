import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/lib/sanity';

// Simple profanity filter (in production, use a proper library)
const profanityWords = ['spam', 'hate', 'abuse']; // Add more words as needed

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

// Simple rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const windowMs = 15 * 60 * 1000; // 15 minutes
  const maxRequests = 5;

  const record = rateLimitStore.get(ip);
  
  if (!record) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (now > record.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || 'unknown';
    
    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { memorialId, author, message } = await request.json();

    // Validate input
    if (!memorialId || !author?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check for profanity
    const hasProfanity = containsProfanity(message) || containsProfanity(author);
    
    const doc = {
      _type: 'guestbookEntry',
      author: author.trim(),
      message: message.trim(),
      status: hasProfanity ? 'rejected' : 'pending',
      memorial: {
        _type: 'reference',
        _ref: memorialId
      },
      createdAt: new Date().toISOString(),
      reactions: []
    };

    const result = await client.create(doc);

    // Send email notification for new entries (implement later)
    // await sendNotificationEmail(memorialId, result);

    return NextResponse.json({ 
      entry: result,
      message: hasProfanity ? 
        'Your message has been flagged for review.' : 
        'Your message has been submitted and will appear after approval.'
    });
  } catch (error) {
    console.error('Error creating guestbook entry:', error);
    return NextResponse.json(
      { error: 'Failed to submit your message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { entryId, emoji } = await request.json();

    if (!entryId || !emoji) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current entry
    const entry = await client.fetch(
      `*[_type == "guestbookEntry" && _id == $id][0]`,
      { id: entryId }
    );

    if (!entry) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      );
    }

    // Update reactions
    const reactions = entry.reactions || [];
    const existingReaction = reactions.find((r: any) => r.emoji === emoji);

    let updatedReactions;
    if (existingReaction) {
      updatedReactions = reactions.map((r: any) => 
        r.emoji === emoji ? { ...r, count: r.count + 1 } : r
      );
    } else {
      updatedReactions = [...reactions, { emoji, count: 1 }];
    }

    const result = await client
      .patch(entryId)
      .set({ reactions: updatedReactions })
      .commit();

    return NextResponse.json({ entry: result });
  } catch (error) {
    console.error('Error updating reaction:', error);
    return NextResponse.json(
      { error: 'Failed to update reaction' },
      { status: 500 }
    );
  }
}