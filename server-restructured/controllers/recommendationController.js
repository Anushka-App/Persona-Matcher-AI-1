/**
 * Recommendation controller
 */
const productService = require('../services/productService');
const recommendationService = require('../services/recommendationService');

/**
 * Get product recommendations based on text description
 */
exports.getTextRecommendations = async (req, res, next) => {
  try {
    const { description, bagType } = req.body;
    
    // Validate required fields
    if (!description) {
      return res.status(400).json({
        error: 'Missing description',
        details: 'Text description is required'
      });
    }
    
    // Get style keywords from description
    const styleKeywords = await recommendationService.getStyleKeywords(description);
    
    // Find matching products
    const bagPref = bagType || 'Bag';
    const recommendations = await recommendationService.findMatchingProducts(styleKeywords, bagPref);
    
    res.json({
      status: 'success',
      recommendations,
      styleKeywords
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get product recommendations based on image upload
 */
exports.getImageRecommendations = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Missing file',
        details: 'Image file is required'
      });
    }
    
    const { bagType } = req.body;
    const bagPref = bagType || 'Bag';
    
    // Process image and get visual style descriptor
    // Note: This is a placeholder - in a real app, you would analyze the image
    const imageDescription = 'visual style descriptor for uploaded image';
    
    // Get style keywords from image description
    const styleKeywords = await recommendationService.getStyleKeywords(imageDescription);
    
    // Find matching products
    const recommendations = await recommendationService.findMatchingProducts(styleKeywords, bagPref);
    
    res.json({
      status: 'success',
      recommendations,
      styleKeywords
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized recommendations based on user profile
 */
exports.getPersonalizedRecommendations = async (req, res, next) => {
  try {
    const { userId, preferences } = req.body;
    
    // Validate required fields
    if (!userId && !preferences) {
      return res.status(400).json({
        error: 'Missing data',
        details: 'User ID or preferences are required'
      });
    }
    
    // Get personalized recommendations
    const recommendations = await recommendationService.getPersonalizedRecommendations(userId, preferences);
    
    res.json({
      status: 'success',
      recommendations
    });
  } catch (error) {
    next(error);
  }
};
