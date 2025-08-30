import * as fs from 'fs';
import * as path from 'path';
import csv from 'csv-parser';

export interface ArtworkPersonalityData {
  artworkName: string;
  artworkUrl: string;
  imageUrl: string;
  designElements: string;
  overallPersonality: string;
  buyerPersonalityMatch: string;
  psychologicalAppeal: string;
  artworkDescription?: string;
}

export class ArtworkPersonalityService {
  private artworkData: Map<string, ArtworkPersonalityData> = new Map();
  private isLoaded: boolean = false;

  async loadArtworkPersonalityData(): Promise<void> {
    if (this.isLoaded) return;

    // Use the correct CSV file that exists in the root directory
    const csvPath = path.join(process.cwd(), 'artwork_primary_theme_and_product.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.warn('⚠️ Artwork personality CSV file not found:', csvPath);
      return;
    }

    return new Promise((resolve, reject) => {
      const results: ArtworkPersonalityData[] = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          const artworkData: ArtworkPersonalityData = {
            artworkName: data['Artwork Name'] || '',
            artworkUrl: data['Artwork URL'] || '',
            imageUrl: '', // This CSV doesn't have image URLs
            designElements: data['primary_theme'] || '',
            overallPersonality: data['Personality Traits'] || '',
            buyerPersonalityMatch: data['Personality Traits'] || '', // Use personality traits as buyer match
            psychologicalAppeal: data['Personality Traits'] || '',
            artworkDescription: this.generateArtworkDescription(data['Personality Traits'] || '')
          };

          if (artworkData.artworkName) {
            results.push(artworkData);
            this.artworkData.set(artworkData.artworkName.toLowerCase(), artworkData);
          }
        })
        .on('end', () => {
          console.log(`✅ Loaded ${results.length} artwork personality descriptions from ${csvPath}`);
          this.isLoaded = true;
          resolve();
        })
        .on('error', (error) => {
          console.error('❌ Error loading artwork personality CSV:', error);
          reject(error);
        });
    });
  }

  private generateArtworkDescription(psychologicalAppeal: string): string {
    // Direct return of psychological appeal - no LLM processing
    return psychologicalAppeal || '';
  }

  getArtworkPersonality(artworkName: string): ArtworkPersonalityData | null {
    if (!this.isLoaded) {
      console.warn('⚠️ Artwork personality data not loaded yet');
      return null;
    }

    const normalizedName = artworkName.toLowerCase();
    return this.artworkData.get(normalizedName) || null;
  }

  getAllArtworkData(): ArtworkPersonalityData[] {
    return Array.from(this.artworkData.values());
  }

  searchArtworkByName(searchTerm: string): ArtworkPersonalityData[] {
    if (!this.isLoaded) return [];

    const normalizedSearch = searchTerm.toLowerCase();
    return Array.from(this.artworkData.values()).filter(artwork =>
      artwork.artworkName.toLowerCase().includes(normalizedSearch)
    );
  }

  getArtworkDescription(artworkName: string): string {
    const artwork = this.getArtworkPersonality(artworkName);
    return artwork?.artworkDescription || artwork?.psychologicalAppeal || '';
  }

  /**
   * Categorize artwork by theme based on name and design elements
   */
  categorizeArtworkTheme(artworkName: string): string {
    const normalizedName = artworkName.toLowerCase();
    const artwork = this.getArtworkPersonality(artworkName);
    const designElements = artwork?.designElements?.toLowerCase() || '';
    const searchText = `${normalizedName} ${designElements}`.toLowerCase();

    // Animals category - Safari/Wildlife themes
    if (this.matchesKeywords(searchText, [
      'leopard', 'elephant', 'tiger', 'safari', 'jungle', 'animal', 'wildlife', 'bird', 'cat', 'owl', 'panda', 
      'deer', 'lion', 'african', 'amazon', 'cleopatra', 'imperial', 'king', 'queen', 'savanna', 'tropical',
      'gentle giant', 'happy panda', 'siamese', 'wise owl', 'cardinal', 'wolf', 'wolves'
    ])) {
      return 'Animals';
    }

    // Flowers/Plants category - Botanical/Garden themes  
    if (this.matchesKeywords(searchText, [
      'garden', 'floral', 'flower', 'bloom', 'rose', 'lily', 'lotus', 'peony', 'botanical', 'plant',
      'bel fiori', 'butterfly blooms', 'camellia', 'caribbean', 'crimson', 'dancing leaves',
      'dreamy', 'earth song', 'enchanted', 'ethereal', 'paradise', 'passion', 'magical', 'midnight',
      'orchid', 'poppy', 'tropical bloom', 'tulip', 'zen', 'jardin', 'romantic', 'peonies'
    ])) {
      return 'Flowers/Plants';
    }

    // Nature/Landscape category - Natural scenery
    if (this.matchesKeywords(searchText, [
      'canyon', 'sea', 'reef', 'forest', 'mountain', 'landscape', 'nature', 'starry', 'meadow',
      'gift of the sea', 'mystical reef', 'paradise found', 'turtle cove', 'rainforest', 'japanese',
      'whimsical forest', 'mystic forest', 'island escape', 'night', 'vista', 'scenery'
    ])) {
      return 'Nature/Landscape';
    }

    // Pattern/Abstract category - Geometric and abstract patterns
    if (this.matchesKeywords(searchText, [
      'embossed', 'mandala', 'paisley', 'mosaic', 'pattern', 'abstract', 'geometric', 'tooled',
      'basket', 'croc', 'herringbone', 'boho', 'denim', 'indian', 'city lights', 'modern', 'artistic'
    ])) {
      return 'Pattern/Abstract';
    }

    // Symbols/Emblems category - Cultural symbols and meaningful emblems
    if (this.matchesKeywords(searchText, [
      'wings', 'skull', 'dragon', 'legend', 'dream', 'heritage', 'symbol', 'emblem', 'cultural',
      'angel', 'calaveras', 'feather', 'high roller', 'love in paris', 'city of dreams', 'painted',
      'hope', 'free spirit', 'guiding light', 'meaningful', 'timeless'
    ])) {
      return 'Symbols/Emblems';
    }

    // Default to Other (Unspecified)
    return 'Other (Unspecified)';
  }

  /**
   * Check if search text matches any of the provided keywords
   */
  private matchesKeywords(searchText: string, keywords: string[]): boolean {
    return keywords.some(keyword => searchText.includes(keyword));
  }

  /**
   * Get artworks by theme category
   */
  getArtworksByTheme(theme: string): ArtworkPersonalityData[] {
    if (!this.isLoaded) return [];

    return Array.from(this.artworkData.values()).filter(artwork => 
      this.categorizeArtworkTheme(artwork.artworkName) === theme
    );
  }
}
