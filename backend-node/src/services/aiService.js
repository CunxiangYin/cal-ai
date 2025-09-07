import Anthropic from '@anthropic-ai/sdk';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'anthropic';
    
    if (this.provider === 'anthropic' && process.env.ANTHROPIC_API_KEY) {
      this.anthropic = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY,
      });
    }
    
    this.promptManager = new PromptManager();
  }

  async analyzeMeal(description, language = 'auto', sessionId = null) {
    try {
      // Get context if session exists
      const context = sessionId ? await this.getSessionContext(sessionId) : {};
      
      // Generate prompt
      const prompt = this.promptManager.getMealAnalysisPrompt(description, language, context);
      
      // Call AI provider
      let result;
      if (this.provider === 'anthropic' && this.anthropic) {
        result = await this.callAnthropic(prompt);
      } else if (this.provider === 'openai' && process.env.OPENAI_API_KEY) {
        result = await this.callOpenAI(prompt);
      } else {
        // Fallback to mock response
        result = this.getMockResponse(description);
      }
      
      return result;
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getMockResponse(description);
    }
  }

  async callAnthropic(prompt) {
    try {
      const response = await this.anthropic.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      });
      
      const content = response.content[0].text;
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('Anthropic API Error:', error);
      throw error;
    }
  }

  async callOpenAI(prompt) {
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: 'You are a professional nutritionist AI assistant.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1024
        },
        {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const content = response.data.choices[0].message.content;
      return this.parseAIResponse(content);
    } catch (error) {
      console.error('OpenAI API Error:', error);
      throw error;
    }
  }

  parseAIResponse(content) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        
        // Calculate totals from food items
        const totals = this.calculateTotals(parsed.food_items || []);
        
        return {
          nutrition: {
            total_calories: totals.calories,
            total_protein: totals.protein,
            total_carbs: totals.carbs,
            total_fat: totals.fat,
            total_fiber: totals.fiber,
            total_sugar: totals.sugar,
            total_sodium: totals.sodium,
            food_items: parsed.food_items || []
          },
          ai_response: parsed.ai_response || '已为您分析营养信息',
          analysis_notes: parsed.analysis_notes || ''
        };
      }
    } catch (error) {
      console.error('Failed to parse AI response:', error);
    }
    
    return this.getMockResponse('');
  }

  calculateTotals(foodItems) {
    return foodItems.reduce((totals, item) => {
      return {
        calories: totals.calories + (item.calories || 0),
        protein: totals.protein + (item.protein || 0),
        carbs: totals.carbs + (item.carbs || 0),
        fat: totals.fat + (item.fat || 0),
        fiber: totals.fiber + (item.fiber || 0),
        sugar: totals.sugar + (item.sugar || 0),
        sodium: totals.sodium + (item.sodium || 0)
      };
    }, {
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
      sugar: 0,
      sodium: 0
    });
  }

  getMockResponse(description) {
    return {
      nutrition: {
        total_calories: 500,
        total_protein: 20,
        total_carbs: 50,
        total_fat: 25,
        total_fiber: 5,
        total_sugar: 10,
        total_sodium: 800,
        food_items: [
          {
            name: 'Estimated meal',
            name_cn: '估算餐食',
            amount: '1',
            unit: 'serving',
            calories: 500,
            protein: 20,
            carbs: 50,
            fat: 25,
            fiber: 5,
            sugar: 10,
            sodium: 800
          }
        ]
      },
      ai_response: 'I\'ve provided an estimated nutritional breakdown for your meal.',
      analysis_notes: 'This is an estimated nutritional breakdown.'
    };
  }

  async getSessionContext(sessionId) {
    // TODO: Implement session context retrieval
    return {};
  }
}

class PromptManager {
  getMealAnalysisPrompt(description, language, context = {}) {
    const langInstruction = {
      'zh': '请用中文回复',
      'en': 'Please respond in English',
      'auto': '请用与用户输入相同的语言回复'
    }[language] || '请用与用户输入相同的语言回复';

    return `你是 Cal AI，一位专业、友好、关怀的AI营养师助手。

用户输入：${description}

任务要求：
1. 分析用户输入的食物描述
2. 计算详细的营养成分
3. ${langInstruction}
4. 提供友好、鼓励的回复

输出格式（JSON）：
{
  "food_items": [
    {
      "name": "食物名称（英文）",
      "name_cn": "食物名称（中文）",
      "amount": "数量",
      "unit": "单位",
      "calories": 卡路里数值,
      "protein": 蛋白质克数,
      "carbs": 碳水化合物克数,
      "fat": 脂肪克数,
      "fiber": 纤维克数,
      "sugar": 糖分克数,
      "sodium": 钠毫克数
    }
  ],
  "analysis_notes": "营养分析要点",
  "ai_response": "给用户的自然语言回复"
}`;
  }
}

// Export singleton instance
const aiService = new AIService();
export default aiService;