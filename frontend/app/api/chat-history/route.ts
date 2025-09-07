import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for demo purposes
// In production, this should be stored in a database
const chatHistory = new Map<string, any[]>();

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('session_id');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'session_id is required' },
        { status: 400 }
      );
    }
    
    const history = chatHistory.get(sessionId) || [];
    
    return NextResponse.json({
      session_id: sessionId,
      messages: history,
      total_count: history.length
    });
  } catch (error) {
    console.error('Error fetching chat history:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch chat history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { session_id, message, role = 'user' } = body;
    
    if (!session_id || !message) {
      return NextResponse.json(
        { error: 'session_id and message are required' },
        { status: 400 }
      );
    }
    
    const messageEntry = {
      id: uuidv4(),
      session_id,
      role,
      message,
      timestamp: new Date().toISOString()
    };
    
    if (!chatHistory.has(session_id)) {
      chatHistory.set(session_id, []);
    }
    
    chatHistory.get(session_id)?.push(messageEntry);
    
    return NextResponse.json({
      message: 'Message added to history',
      message_id: messageEntry.id
    });
  } catch (error) {
    console.error('Error adding to chat history:', error);
    return NextResponse.json(
      {
        error: 'Failed to add message to history',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}