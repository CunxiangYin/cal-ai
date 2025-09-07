import Anthropic from '@anthropic-ai/sdk';
import { v4 as uuidv4 } from 'uuid';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export default async function handler(req, res) {
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

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, language = 'auto', session_id } = req.body;
    
    if (!message) {
      return res.status(400).json({
        error: 'Message is required'
      });
    }
    
    const sessionId = session_id || uuidv4();
    
    // Create prompt
    const langInstruction = {
      'zh': '请用中文回复',
      'en': 'Please respond in English',
      'auto': '请用与用户输入相同的语言回复'
    }[language] || '请用与用户输入相同的语言回复';

    const prompt = `你是 Cal AI，一位专业、友好、关怀的AI营养师助手。

用户输入：${message}

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

    // Call Claude API
    let result;
    if (process.env.ANTHROPIC_API_KEY) {
      const response = await anthropic.messages.create({
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
      
      // Parse AI response
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          
          // Calculate totals
          const totals = (parsed.food_items || []).reduce((acc, item) => ({
            calories: acc.calories + (item.calories || 0),
            protein: acc.protein + (item.protein || 0),
            carbs: acc.carbs + (item.carbs || 0),
            fat: acc.fat + (item.fat || 0),
            fiber: acc.fiber + (item.fiber || 0),
            sugar: acc.sugar + (item.sugar || 0),
            sodium: acc.sodium + (item.sodium || 0)
          }), {
            calories: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            fiber: 0,
            sugar: 0,
            sodium: 0
          });
          
          result = {
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
    }
    
    // Fallback to mock response if no API key or parsing failed
    if (!result) {
      result = {
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
        ai_response: '已为您分析营养信息',
        analysis_notes: 'This is an estimated nutritional breakdown.'
      };
    }
    
    // Return response
    res.json({
      message_id: uuidv4(),
      nutrition: result.nutrition,
      ai_response: result.ai_response,
      session_id: sessionId,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error analyzing meal:', error);
    res.status(500).json({
      error: 'Failed to analyze meal',
      message: error.message
    });
  }
}