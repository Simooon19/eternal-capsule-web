import { NextRequest, NextResponse } from 'next/server';

interface InteractionData {
  memorialId: string;
  action: string;
  elementType: string;
  elementClass: string;
  timestamp: string;
}

export async function POST(request: NextRequest) {
  try {
    // Clone request to avoid "disturbed or locked" error
    const body = await request.text();
    const data: InteractionData = JSON.parse(body);

    // Validate required fields
    if (!data.memorialId || !data.action || !data.timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Log interaction for debugging in development
    if (process.env.NODE_ENV === 'development') {
      console.log('👆 User Interaction:', {
        memorialId: data.memorialId,
        action: data.action,
        elementType: data.elementType,
        elementClass: data.elementClass,
        timestamp: data.timestamp,
      });
    }

    // Store in a simple in-memory cache (in production, use a proper database)
    if (typeof global !== 'undefined') {
      if (!(global as any).userInteractions) {
        (global as any).userInteractions = [];
      }
      (global as any).userInteractions.push({
        ...data,
        id: Date.now().toString(),
      });
      
      // Keep only last 1000 interactions to prevent memory issues
      if ((global as any).userInteractions.length > 1000) {
        (global as any).userInteractions = (global as any).userInteractions.slice(-1000);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Interaction recorded' 
    });

  } catch (error) {
    console.error('Interaction analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to process interaction' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const interactions = (global as any).userInteractions || [];
    
    if (interactions.length === 0) {
      return NextResponse.json({
        totalInteractions: 0,
        recentInteractions: [],
        topElements: [],
      });
    }

    // Analyze interactions
    const elementCounts: Record<string, number> = {};
    const actionCounts: Record<string, number> = {};
    
    interactions.forEach((interaction: any) => {
      const key = `${interaction.elementType}.${interaction.elementClass}`;
      elementCounts[key] = (elementCounts[key] || 0) + 1;
      actionCounts[interaction.action] = (actionCounts[interaction.action] || 0) + 1;
    });

    // Sort by frequency
    const topElements = Object.entries(elementCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([element, count]) => ({ element, count }));

    const topActions = Object.entries(actionCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([action, count]) => ({ action, count }));

    return NextResponse.json({
      totalInteractions: interactions.length,
      recentInteractions: interactions.slice(-20),
      topElements,
      topActions,
    });

  } catch (error) {
    console.error('Interaction analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interaction data' },
      { status: 500 }
    );
  }
} 