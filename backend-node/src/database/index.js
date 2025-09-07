import { Sequelize } from 'sequelize';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Create Sequelize instance
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: join(__dirname, '../../cal_ai.db'),
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
    freezeTableName: true
  }
});

// Test database connection
export async function testConnection() {
  try {
    await sequelize.authenticate();
    console.log('✅ Database connection established successfully.');
    return true;
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error);
    return false;
  }
}

// Initialize database
export async function initDatabase() {
  try {
    await testConnection();
    
    // Import models
    const models = await import('./models/index.js');
    
    // Sync database
    await sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
    
    console.log('✅ Database models synchronized');
    return true;
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

export { sequelize };
export default sequelize;