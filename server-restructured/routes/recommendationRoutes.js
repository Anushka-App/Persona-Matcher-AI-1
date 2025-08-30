/**
 * Recommendation API routes
 */
const express = require('express');
const multer = require('multer');
const recommendationController = require('../controllers/recommendationController');

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Get recommendations based on text input
router.post('/text', recommendationController.getTextRecommendations);

// Get recommendations based on image upload
router.post('/image', upload.single('file'), recommendationController.getImageRecommendations);

// Get personalized recommendations
router.post('/personalized', recommendationController.getPersonalizedRecommendations);

// Legacy endpoints for frontend compatibility
router.get('/', (req, res) => {
  res.json({ message: 'Recommendations endpoint - use POST /text or POST /image' });
});

router.post('/', recommendationController.getTextRecommendations);

module.exports = router;
