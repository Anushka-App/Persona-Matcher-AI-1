const express = require('express');
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

const router = express.Router();

/**
 * GET /api/artwork-data
 * Serves artwork data from the Excel file
 */
router.get('/artwork-data', async (req, res) => {
  try {
    console.log('📊 Loading artwork data from Excel file...');
    
    // Path to the Excel file
    const excelFilePath = path.join(__dirname, '..', 'mapped_persona_artwork_data.xlsx');
    
    // Check if file exists
    if (!fs.existsSync(excelFilePath)) {
      console.error('❌ Excel file not found:', excelFilePath);
      return res.status(404).json({ 
        error: 'Artwork data file not found',
        message: 'The mapped_persona_artwork_data.xlsx file is missing'
      });
    }
    
    // Read the Excel file
    const workbook = XLSX.readFile(excelFilePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const rawData = XLSX.utils.sheet_to_json(worksheet);
    
    console.log(`📊 Loaded ${rawData.length} rows from Excel file`);
    
    // Transform and validate the data
    const artworkData = transformExcelData(rawData);
    
    console.log(`✅ Successfully processed ${artworkData.length} artwork items`);
    
    res.json({
      success: true,
      count: artworkData.length,
      data: artworkData,
      themes: getAvailableThemes(artworkData),
      productTypes: getAvailableProductTypes(artworkData)
    });
    
  } catch (error) {
    console.error('❌ Error loading Excel data:', error);
    res.status(500).json({ 
      error: 'Failed to load artwork data',
      message: error.message,
      fallback: getFallbackData()
    });
  }
});

/**
 * Transform Excel data to clean format
 */
function transformExcelData(rawData) {
  const artworkData = [];
  
  for (const row of rawData) {
    try {
      // Skip rows without essential data
      if (!row.artworkName || !row.primaryTheme || !row.productType) {
        continue;
      }

      // Clean and validate the data
      const artwork = {
        artworkName: cleanString(row.artworkName),
        artworkUrl: cleanString(row.artworkUrl) || generateDefaultUrl(row.artworkName),
        imageUrl: cleanString(row.imageUrl) || generatePlaceholderImage(row.artworkName),
        primaryTheme: cleanString(row.primaryTheme),
        productType: cleanString(row.productType),
        personalityTraits: cleanString(row.personalityTraits) || 'Unique and expressive design',
        designElements: cleanString(row.designElements),
        overallPersonality: cleanString(row.overallPersonality) || 'Distinctive and creative',
        buyerPersonalityMatch: cleanString(row.buyerPersonalityMatch) || 'Creative and artistic individuals',
        psychologicalAppeal: cleanString(row.psychologicalAppeal) || 'Appeals to those who appreciate unique design'
      };

      artworkData.push(artwork);
      
    } catch (error) {
      console.warn(`⚠️ Skipping invalid row:`, row, error);
    }
  }

  return artworkData;
}

/**
 * Clean string data from Excel
 */
function cleanString(value) {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number') {
    return value.toString();
  }
  return undefined;
}

/**
 * Generate default URL for artwork
 */
function generateDefaultUrl(artworkName) {
  const slug = artworkName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return `https://anuschkaleather.in/collections/${slug}`;
}

/**
 * Generate placeholder image URL
 */
function generatePlaceholderImage(artworkName) {
  // Use a hash of the artwork name to get consistent placeholder images
  const hash = hashCode(artworkName);
  return `https://picsum.photos/400/400?random=${Math.abs(hash)}`;
}

/**
 * Simple hash function for consistent image generation
 */
function hashCode(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash;
}

/**
 * Get available themes from the data
 */
function getAvailableThemes(artworkData) {
  const themes = new Set();
  artworkData.forEach(artwork => {
    if (artwork.primaryTheme) {
      themes.add(artwork.primaryTheme);
    }
  });
  return Array.from(themes).sort();
}

/**
 * Get available product types from the data
 */
function getAvailableProductTypes(artworkData) {
  const types = new Set();
  artworkData.forEach(artwork => {
    if (artwork.productType) {
      types.add(artwork.productType);
    }
  });
  return Array.from(types).sort();
}

/**
 * Fallback data if Excel loading fails
 */
function getFallbackData() {
  return [
    {
      artworkName: "Abstract Leopard",
      artworkUrl: "https://anuschkaleather.in/collections/abstract-leopard",
      imageUrl: "https://picsum.photos/400/400?random=1",
      primaryTheme: "Animal",
      productType: "Bag",
      personalityTraits: "Vibrant and wild - for individuals who appreciate the spirit of adventure and are not afraid to stand out",
      designElements: "Floral Bloom, Soft Pastel Palette",
      overallPersonality: "Light, joyful, and nurturing",
      buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
      psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
    },
    {
      artworkName: "Boho Paisley",
      artworkUrl: "https://anuschkaleather.in/collections/boho-paisley",
      imageUrl: "https://picsum.photos/400/400?random=2",
      primaryTheme: "Pattern/Abstract",
      productType: "Bag",
      personalityTraits: "Bohemian and Free-Spirited - creative, nomadic, and expressive",
      designElements: "Floral Bloom, Soft Pastel Palette",
      overallPersonality: "Light, joyful, and nurturing",
      buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
      psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
    }
  ];
}

module.exports = router;
