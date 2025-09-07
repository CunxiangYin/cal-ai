import { DataTypes } from 'sequelize';
import sequelize from '../index.js';

// User Session Model
export const UserSession = sequelize.define('UserSession', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.STRING,
    field: 'user_id',
    allowNull: true
  },
  lastActivity: {
    type: DataTypes.DATE,
    field: 'last_activity',
    defaultValue: DataTypes.NOW
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  }
}, {
  tableName: 'user_sessions',
  timestamps: true
});

// Message Model
export const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  sessionId: {
    type: DataTypes.UUID,
    field: 'session_id',
    allowNull: false,
    references: {
      model: UserSession,
      key: 'id'
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'assistant', 'system'),
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSON,
    defaultValue: {}
  },
  nutritionDataId: {
    type: DataTypes.UUID,
    field: 'nutrition_data_id',
    allowNull: true
  }
}, {
  tableName: 'messages',
  timestamps: true
});

// Nutrition Info Model
export const NutritionInfo = sequelize.define('NutritionInfo', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  totalCalories: {
    type: DataTypes.FLOAT,
    field: 'total_calories',
    defaultValue: 0
  },
  totalProtein: {
    type: DataTypes.FLOAT,
    field: 'total_protein',
    defaultValue: 0
  },
  totalCarbs: {
    type: DataTypes.FLOAT,
    field: 'total_carbs',
    defaultValue: 0
  },
  totalFat: {
    type: DataTypes.FLOAT,
    field: 'total_fat',
    defaultValue: 0
  },
  totalFiber: {
    type: DataTypes.FLOAT,
    field: 'total_fiber',
    defaultValue: 0
  },
  totalSugar: {
    type: DataTypes.FLOAT,
    field: 'total_sugar',
    defaultValue: 0
  },
  totalSodium: {
    type: DataTypes.FLOAT,
    field: 'total_sodium',
    defaultValue: 0
  },
  analysisNotes: {
    type: DataTypes.TEXT,
    field: 'analysis_notes',
    allowNull: true
  }
}, {
  tableName: 'nutrition_info',
  timestamps: true
});

// Food Item Model
export const FoodItem = sequelize.define('FoodItem', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  nutritionInfoId: {
    type: DataTypes.UUID,
    field: 'nutrition_info_id',
    allowNull: false,
    references: {
      model: NutritionInfo,
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  nameCn: {
    type: DataTypes.STRING,
    field: 'name_cn',
    allowNull: true
  },
  amount: {
    type: DataTypes.STRING,
    allowNull: false
  },
  unit: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calories: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  protein: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  carbs: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fat: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  fiber: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sugar: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  },
  sodium: {
    type: DataTypes.FLOAT,
    defaultValue: 0
  }
}, {
  tableName: 'food_items',
  timestamps: true
});

// Define associations
UserSession.hasMany(Message, { foreignKey: 'sessionId', as: 'messages' });
Message.belongsTo(UserSession, { foreignKey: 'sessionId', as: 'session' });

Message.belongsTo(NutritionInfo, { foreignKey: 'nutritionDataId', as: 'nutritionData' });
NutritionInfo.hasOne(Message, { foreignKey: 'nutritionDataId', as: 'message' });

NutritionInfo.hasMany(FoodItem, { foreignKey: 'nutritionInfoId', as: 'foodItems' });
FoodItem.belongsTo(NutritionInfo, { foreignKey: 'nutritionInfoId', as: 'nutritionInfo' });

export default {
  UserSession,
  Message,
  NutritionInfo,
  FoodItem
};