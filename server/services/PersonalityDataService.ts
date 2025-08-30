import csv from 'csv-parser';
import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';
import { Question, BagRecommendation, ArtworkData, ProductTypeQuestion } from '../types/personalityTypes';

export class PersonalityDataService {
  private questionsData: Question[] = [];
  private bagsData: BagRecommendation[] = [];
  private artworkData: ArtworkData[] = [];
  private personalityTypes: string[] = [];
  private isDataLoaded = false;

  async loadAllData(): Promise<void> {
    try {
      await Promise.all([
        this.loadCSVData(),
        this.loadXLSXData()
      ]);

      this.extractPersonalityTypes();
      this.isDataLoaded = true;
      console.log('✅ Personality quiz data loaded successfully');
      console.log(`📝 Questions: ${this.questionsData.length}`);
      console.log(`👜 Bags: ${this.bagsData.length}`);
      console.log(`🎨 Artwork: ${this.artworkData.length}`);
      console.log(`👤 Personality Types: ${this.personalityTypes.length}`);
    } catch (error) {
      console.error('❌ Error loading personality quiz data:', error);
      throw error;
    }
  }

  private async loadCSVData(): Promise<void> {
    return new Promise((resolve, reject) => {
      const csvPath = path.join(process.cwd(), 'public', 'updated_ml_bags_personality_dataset_cleaned.csv');

      if (!fs.existsSync(csvPath)) {
        reject(new Error(`CSV file not found: ${csvPath}`));
        return;
      }

      const questions: Question[] = [];
      const bags: BagRecommendation[] = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (row) => {
          // Extract questions
          if (row.Question && row.Option_1) {
            questions.push({
              Question: row.Question,
              Option_1: row.Option_1,
              Option_1_Personality: row.Option_1_Personality,
              Option_2: row.Option_2,
              Option_2_Personality: row.Option_2_Personality,
              Option_3: row.Option_3,
              Option_3_Personality: row.Option_3_Personality,
              Option_4: row.Option_4,
              Option_4_Personality: row.Option_4_Personality,
            });
          }

          // Extract bag data
          if (row.Bag_Name && row.Personality_Description) {
            bags.push({
              Bag_Name: row.Bag_Name,
              Personality_Description: row.Personality_Description,
              Product_Link: row.Product_Link,
              Price: row.Price,
              Brand: row.Brand,
              Style: row.Style,
              Material: row.Material,
              Color: row.Color,
            });
          }
        })
        .on('end', () => {
          this.questionsData = questions;
          this.bagsData = bags;
          resolve();
        })
        .on('error', reject);
    });
  }

  private async loadXLSXData(): Promise<void> {
    try {
      const xlsxPath = path.join(process.cwd(), 'mapped_persona_artwork_data.xlsx');

      if (!fs.existsSync(xlsxPath)) {
        console.warn(`⚠️ XLSX file not found: ${xlsxPath}`);
        return;
      }

      const workbook = XLSX.readFile(xlsxPath);
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      // Log the first row to see all available columns
      if (rawData.length > 0) {
        console.log('📊 XLSX columns available:', Object.keys(rawData[0] as object));
      }

      this.artworkData = (rawData as Record<string, unknown>[]).map((row: Record<string, unknown>) => ({
        Personality_Type: String(row['Personality Traits'] || ''),
        Artwork_Description: String(row['Artwork Name'] || ''),
        Style_Characteristics: String(row['Artwork Name'] || ''),
        Color_Palette: '',
        Mood: '',
        // Use the actual column names from XLSX
        Product_Name: String(row['Product Name'] || ''),
        Artwork_Name: String(row['Artwork Name'] || ''),
        Image_URL: String(row['Image URL'] || ''),
        Product_URL: String(row['Product URL'] || ''),
      })).filter(item => item.Product_Name || item.Artwork_Name);

      console.log(`📊 Loaded ${this.artworkData.length} artwork items from XLSX`);
      if (this.artworkData.length > 0) {
        console.log('📊 Sample artwork item:', this.artworkData[0]);
      }

    } catch (error) {
      console.warn('⚠️ Error loading XLSX data:', error);
    }
  }

  private extractPersonalityTypes(): void {
    const personalities = new Set<string>();

    // From questions
    this.questionsData.forEach(question => {
      [question.Option_1_Personality, question.Option_2_Personality,
      question.Option_3_Personality, question.Option_4_Personality].forEach(p => {
        if (p) personalities.add(p);
      });
    });

    // From bags
    this.bagsData.forEach(bag => {
      if (bag.Personality_Description) {
        // Extract personality type from description if available
        const match = bag.Personality_Description.match(/(\w+)_\w+/);
        if (match) personalities.add(match[1]);
      }
    });

    // From artwork
    this.artworkData.forEach(art => {
      if (art.Personality_Type) personalities.add(art.Personality_Type);
    });

    this.personalityTypes = Array.from(personalities);
  }

  // Getters
  getQuestions(): Question[] {
    if (!this.isDataLoaded) throw new Error('Personality quiz data not loaded');
    return this.questionsData;
  }

  getBags(): BagRecommendation[] {
    if (!this.isDataLoaded) throw new Error('Personality quiz data not loaded');
    return this.bagsData;
  }

  getArtworkData(): ArtworkData[] {
    if (!this.isDataLoaded) throw new Error('Personality quiz data not loaded');
    return this.artworkData;
  }

  getPersonalityTypes(): string[] {
    if (!this.isDataLoaded) throw new Error('Personality quiz data not loaded');
    return this.personalityTypes;
  }

  getBagsByPersonality(personality: string): BagRecommendation[] {
    return this.bagsData.filter(bag =>
      bag.Personality_Description.toLowerCase().includes(personality.toLowerCase())
    );
  }

  getArtworkByPersonality(personality: string): ArtworkData | null {
    return this.artworkData.find(art =>
      art.Personality_Type.toLowerCase() === personality.toLowerCase()
    ) || null;
  }

  // Find product details by product name in XLSX data
  findProductDetails(productName: string): ArtworkData | null {
    return this.artworkData.find(art =>
      art.Product_Name && art.Product_Name.toLowerCase().includes(productName.toLowerCase())
    ) || null;
  }

  // Get all products with their artwork details
  getProductsWithArtwork(): Array<BagRecommendation & { artwork?: ArtworkData }> {
    return this.bagsData.map(bag => {
      const artwork = this.findProductDetails(bag.Bag_Name);
      return {
        ...bag,
        artwork: artwork || undefined
      };
    });
  }

  getProductTypeQuestion(): ProductTypeQuestion {
    return {
      question: "What type of bags do you normally carry.",
      options: [
        {
          label: "Wallets & Card Holders",
          value: "wallet",
          description: "Compact organizers for cards, cash, and essentials"
        },
        {
          label: "Crossbody Bags",
          value: "crossbody",
          description: "Hands-free bags worn across the body"
        },
        {
          label: "Satchels & Totes",
          value: "satchel",
          description: "Structured bags with handles and compartments"
        },
        {
          label: "Hobo Bags",
          value: "hobo",
          description: "Soft, slouchy shoulder bags"
        },
        {
          label: "Clutches & Evening Bags",
          value: "clutch",
          description: "Elegant handheld bags for special occasions"
        },
        {
          label: "Pouches & Organizers",
          value: "pouch",
          description: "Small bags for cosmetics, electronics, and travel"
        },
        {
          label: "Accessories & Charms",
          value: "accessory",
          description: "Bag charms, cuffs, and decorative items"
        }
      ]
    };
  }

  getBagsByProductType(productType: string): BagRecommendation[] {
    const typeKeywords = {
      wallet: ['wallet', 'coin pouch', 'card case', 'credit card', 'rfid', 'french wallet'],
      crossbody: ['crossbody', 'organizer crossbody', 'sling', 'messenger'],
      satchel: ['satchel', 'tote', 'multi compartment satchel', 'large satchel'],
      hobo: ['hobo', 'shoulder hobo', 'slim hobo', 'convertible hobo'],
      clutch: ['clutch', 'three fold clutch', 'evening'],
      pouch: ['pouch', 'cosmetic', 'zip pouch', 'travel organizer', 'eyeglass'],
      accessory: ['charm', 'cuff', 'key case', 'airpod']
    };

    const keywords = typeKeywords[productType as keyof typeof typeKeywords] || [];

    return this.bagsData.filter(bag => {
      const bagName = bag.Bag_Name.toLowerCase();
      return keywords.some(keyword => bagName.includes(keyword));
    });
  }

  getBagsByPersonalityAndProductType(personality: string, productType: string): BagRecommendation[] {
    const personalityBags = this.getBagsByPersonality(personality);
    const productTypeBags = this.getBagsByProductType(productType);

    // Find intersection of both filters
    const personalityBagNames = new Set(personalityBags.map(bag => bag.Bag_Name));
    const filteredBags = productTypeBags.filter(bag => personalityBagNames.has(bag.Bag_Name));

    // Deduplicate by artwork
    const uniqueArtworkBags = new Map<string, BagRecommendation>();
    filteredBags.forEach(bag => {
      const artworkDetails = this.findProductDetails(bag.Bag_Name);
      const artworkName = artworkDetails?.Artwork_Name || 'Unknown';

      if (!uniqueArtworkBags.has(artworkName)) {
        uniqueArtworkBags.set(artworkName, bag);
      }
    });

    return Array.from(uniqueArtworkBags.values());
  }

  getUniqueBagsByArtwork(bags: BagRecommendation[]): BagRecommendation[] {
    const uniqueArtworkBags = new Map<string, BagRecommendation>();
    const seenProductNames = new Set<string>();

    bags.forEach(bag => {
      const artworkDetails = this.findProductDetails(bag.Bag_Name);
      const artworkName = artworkDetails?.Artwork_Name || 'Unknown';
      const productName = artworkDetails?.Product_Name || bag.Bag_Name;

      // Skip if we've already seen this product
      if (seenProductNames.has(productName)) {
        return;
      }

      // Only keep the first product from each artwork
      if (!uniqueArtworkBags.has(artworkName)) {
        uniqueArtworkBags.set(artworkName, bag);
        seenProductNames.add(productName);
      }
    });

    return Array.from(uniqueArtworkBags.values());
  }
} 