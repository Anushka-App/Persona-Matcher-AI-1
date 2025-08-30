/**
 * Artwork controller
 */
const artworkService = require('../services/artworkService');

/**
 * Get all artwork data
 */
exports.getAllArtwork = async (req, res, next) => {
  try {
    const artworkData = await artworkService.getAllArtworkData();
    
    res.json({
      status: 'success',
      count: artworkData.length,
      data: artworkData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get artwork by name
 */
exports.getArtworkByName = async (req, res, next) => {
  try {
    const { name } = req.params;
    
    if (!name) {
      return res.status(400).json({
        error: 'Missing parameter',
        details: 'Artwork name is required'
      });
    }
    
    const artwork = await artworkService.getArtworkByName(name);
    
    if (!artwork) {
      return res.status(404).json({
        error: 'Not found',
        details: `Artwork with name "${name}" not found`
      });
    }
    
    res.json({
      status: 'success',
      data: artwork
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get artwork by theme
 */
exports.getArtworkByTheme = async (req, res, next) => {
  try {
    const { theme } = req.params;
    
    if (!theme) {
      return res.status(400).json({
        error: 'Missing parameter',
        details: 'Theme is required'
      });
    }
    
    const artworks = await artworkService.getArtworksByTheme(theme);
    
    res.json({
      status: 'success',
      count: artworks.length,
      data: artworks
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Search artwork by keyword
 */
exports.searchArtwork = async (req, res, next) => {
  try {
    const { keyword } = req.params;
    
    if (!keyword) {
      return res.status(400).json({
        error: 'Missing parameter',
        details: 'Search keyword is required'
      });
    }
    
    const results = await artworkService.searchArtworkByName(keyword);
    
    res.json({
      status: 'success',
      count: results.length,
      data: results
    });
  } catch (error) {
    next(error);
  }
};
