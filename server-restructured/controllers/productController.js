/**
 * Product controller
 */
const productService = require('../services/productService');
const recommendationService = require('../services/recommendationService');

/**
 * Get product recommendations
 */
exports.getProductRecommendations = async (req, res, next) => {
  try {
    const { userId, preferences } = req.query;
    
    let recommendations = [];
    
    if (userId) {
      // Get personalized recommendations for user
      recommendations = await recommendationService.getPersonalizedRecommendations(userId, preferences);
    } else {
      // Get general recommendations
      const products = await productService.getAllProducts();
      recommendations = products.slice(0, 10); // Return first 10 products
    }
    
    res.json({
      status: 'success',
      data: recommendations
    });
  } catch (error) {
    next(error);
  }
};
