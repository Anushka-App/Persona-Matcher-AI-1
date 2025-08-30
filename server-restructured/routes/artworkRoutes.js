/**
 * Artwork API routes
 */
const express = require('express');
const artworkController = require('../controllers/artworkController');

const router = express.Router();

// Get all artwork data
router.get('/', artworkController.getAllArtwork);

// Frontend compatibility endpoint
router.get('/artwork-data', artworkController.getAllArtwork);

// Get artwork by name
router.get('/:name', artworkController.getArtworkByName);

// Get artwork by theme
router.get('/theme/:theme', artworkController.getArtworkByTheme);

// Search artwork by keyword
router.get('/search/:keyword', artworkController.searchArtwork);

module.exports = router;
