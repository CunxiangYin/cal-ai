import express from 'express';
import { Message, UserSession, NutritionInfo, FoodItem } from '../database/models/index.js';

const router = express.Router();

// Get chat history
router.get('/chat-history', async (req, res) => {
  try {
    const { session_id, limit = 50, offset = 0 } = req.query;
    
    const whereClause = session_id ? { sessionId: session_id } : {};
    
    const messages = await Message.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      include: [
        {
          model: NutritionInfo,
          as: 'nutritionData',
          include: [
            {
              model: FoodItem,
              as: 'foodItems'
            }
          ]
        }
      ]
    });
    
    res.json({
      messages: messages.rows.reverse(),
      total: messages.count,
      session_id: session_id || null,
      has_more: messages.count > parseInt(offset) + parseInt(limit)
    });
    
  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      error: 'Failed to fetch chat history',
      message: error.message
    });
  }
});

// Get session summary
router.get('/session-summary/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    const session = await UserSession.findByPk(session_id, {
      include: [
        {
          model: Message,
          as: 'messages',
          include: [
            {
              model: NutritionInfo,
              as: 'nutritionData',
              include: [
                {
                  model: FoodItem,
                  as: 'foodItems'
                }
              ]
            }
          ]
        }
      ]
    });
    
    if (!session) {
      return res.status(404).json({
        error: 'Session not found'
      });
    }
    
    // Calculate summary
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    const foodItems = [];
    
    for (const message of session.messages) {
      if (message.nutritionData) {
        totalCalories += message.nutritionData.totalCalories || 0;
        totalProtein += message.nutritionData.totalProtein || 0;
        totalCarbs += message.nutritionData.totalCarbs || 0;
        totalFat += message.nutritionData.totalFat || 0;
        
        if (message.nutritionData.foodItems) {
          foodItems.push(...message.nutritionData.foodItems);
        }
      }
    }
    
    res.json({
      session_id: session.id,
      created_at: session.createdAt,
      last_activity: session.lastActivity,
      message_count: session.messages.length,
      daily_totals: {
        calories: totalCalories,
        protein: totalProtein,
        carbs: totalCarbs,
        fat: totalFat
      },
      food_items: foodItems
    });
    
  } catch (error) {
    console.error('Error fetching session summary:', error);
    res.status(500).json({
      error: 'Failed to fetch session summary',
      message: error.message
    });
  }
});

// Delete chat history for a session
router.delete('/chat-history/:session_id', async (req, res) => {
  try {
    const { session_id } = req.params;
    
    // Delete messages for this session
    await Message.destroy({
      where: { sessionId: session_id }
    });
    
    // Delete the session
    await UserSession.destroy({
      where: { id: session_id }
    });
    
    res.json({
      message: 'Chat history deleted successfully',
      session_id: session_id
    });
    
  } catch (error) {
    console.error('Error deleting chat history:', error);
    res.status(500).json({
      error: 'Failed to delete chat history',
      message: error.message
    });
  }
});

// Voice to text endpoint (placeholder)
router.post('/voice-to-text', async (req, res) => {
  // This would integrate with a speech-to-text service
  // For now, return a mock response
  res.json({
    text: '我今天吃了一碗牛肉面',
    confidence: 0.95,
    language: 'zh-CN'
  });
});

// Get supported voice formats
router.get('/voice/supported-formats', (req, res) => {
  res.json({
    formats: ['mp3', 'wav', 'm4a', 'webm'],
    max_size_mb: 10
  });
});

export default router;