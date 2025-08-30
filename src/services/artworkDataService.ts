import { Product } from '@/types/product';

export interface ArtworkData {
  artworkName: string;
  artworkUrl: string;
  imageUrl: string;
  primaryTheme: string;
  productType: string;
  personalityTraits: string;
  designElements?: string;
  overallPersonality?: string;
  buyerPersonalityMatch?: string;
  psychologicalAppeal?: string;
}

export interface ArtworkTheme {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  count: number;
  description: string;
}

export interface ProductType {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
  description: string;
}

export class ArtworkDataService {
  private artworkData: ArtworkData[] = [];
  private artworkThemes: ArtworkTheme[] = [];
  private productTypes: ProductType[] = [];

  constructor() {
    this.initializeData();
  }

  private async initializeData() {
    try {
      // Load artwork data from CSV
      await this.loadArtworkData();
      this.generateArtworkThemes();
      this.generateProductTypes();
    } catch (error) {
      console.error('Failed to initialize artwork data:', error);
    }
  }

  private async loadArtworkData() {
    try {
      console.log('🔄 Loading artwork data from API...');
      
      // Load data from the backend API endpoint
      const response = await fetch('/api/artwork-data');
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (result.success && result.data) {
        this.artworkData = result.data;
        console.log(`✅ Loaded ${this.artworkData.length} artwork items from API`);
        
        // Log available themes and product types for debugging
        if (result.themes) {
          console.log('🎨 Available themes:', result.themes);
        }
        if (result.productTypes) {
          console.log('👜 Available product types:', result.productTypes);
        }
      } else {
        throw new Error('Invalid API response format');
      }
      
    } catch (error) {
      console.error('❌ Failed to load artwork data from API:', error);
      console.log('🔄 Falling back to default data...');
      
      // Fallback to default data if API loading fails
      this.artworkData = [
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
  }

  private generateArtworkThemes() {
    const themeCounts = this.artworkData.reduce((acc, artwork) => {
      acc[artwork.primaryTheme] = (acc[artwork.primaryTheme] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    this.artworkThemes = [
      {
        id: 'animals',
        label: 'Animal (wildlife and majestic creatures)',
        value: 'Animal',
        icon: '🦁',
        color: 'from-orange-400 to-amber-500',
        count: themeCounts['Animal'] || 0,
        description: 'Wildlife-inspired designs for adventurous spirits'
      },
      {
        id: 'flowers_plants',
        label: 'Flowers/Plants (blooms and leafy calm)',
        value: 'Flowers/Plants',
        icon: '🌸',
        color: 'from-pink-400 to-rose-500',
        count: themeCounts['Flowers/Plants'] || 0,
        description: 'Nature-inspired patterns for peaceful souls'
      },
      {
        id: 'nature_landscape',
        label: 'Nature/Landscape (vistas and natural forms)',
        value: 'Nature/Landscape',
        icon: '🏔️',
        color: 'from-green-400 to-emerald-500',
        count: themeCounts['Nature/Landscape'] || 0,
        description: 'Landscape designs for nature lovers'
      },
      {
        id: 'pattern_abstract',
        label: 'Pattern/Abstract (abstract shapes and geometry)',
        value: 'Pattern/Abstract',
        icon: '🔷',
        color: 'from-purple-400 to-indigo-500',
        count: themeCounts['Pattern/Abstract'] || 0,
        description: 'Abstract patterns for creative minds'
      },
      {
        id: 'symbols_emblems',
        label: 'Symbols/Emblems (icons and meaningful symbols)',
        value: 'Symbols/Emblems',
        icon: '⚜️',
        color: 'from-blue-400 to-cyan-500',
        count: themeCounts['Symbols/Emblems'] || 0,
        description: 'Symbolic designs for meaningful expression'
      },
      {
        id: 'vehicles_transport',
        label: 'Vehicles/Transport',
        value: 'Vehicles/Transport',
        icon: '🚗',
        color: 'from-red-400 to-pink-500',
        count: themeCounts['Vehicles/Transport'] || 0,
        description: 'Transport-themed designs for travelers'
      },
      {
        id: 'food_drink',
        label: 'Food & Drink',
        value: 'Food & Drink',
        icon: '🍷',
        color: 'from-yellow-400 to-orange-500',
        count: themeCounts['Food & Drink'] || 0,
        description: 'Culinary-inspired designs for food enthusiasts'
      },
      {
        id: 'other',
        label: 'Other (Unspecified)',
        value: 'Other (Unspecified)',
        icon: '❓',
        color: 'from-gray-400 to-slate-500',
        count: themeCounts['Other (Unspecified)'] || 0,
        description: 'Unique and eclectic designs'
      }
    ];
  }

  private generateProductTypes() {
    this.productTypes = [
      {
        id: 'bag',
        label: 'Bag (versatile for anything)',
        value: 'Bag',
        icon: '👜',
        color: 'from-brown-400 to-amber-600',
        description: 'Classic handbags for everyday use'
      },
      {
        id: 'tote',
        label: 'Tote (big carry-all)',
        value: 'Tote',
        icon: '🛍️',
        color: 'from-blue-400 to-indigo-500',
        description: 'Spacious totes for carrying everything'
      },
      {
        id: 'crossbody',
        label: 'Crossbody (hands-free)',
        value: 'Crossbody',
        icon: '💼',
        color: 'from-green-400 to-teal-500',
        description: 'Hands-free crossbody bags'
      },
      {
        id: 'pouch',
        label: 'Pouch (small essentials)',
        value: 'Pouch',
        icon: '👛',
        color: 'from-pink-400 to-rose-500',
        description: 'Compact pouches for essentials'
      },
      {
        id: 'case',
        label: 'Case (protects devices)',
        value: 'Case',
        icon: '💻',
        color: 'from-purple-400 to-violet-500',
        description: 'Protective cases for devices'
      },
      {
        id: 'hobo',
        label: 'Hobo (soft & slouchy)',
        value: 'Hobo',
        icon: '👜',
        color: 'from-orange-400 to-red-500',
        description: 'Soft, slouchy hobo bags'
      }
    ];
  }

  public getArtworkThemes(): ArtworkTheme[] {
    return this.artworkThemes;
  }

  public getProductTypes(): ProductType[] {
    return this.productTypes;
  }

  public getArtworkByTheme(theme: string): ArtworkData[] {
    return this.artworkData.filter(artwork => artwork.primaryTheme === theme);
  }

  public getArtworkByProductType(productType: string): ArtworkData[] {
    return this.artworkData.filter(artwork => artwork.productType === productType);
  }

  public getArtworkByThemeAndProductType(theme: string, productType: string): ArtworkData[] {
    return this.artworkData.filter(artwork => 
      artwork.primaryTheme === theme && artwork.productType === productType
    );
  }

  public getArtworkByPersonality(personality: string, sentiment: string): ArtworkData[] {
    // Filter artwork based on personality and sentiment
    return this.artworkData.filter(artwork => {
      const personalityMatch = this.calculatePersonalityMatch(artwork, personality, sentiment);
      return personalityMatch > 0.6; // Return artwork with >60% personality match
    });
  }

  private calculatePersonalityMatch(artwork: ArtworkData, personality: string, sentiment: string): number {
    let score = 0;
    
    // Check personality traits alignment (40% weight)
    const personalityLower = personality.toLowerCase();
    const traitsLower = artwork.personalityTraits.toLowerCase();
    
    // Direct personality match
    if (traitsLower.includes(personalityLower)) {
      score += 0.4;
    }
    
    // Partial personality matches
    if (personalityLower === 'adventurous' && (traitsLower.includes('wild') || traitsLower.includes('adventure') || traitsLower.includes('explorative'))) {
      score += 0.3;
    } else if (personalityLower === 'unique' && (traitsLower.includes('creative') || traitsLower.includes('bohemian') || traitsLower.includes('free-spirited'))) {
      score += 0.3;
    } else if (personalityLower === 'elegant' && (traitsLower.includes('elegant') || traitsLower.includes('sophisticated') || traitsLower.includes('refined'))) {
      score += 0.3;
    }
    
    // Check sentiment alignment (30% weight)
    if (artwork.psychologicalAppeal) {
      const appealLower = artwork.psychologicalAppeal.toLowerCase();
      
      if (sentiment === 'Positive' && (appealLower.includes('joy') || appealLower.includes('positive') || appealLower.includes('luminous') || appealLower.includes('warm'))) {
        score += 0.3;
      } else if (sentiment === 'Balanced' && (appealLower.includes('calm') || appealLower.includes('balanced') || appealLower.includes('tranquil') || appealLower.includes('serene'))) {
        score += 0.3;
      } else if (sentiment === 'Negative' && (appealLower.includes('introspective') || appealLower.includes('deep') || appealLower.includes('cosmic') || appealLower.includes('contemplative'))) {
        score += 0.3;
      }
    }
    
    // Check buyer personality match (30% weight)
    if (artwork.buyerPersonalityMatch) {
      const buyerLower = artwork.buyerPersonalityMatch.toLowerCase();
      
      if (personality === 'Unique' && (buyerLower.includes('creative') || buyerLower.includes('imaginative') || buyerLower.includes('artistic'))) {
        score += 0.3;
      } else if (personality === 'Adventurous' && (buyerLower.includes('adventurous') || buyerLower.includes('outgoing') || buyerLower.includes('energetic'))) {
        score += 0.3;
      } else if (personality === 'Elegant' && (buyerLower.includes('elegant') || buyerLower.includes('sophisticated') || buyerLower.includes('refined'))) {
        score += 0.3;
      }
    }
    
    // Bonus points for theme alignment
    if (artwork.primaryTheme === 'Animal' && personality === 'Adventurous') {
      score += 0.1;
    } else if (artwork.primaryTheme === 'Pattern/Abstract' && personality === 'Unique') {
      score += 0.1;
    } else if (artwork.primaryTheme === 'Flowers/Plants' && personality === 'Elegant') {
      score += 0.1;
    }
    
    return Math.min(score, 1.0);
  }

  public convertArtworkToProduct(artwork: ArtworkData): Product {
    return {
      id: artwork.artworkName.toLowerCase().replace(/\s+/g, '-'),
      name: artwork.artworkName,
      artworkName: artwork.artworkName,
      productName: `${artwork.artworkName} ${artwork.productType}`,
      price: '$150-$300', // Default price range
      image: artwork.imageUrl,
      link: artwork.artworkUrl,
      productType: artwork.productType,
      description: artwork.personalityTraits,
      psychologicalAppeal: artwork.psychologicalAppeal,
      artworkPersonality: artwork.overallPersonality,
      personaDescription: artwork.buyerPersonalityMatch
    };
  }

  public getPersonalizedRecommendations(
    theme: string,
    productType: string,
    personality: string,
    sentiment: string,
    limit: number = 12
  ): Product[] {
    // Get artwork that matches the theme and product type
    let matchingArtwork = this.getArtworkByThemeAndProductType(theme, productType);
    
    // If no exact matches, get artwork by theme only
    if (matchingArtwork.length === 0) {
      matchingArtwork = this.getArtworkByTheme(theme);
    }
    
    // If still no matches, get artwork by product type only
    if (matchingArtwork.length === 0) {
      matchingArtwork = this.getArtworkByProductType(productType);
    }
    
    // If still no matches, get all artwork
    if (matchingArtwork.length === 0) {
      matchingArtwork = this.artworkData;
    }
    
    // Score artwork based on personality match
    const scoredArtwork = matchingArtwork.map(artwork => ({
      artwork,
      score: this.calculatePersonalityMatch(artwork, personality, sentiment)
    }));
    
    // Sort by score and take top recommendations
    const topArtwork = scoredArtwork
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(item => item.artwork);
    
    // Convert to Product format
    return topArtwork.map(artwork => this.convertArtworkToProduct(artwork));
  }
}

export const artworkDataService = new ArtworkDataService();
