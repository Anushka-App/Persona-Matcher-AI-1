import * as XLSX from 'xlsx';
import { ArtworkData } from './artworkDataService';

export interface ExcelArtworkRow {
  artworkName?: string;
  artworkUrl?: string;
  imageUrl?: string;
  primaryTheme?: string;
  productType?: string;
  personalityTraits?: string;
  designElements?: string;
  overallPersonality?: string;
  buyerPersonalityMatch?: string;
  psychologicalAppeal?: string;
  [key: string]: any; // Allow for additional columns
}

export class ExcelDataLoader {
  private readonly excelFilePath = '/mapped_persona_artwork_data.xlsx';

  /**
   * Load artwork data from Excel file
   */
  public async loadArtworkData(): Promise<ArtworkData[]> {
    try {
      console.log('📊 Loading artwork data from Excel file...');
      
      // Fetch the Excel file
      const response = await fetch(this.excelFilePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch Excel file: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      
      // Get the first sheet
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON
      const rawData = XLSX.utils.sheet_to_json(worksheet) as ExcelArtworkRow[];
      
      console.log(`📊 Loaded ${rawData.length} rows from Excel file`);
      
      // Transform and validate the data
      const artworkData = this.transformExcelData(rawData);
      
      console.log(`✅ Successfully processed ${artworkData.length} artwork items`);
      return artworkData;
      
    } catch (error) {
      console.error('❌ Error loading Excel data:', error);
      
      // Return fallback data if Excel loading fails
      return this.getFallbackData();
    }
  }

  /**
   * Transform Excel data to ArtworkData format
   */
  private transformExcelData(rawData: ExcelArtworkRow[]): ArtworkData[] {
    const artworkData: ArtworkData[] = [];
    
    for (const row of rawData) {
      try {
        // Skip rows without essential data
        if (!row.artworkName || !row.primaryTheme || !row.productType) {
          continue;
        }

        // Clean and validate the data
        const artwork: ArtworkData = {
          artworkName: this.cleanString(row.artworkName),
          artworkUrl: this.cleanString(row.artworkUrl) || this.generateDefaultUrl(row.artworkName),
          imageUrl: this.cleanString(row.imageUrl) || this.generatePlaceholderImage(row.artworkName),
          primaryTheme: this.cleanString(row.primaryTheme),
          productType: this.cleanString(row.productType),
          personalityTraits: this.cleanString(row.personalityTraits) || 'Unique and expressive design',
          designElements: this.cleanString(row.designElements),
          overallPersonality: this.cleanString(row.overallPersonality) || 'Distinctive and creative',
          buyerPersonalityMatch: this.cleanString(row.buyerPersonalityMatch) || 'Creative and artistic individuals',
          psychologicalAppeal: this.cleanString(row.psychologicalAppeal) || 'Appeals to those who appreciate unique design'
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
  private cleanString(value: any): string | undefined {
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
  private generateDefaultUrl(artworkName: string): string {
    const slug = artworkName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    return `https://anuschkaleather.in/collections/${slug}`;
  }

  /**
   * Generate placeholder image URL
   */
  private generatePlaceholderImage(artworkName: string): string {
    // Use a hash of the artwork name to get consistent placeholder images
    const hash = this.hashCode(artworkName);
    return `https://picsum.photos/400/400?random=${Math.abs(hash)}`;
  }

  /**
   * Simple hash function for consistent image generation
   */
  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash;
  }

  /**
   * Fallback data if Excel loading fails
   */
  private getFallbackData(): ArtworkData[] {
    console.log('🔄 Using fallback artwork data...');
    
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

  /**
   * Get available themes from the data
   */
  public getAvailableThemes(artworkData: ArtworkData[]): string[] {
    const themes = new Set<string>();
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
  public getAvailableProductTypes(artworkData: ArtworkData[]): string[] {
    const types = new Set<string>();
    artworkData.forEach(artwork => {
      if (artwork.productType) {
        types.add(artwork.productType);
      }
    });
    return Array.from(types).sort();
  }
}

export const excelDataLoader = new ExcelDataLoader();
