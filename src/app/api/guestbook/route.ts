import { NextRequest, NextResponse } from 'next/server';
import { client, writeClient, canWriteToSanity } from '@/lib/sanity';
import { handleApiError, createApiResponse, AppError } from '@/lib/errorHandling';
import { withRateLimit, rateLimiters } from '@/lib/rateLimit';

// Simple profanity filter (in production, use a proper library)
const profanityWords = ['spam', 'hate', 'abuse']; // Add more words as needed

function containsProfanity(text: string): boolean {
  const lowerText = text.toLowerCase();
  return profanityWords.some(word => lowerText.includes(word));
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const memorialId = searchParams.get('memorialId');
    const status = searchParams.get('status') || 'all'; // Allow filtering by status

    if (!memorialId) {
      throw new AppError('Memorial ID is required', 400, 'MISSING_MEMORIAL_ID');
    }

    // Build status filter - for development, show all; for production, only approved
    let statusFilter = '';
    if (status === 'approved') {
      statusFilter = ' && status == "approved"';
    } else if (status === 'pending') {
      statusFilter = ' && status == "pending"';
    } else if (status === 'all') {
      // Show all statuses for development/debugging
      statusFilter = ' && status in ["pending", "approved"]';
    }

    // Fetch guestbook entries for the memorial
    // Use Sanity's draft system - get both published and draft versions, prioritizing drafts
    const entries = await client.fetch(
      `*[_type == "guestbookEntry" && memorial._ref == $memorialId${statusFilter}] {
        _id,
        author,
        message,
        createdAt,
        reactions,
        status,
        memorial,
        "isDraft": _id in path("drafts.**")
      } | order(_createdAt desc)`,
      { memorialId }
    );

    // Filter to get latest version of each entry (prefer draft over published)
    const latestEntries = entries.reduce((acc: any[], entry: any) => {
      const baseId = entry._id.replace('drafts.', '');
      const existingIndex = acc.findIndex(e => e._id.replace('drafts.', '') === baseId);
      
      if (existingIndex === -1) {
        acc.push(entry);
      } else {
        // If we have both draft and published, keep the draft (more recent)
        if (entry.isDraft && !acc[existingIndex].isDraft) {
          acc[existingIndex] = entry;
        }
      }
      
      return acc;
    }, []);

    if (process.env.NODE_ENV === 'development') {
      console.log(`📋 Found ${latestEntries.length} guestbook entries for memorial ${memorialId} with status filter: ${status}`);
    }

    return createApiResponse({ entries: latestEntries, count: latestEntries.length, memorialId });
  } catch (error) {
    const apiError = handleApiError(error);
    return createApiResponse(undefined, apiError);
  }
}

export async function POST(request: NextRequest) {
  return withRateLimit(request, rateLimiters.guestbook, async () => {
    try {
      const { memorialId, author, message } = await request.json();

      // Validate input
      if (!memorialId || !author?.trim() || !message?.trim()) {
        throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
      }

      // Validate input lengths
      if (author.trim().length > 100) {
        throw new AppError('Author name too long (max 100 characters)', 400, 'AUTHOR_TOO_LONG');
      }

      if (message.trim().length > 500) {
        throw new AppError('Message too long (max 500 characters)', 400, 'MESSAGE_TOO_LONG');
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

      // Use the write client for creating documents
      const result = await writeClient.create(doc);

      // Log the operation
      if (process.env.NODE_ENV === 'development') {
      console.log(`📝 Guestbook entry created: ${result._id} for memorial: ${memorialId}`);
    }

      // Send email notification for new entries (implement later)
      // await sendNotificationEmail(memorialId, result);

      const responseMessage = canWriteToSanity() 
        ? (hasProfanity 
          ? 'Your message has been flagged for review.' 
          : 'Your message has been submitted and will appear after approval.')
        : 'Your message has been recorded in demo mode. In production, it would appear after approval.';

      return createApiResponse({ 
        entry: result,
        message: responseMessage,
        isDemoMode: !canWriteToSanity()
      });
    } catch (error) {
      console.error('Guestbook POST error:', error);
      const apiError = handleApiError(error);
      return createApiResponse(undefined, apiError);
    }
  });
}

export async function PATCH(request: NextRequest) {
  return withRateLimit(request, rateLimiters.guestbook, async () => {
    try {
      const { entryId, emoji, action = 'add' } = await request.json();

      if (!entryId || !emoji) {
        throw new AppError('Missing required fields', 400, 'MISSING_FIELDS');
      }

      // Validate action
      if (!['add', 'remove'].includes(action)) {
        throw new AppError('Invalid action. Must be "add" or "remove"', 400, 'INVALID_ACTION');
      }

      // Validate emoji (simple check)
      if (emoji.length > 2) {
        throw new AppError('Invalid emoji format', 400, 'INVALID_EMOJI');
      }

      // Get current entry
      const entry = await client.fetch(
        `*[_type == "guestbookEntry" && _id == $id][0]`,
        { id: entryId }
      );

      if (!entry) {
        throw new AppError('Entry not found', 404, 'ENTRY_NOT_FOUND');
      }

      // Update reactions
      const reactions = entry.reactions || [];
      const existingReaction = reactions.find((r: any) => r.emoji === emoji);

      let updatedReactions;
      if (action === 'add') {
        if (existingReaction) {
          updatedReactions = reactions.map((r: any) => 
            r.emoji === emoji ? { ...r, count: r.count + 1 } : r
          );
        } else {
          updatedReactions = [...reactions, { emoji, count: 1 }];
        }
      } else { // action === 'remove'
        if (existingReaction) {
          if (existingReaction.count > 1) {
            updatedReactions = reactions.map((r: any) => 
              r.emoji === emoji ? { ...r, count: r.count - 1 } : r
            );
          } else {
            // Remove the reaction entirely if count becomes 0
            updatedReactions = reactions.filter((r: any) => r.emoji !== emoji);
          }
        } else {
          // No existing reaction to remove, return current reactions
          updatedReactions = reactions;
        }
      }

      // Use write client for updates
      const result = await writeClient
        .patch(entryId)
        .set({ reactions: updatedReactions })
        .commit();

      if (process.env.NODE_ENV === 'development') {
        console.log(`💝 Reaction ${action}ed for entry: ${entryId} with emoji: ${emoji}`);
      }

      return createApiResponse({ 
        entry: result,
        message: `Reaction ${action}ed successfully`,
        isDemoMode: !canWriteToSanity()
      });
    } catch (error) {
      console.error('Guestbook PATCH error:', error);
      const apiError = handleApiError(error);
      return createApiResponse(undefined, apiError);
    }
  });
}