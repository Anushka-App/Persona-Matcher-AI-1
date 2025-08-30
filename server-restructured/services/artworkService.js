/**
 * Artwork service
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const config = require('../config/config');

class ArtworkService {
  constructor() {
    this.artworkData = new Map();
    this.isLoaded = false;
  }
  
  /**
   * Load artwork data from CSV or Excel file
   */
  async loadArtworkData() {
    if (this.isLoaded) return Array.from(this.artworkData.values());
    
    const filePath = path.resolve(__dirname, '..', config.paths.artworkPersonalityPath);
    
    if (!fs.existsSync(filePath)) {
      console.warn('⚠️ Artwork personality file not found:', filePath);
      return [];
    }
    
    try {
      const results = [];
      
      if (filePath.endsWith('.xlsx') || filePath.endsWith('.xls')) {
        // Handle Excel files
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rawData = xlsx.utils.sheet_to_json(sheet, { defval: '' });
        
        rawData.forEach((data) => {
          const artworkData = {
            artworkName: data['Artwork Name'] || data['ArtworkName'] || '',
            artworkUrl: data['Artwork URL'] || data['ArtworkURL'] || '',
            imageUrl: data['Image URL'] || data['ImageURL'] || '',
            designElements: data['Design Elements'] || data['DesignElements'] || '',
            overallPersonality: data['Overall Personality of Artwork'] || data['OverallPersonality'] || '',
            buyerPersonalityMatch: data['Buyer Personality Match'] || data['BuyerPersonalityMatch'] || '',
            psychologicalAppeal: data['Psychological Appeal'] || data['PsychologicalAppeal'] || '',
            artworkDescription: data['Psychological Appeal'] || data['PsychologicalAppeal'] || ''
          };
          
          if (artworkData.artworkName) {
            results.push(artworkData);
            this.artworkData.set(artworkData.artworkName.toLowerCase(), artworkData);
          }
        });
      } else {
        // Handle CSV files
        return new Promise((resolve, reject) => {
          fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
              const artworkData = {
                artworkName: data['Artwork Name'] || data['ArtworkName'] || '',
                artworkUrl: data['Artwork URL'] || data['ArtworkURL'] || '',
                imageUrl: data['Image URL'] || data['ImageURL'] || '',
                designElements: data['Design Elements'] || data['DesignElements'] || '',
                overallPersonality: data['Overall Personality of Artwork'] || data['OverallPersonality'] || '',
                buyerPersonalityMatch: data['Buyer Personality Match'] || data['BuyerPersonalityMatch'] || '',
                psychologicalAppeal: data['Psychological Appeal'] || data['PsychologicalAppeal'] || '',
                artworkDescription: data['Psychological Appeal'] || data['PsychologicalAppeal'] || ''
              };
              
              if (artworkData.artworkName) {
                results.push(artworkData);
                this.artworkData.set(artworkData.artworkName.toLowerCase(), artworkData);
              }
            })
            .on('end', () => {
              console.log(`✅ Loaded ${results.length} artwork personality descriptions from CSV`);
              this.isLoaded = true;
              resolve(results);
            })
            .on('error', (error) => {
              console.error('❌ Error loading artwork personality CSV:', error);
              reject(error);
            });
        });
      }
      
      console.log(`✅ Loaded ${results.length} artwork personality descriptions from Excel`);
      this.isLoaded = true;
      return results;
      
    } catch (error) {
      console.error('❌ Error loading artwork data:', error);
      return [];
    }
  }
  
  /**
   * Get all artwork data
   */
  async getAllArtworkData() {
    if (!this.isLoaded) {
      await this.loadArtworkData();
    }
    return Array.from(this.artworkData.values());
  }
  
  /**
   * Get artwork by name
   */
  async getArtworkByName(artworkName) {
    if (!this.isLoaded) {
      await this.loadArtworkData();
    }
    
    const normalizedName = artworkName.toLowerCase();
    return this.artworkData.get(normalizedName) || null;
  }
  
  /**
   * Search artwork by name
   */
  async searchArtworkByName(searchTerm) {
    if (!this.isLoaded) {
      await this.loadArtworkData();
    }
    
    const normalizedSearch = searchTerm.toLowerCase();
    return Array.from(this.artworkData.values()).filter(artwork =>
      artwork.artworkName.toLowerCase().includes(normalizedSearch)
    );
  }
  
  /**
   * Categorize artwork by theme
   */
  categorizeArtworkTheme(artworkName) {
    if (!this.isLoaded) {
      console.warn('⚠️ Artwork data not loaded yet');
      return 'Other (Unspecified)';
    }
    
    const normalizedName = artworkName.toLowerCase();
    const artwork = this.artworkData.get(normalizedName);
    
    if (!artwork) {
      return 'Other (Unspecified)';
    }
    
    const designElements = artwork.designElements?.toLowerCase() || '';
    const searchText = `${normalizedName} ${designElements}`.toLowerCase();
    
    // Animals category
    if (this.matchesKeywords(searchText, [
      'leopard', 'elephant', 'tiger', 'safari', 'jungle', 'animal', 'wildlife', 'bird', 'cat', 'owl', 'panda', 
      'deer', 'lion', 'african', 'amazon', 'cleopatra', 'imperial', 'king', 'queen', 'savanna', 'tropical',
      'gentle giant', 'happy panda', 'siamese', 'wise owl', 'cardinal', 'wolf', 'wolves'
    ])) {
      return 'Animals';
    }
    
    // Flowers/Plants category
    if (this.matchesKeywords(searchText, [
      'garden', 'floral', 'flower', 'bloom', 'rose', 'lily', 'lotus', 'peony', 'botanical', 'plant',
      'bel fiori', 'butterfly blooms', 'camellia', 'caribbean', 'crimson', 'dancing leaves',
      'dreamy', 'earth song', 'enchanted', 'ethereal', 'paradise', 'passion', 'magical', 'midnight',
      'orchid', 'poppy', 'tropical bloom', 'tulip', 'zen', 'jardin', 'romantic', 'peonies'
    ])) {
      return 'Flowers/Plants';
    }
    
    // Nature/Landscape category
    if (this.matchesKeywords(searchText, [
      'canyon', 'sea', 'reef', 'forest', 'mountain', 'landscape', 'nature', 'starry', 'meadow',
      'gift of the sea', 'mystical reef', 'paradise found', 'turtle cove', 'rainforest', 'japanese',
      'whimsical forest', 'mystic forest', 'island escape', 'night', 'vista', 'scenery'
    ])) {
      return 'Nature/Landscape';
    }
    
    // Pattern/Abstract category
    if (this.matchesKeywords(searchText, [
      'embossed', 'mandala', 'paisley', 'mosaic', 'pattern', 'abstract', 'geometric', 'tooled',
      'basket', 'croc', 'herringbone', 'boho', 'denim', 'indian', 'city lights', 'modern', 'artistic'
    ])) {
      return 'Pattern/Abstract';
    }
    
    // Symbols/Emblems category
    if (this.matchesKeywords(searchText, [
      'wings', 'skull', 'dragon', 'legend', 'dream', 'heritage', 'symbol', 'emblem', 'cultural',
      'angel', 'calaveras', 'feather', 'high roller', 'love in paris', 'city of dreams', 'painted',
      'hope', 'free spirit', 'guiding light', 'meaningful', 'timeless'
    ])) {
      return 'Symbols/Emblems';
    }
    
    // Default to Other
    return 'Other (Unspecified)';
  }
  
  /**
   * Check if search text matches any keywords
   */
  matchesKeywords(searchText, keywords) {
    return keywords.some(keyword => searchText.includes(keyword));
  }
  
  /**
   * Get artworks by theme
   */
  async getArtworksByTheme(theme) {
    if (!this.isLoaded) {
      await this.loadArtworkData();
    }
    
    const artworks = Array.from(this.artworkData.values());
    return artworks.filter(artwork => 
      this.categorizeArtworkTheme(artwork.artworkName) === theme
    );
  }
}

module.exports = new ArtworkService();
