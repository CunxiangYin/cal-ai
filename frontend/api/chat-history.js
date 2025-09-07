// Simple in-memory storage for serverless
// In production, you should use a database like Vercel KV or Postgres
const chatHistory = new Map();

export default function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'GET') {
    const { session_id, limit = 50, offset = 0 } = req.query;
    
    let messages = [];
    if (session_id && chatHistory.has(session_id)) {
      messages = chatHistory.get(session_id);
    } else {
      // Get all messages from all sessions
      for (const sessionMessages of chatHistory.values()) {
        messages.push(...sessionMessages);
      }
    }
    
    // Sort by timestamp
    messages.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    // Apply pagination
    const paginatedMessages = messages.slice(
      parseInt(offset),
      parseInt(offset) + parseInt(limit)
    );
    
    res.json({
      messages: paginatedMessages.reverse(),
      total: messages.length,
      session_id: session_id || null,
      has_more: messages.length > parseInt(offset) + parseInt(limit)
    });
  } else if (req.method === 'POST') {
    // Add message to history
    const { session_id, message, role = 'user', nutrition = null } = req.body;
    
    if (!session_id || !message) {
      return res.status(400).json({
        error: 'session_id and message are required'
      });
    }
    
    if (!chatHistory.has(session_id)) {
      chatHistory.set(session_id, []);
    }
    
    const newMessage = {
      id: Date.now().toString(),
      session_id,
      role,
      content: message,
      nutrition,
      timestamp: new Date().toISOString()
    };
    
    chatHistory.get(session_id).push(newMessage);
    
    // Keep only last 100 messages per session to save memory
    if (chatHistory.get(session_id).length > 100) {
      chatHistory.set(session_id, chatHistory.get(session_id).slice(-100));
    }
    
    res.json({
      message: 'Message added to history',
      message_id: newMessage.id
    });
  } else if (req.method === 'DELETE') {
    const { session_id } = req.query;
    
    if (session_id) {
      chatHistory.delete(session_id);
      res.json({
        message: 'Chat history deleted',
        session_id
      });
    } else {
      res.status(400).json({
        error: 'session_id is required'
      });
    }
  } else {
    res.status(405).json({
      error: 'Method not allowed'
    });
  }
}