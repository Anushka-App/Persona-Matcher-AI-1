/**
 * Main server file
 */
const express = require('express');
const cors = require('cors');
const path = require('path');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const { existsSync } = require('fs');
const config = require('./config/config');

// Import routes
const statusRoutes = require('./routes/statusRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const artworkRoutes = require('./routes/artworkRoutes');
const personalityRoutes = require('./routes/personalityRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
// const loadingRoutes = require('./routes/loadingRoutes');

// Import middleware
const errorMiddleware = require('./middleware/errorMiddleware');
const loggerMiddleware = require('./middleware/loggerMiddleware');

// Initialize Express app
const app = express();

// Configure middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(loggerMiddleware);

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Serve static files from the build directory
const distPath = path.join(__dirname, '..', 'dist');
if (existsSync(distPath)) {
  app.use(express.static(distPath));
  console.log('✅ Static files middleware configured');
} else {
  console.log('❌ Dist folder not found - static files not served');
}

// Mount API routes
app.use('/api/status', statusRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use('/api/artwork', artworkRoutes);
app.use('/api/personality', personalityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
// app.use('/api/placeholder', loadingRoutes);
// app.use('/loading-images', loadingRoutes);

// Error handling middleware (must be last)
app.use(errorMiddleware);

// Serve React app on all non-API routes (must be after API routes)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // Serve the React app for client-side routing
  if (existsSync(distPath)) {
    res.sendFile(path.join(distPath, 'index.html'));
  } else {
    res.status(404).send('Application build not found');
  }
});

// Start the server
async function startServer() {
  try {
    // Initialize services here if needed
    
    app.listen(config.server.port, () => {
      console.log(`🚀 Server running on port ${config.server.port}`);
      console.log(`🔧 Environment: ${config.server.environment}`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});

// Start the server
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
