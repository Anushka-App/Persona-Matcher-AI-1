/**
 * Loading images and placeholder API routes
 */
const express = require('express');
const path = require('path');
const fs = require('fs');

const router = express.Router();

// Serve loading images
router.get('/', (req, res) => {
  try {
    // Return a list of available loading images or a default one
    const loadingImages = [
      '/product-image1.png',
      '/product-image2.png',
      '/red-floral-handbag.jpg',
      '/black-leopard-handbag.jpg'
    ];
    
    res.json({
      images: loadingImages,
      message: 'Loading images available'
    });
  } catch (error) {
    console.error('Error serving loading images:', error);
    res.status(500).json({ error: 'Failed to load images' });
  }
});

// Serve placeholder images
router.get('/placeholder/:width/:height', (req, res) => {
  const { width, height } = req.params;
  
  try {
    // Return a placeholder image URL or create a simple SVG
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666" text-anchor="middle" dy=".3em">
          ${width}x${height}
        </text>
      </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
  } catch (error) {
    console.error('Error serving placeholder:', error);
    res.status(500).json({ error: 'Failed to generate placeholder' });
  }
});

module.exports = router;
