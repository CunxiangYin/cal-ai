import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import aiService from '../services/aiService.js';
import { UserSession, Message, NutritionInfo, FoodItem } from '../database/models/index.js';

const router = express.Router();

// Analyze meal endpoint
router.post('/analyze-meal', async (req, res) => {
  try {
    const { message, language = 'auto', session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    // Get or create session
    let sessionId = session_id || uuidv4();
    let session = await UserSession.findByPk(sessionId);
    
    if (!session) {
      session = await UserSession.create({
        id: sessionId,
        userId: null,
        metadata: {}
      });
    }
    
    // Update last activity
    session.lastActivity = new Date();
    await session.save();
    
    // Store user message
    const userMessage = await Message.create({
      sessionId: session.id,
      role: 'user',
      content: message,
      metadata: {}
    });
    
    // Analyze meal using AI
    const aiResult = await aiService.analyzeMeal(message, language, session.id);
    
    // Create nutrition info if present
    let nutritionInfo = null;
    if (aiResult.nutrition && aiResult.nutrition.total_calories > 0) {
      nutritionInfo = await NutritionInfo.create({
        totalCalories: aiResult.nutrition.total_calories,
        totalProtein: aiResult.nutrition.total_protein,
        totalCarbs: aiResult.nutrition.total_carbs,
        totalFat: aiResult.nutrition.total_fat,
        totalFiber: aiResult.nutrition.total_fiber,
        totalSugar: aiResult.nutrition.total_sugar,
        totalSodium: aiResult.nutrition.total_sodium,
        analysisNotes: aiResult.analysis_notes
      });
      
      // Create food items
      if (aiResult.nutrition.food_items && aiResult.nutrition.food_items.length > 0) {
        for (const item of aiResult.nutrition.food_items) {
          await FoodItem.create({
            nutritionInfoId: nutritionInfo.id,
            name: item.name,
            nameCn: item.name_cn,
            amount: item.amount,
            unit: item.unit,
            calories: item.calories,
            protein: item.protein,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
            sugar: item.sugar,
            sodium: item.sodium
          });
        }
      }
    }
    
    // Store assistant message
    const assistantMessage = await Message.create({
      sessionId: session.id,
      role: 'assistant',
      content: aiResult.ai_response,
      nutritionDataId: nutritionInfo ? nutritionInfo.id : null,
      metadata: {}
    });
    
    // Prepare response
    res.json({
      message_id: assistantMessage.id,
      nutrition: aiResult.nutrition,
      ai_response: aiResult.ai_response,
      session_id: session.id,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      error: 'Failed to analyze meal',
      message: error.message
    });
  }
});

export default router;