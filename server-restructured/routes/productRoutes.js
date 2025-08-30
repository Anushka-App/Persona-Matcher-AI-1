/**
 * Product API routes
 */
const express = require('express');
const productController = require('../controllers/productController');

const router = express.Router();

// Get product recommendations
router.get('/recommendations', productController.getProductRecommendations);

module.exports = router;
