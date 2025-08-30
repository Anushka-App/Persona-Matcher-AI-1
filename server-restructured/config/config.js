/**
 * Main configuration file for the server
 */
require('dotenv').config();

module.exports = {
  // Server configuration
  server: {
    port: parseInt(process.env.PORT || '8000', 10),
    environment: process.env.NODE_ENV || 'development',
  },
  
  // API keys
  api: {
    gemini: process.env.GEMINI_API_KEY || '',
  },
  
  // Database configuration (if used)
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    name: process.env.DB_NAME || 'personamatcher',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  
  // Email service configuration
  email: {
    fromEmail: process.env.FROM_EMAIL || 'noreply@example.com',
    sendgridApiKey: process.env.SENDGRID_API_KEY || '',
  },
  
  // Paths for data files
  paths: {
    productDataPath: process.env.PRODUCT_DATA_PATH || '../updated_ml_bags_personality_dataset_cleaned.csv',
    artworkPersonalityPath: process.env.ARTWORK_PERSONALITY_PATH || '../mapped_persona_artwork_data.xlsx',
  },
};
