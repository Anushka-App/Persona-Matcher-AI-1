import fs from 'fs';
import path from 'path';
import csv from 'csv-parser';
import { spawn } from 'child_process';

export interface PersonalityDatasetEntry {
  Bag_Name: string;
  Personality_Type: string;
  Personality_Description: string;
  Product_Link: string;
  Question: string;
  Option_1: string;
  Option_1_Personality: string;
  Option_2: string;
  Option_2_Personality: string;
  Option_3: string;
  Option_3_Personality: string;
  Option_4: string;
  Option_4_Personality: string;
}

export interface ArtworkDataEntry {
  Artwork_Name: string;
  Artwork_URL: string;
  Product_Name: string;
  Product_URL: string;
  Image_URL: string;
  Price: string;
  Personality_Traits: string;
}

export interface EnhancedPersonalityType {
  name: string;
  description: string;
  bags: Array<{
    name: string;
    link: string;
    imageUrl?: string;
    price?: string;
    artworkName?: string;
  }>;
  artworkProducts: Array<{
    name: string;
    link: string;
    imageUrl: string;
    price: string;
    artworkName: string;
    personalityDescription: string;
  }>;
  questions: Array<{
    question: string;
    options: Array<{
      text: string;
      personality: string;
    }>;
  }>;
}

export interface EnhancedPersonalityAnalysis {
  personalityType: string;
  description: string;
  strengths: string[];
  insights: string[];
  recommendations: string[];
  products: string[];
  matchedBags: Array<{
    name: string;
    link: string;
    reason: string;
    imageUrl?: string;
    price?: string;
  }>;
  matchedArtwork: Array<{
    name: string;
    link: string;
    imageUrl: string;
    price: string;
    artworkName: string;
    personalityDescription: string;
  }>;
  sentiment: string;
  detailedAnalysis: string;
  llmInsights?: string;
  styleRecommendations?: string[];
  lifestyleAdvice?: string[];
}

class EnhancedPersonalityLoader {
  private personalityDataset: PersonalityDatasetEntry[] = [];
  private artworkDataset: ArtworkDataEntry[] = [];
  private personalityTypes: Map<string, EnhancedPersonalityType> = new Map();
  private isLoaded = false;

  async loadAllDatasets(): Promise<void> {
    if (this.isLoaded) return;

    console.log('Loading enhanced personality datasets...');
    
    // Load CSV personality dataset
    await this.loadPersonalityDataset();
    
    // Load Excel artwork dataset
    await this.loadArtworkDataset();
    
    // Process and combine data
    this.processEnhancedPersonalityTypes();
    
    this.isLoaded = true;
    console.log('Enhanced personality datasets loaded successfully');
  }

  private async loadPersonalityDataset(): Promise<void> {
    return new Promise((resolve, reject) => {
      const csvPath = path.join(process.cwd(), 'updated_ml_bags_personality_dataset_cleaned.csv');
      console.log('Loading personality CSV from:', csvPath);
      
      if (!fs.existsSync(csvPath)) {
        reject(new Error(`Personality CSV file not found at: ${csvPath}`));
        return;
      }
      
      const results: PersonalityDatasetEntry[] = [];

      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', () => {
          this.personalityDataset = results;
          console.log(`Loaded ${this.personalityDataset.length} personality dataset entries`);
          resolve();
        })
        .on('error', (error) => {
          console.error('Error loading personality CSV:', error);
          reject(error);
        });
    });
  }

  private async loadArtworkDataset(): Promise<void> {
    return new Promise((resolve, reject) => {
              const excelPath = path.join(process.cwd(), '..', 'mapped_persona_artwork_data.xlsx');
      console.log('Loading artwork Excel from:', excelPath);
      
      if (!fs.existsSync(excelPath)) {
        console.warn('Artwork Excel file not found, continuing without artwork data');
        resolve();
        return;
      }

      // Use Python to read Excel file
      const pythonProcess = spawn('python', [
        '-c',
        `import pandas as pd; import json; df = pd.read_excel('${excelPath}'); print(json.dumps(df.to_dict('records')))`
      ]);

      let data = '';
      let error = '';

      pythonProcess.stdout.on('data', (chunk) => {
        data += chunk.toString();
      });

      pythonProcess.stderr.on('data', (chunk) => {
        error += chunk.toString();
      });

      pythonProcess.on('close', (code) => {
        if (code === 0 && data) {
          try {
            this.artworkDataset = JSON.parse(data.trim());
            console.log(`Loaded ${this.artworkDataset.length} artwork dataset entries`);
            resolve();
          } catch (parseError) {
            console.error('Error parsing artwork data:', parseError);
            reject(parseError);
          }
        } else {
          console.warn('Could not load artwork data:', error);
          resolve(); // Continue without artwork data
        }
      });

      pythonProcess.on('error', (error) => {
        console.warn('Could not execute Python for artwork data:', error);
        resolve(); // Continue without artwork data
      });
    });
  }

  private processEnhancedPersonalityTypes(): void {
    // Group personality data by personality type
    const personalityGroups = new Map<string, PersonalityDatasetEntry[]>();
    
    this.personalityDataset.forEach(entry => {
      if (!personalityGroups.has(entry.Personality_Type)) {
        personalityGroups.set(entry.Personality_Type, []);
      }
      personalityGroups.get(entry.Personality_Type)!.push(entry);
    });

    // Create enhanced personality type objects
    personalityGroups.forEach((entries, personalityName) => {
      const bags = entries.map(entry => ({
        name: entry.Bag_Name,
        link: entry.Product_Link
      }));

      const questions = this.extractUniqueQuestions(entries);

      // Find matching artwork products
      const artworkProducts = this.findMatchingArtwork(personalityName);

      this.personalityTypes.set(personalityName, {
        name: personalityName,
        description: entries[0].Personality_Description,
        bags,
        artworkProducts,
        questions
      });
    });
  }

  private findMatchingArtwork(personalityName: string): Array<{
    name: string;
    link: string;
    imageUrl: string;
    price: string;
    artworkName: string;
    personalityDescription: string;
  }> {
    const matchingArtwork: Array<{
      name: string;
      link: string;
      imageUrl: string;
      price: string;
      artworkName: string;
      personalityDescription: string;
    }> = [];

    this.artworkDataset.forEach(entry => {
      // Extract personality descriptions from the traits field
      const traitsText = entry.Personality_Traits || '';
      
      // Look for personality matches in the traits text
      if (traitsText.toLowerCase().includes(personalityName.toLowerCase()) ||
          this.isPersonalityMatch(personalityName, traitsText)) {
        
        matchingArtwork.push({
          name: entry.Product_Name,
          link: entry.Product_URL,
          imageUrl: entry.Image_URL,
          price: entry.Price,
          artworkName: entry.Artwork_Name,
          personalityDescription: this.extractPersonalityDescription(traitsText, entry.Product_Name)
        });
      }
    });

    return matchingArtwork.slice(0, 12); // Limit to 12 artwork products
  }

  private isPersonalityMatch(personalityName: string, traitsText: string): boolean {
    const personalityKeywords: Record<string, string[]> = {
      'Savannah Spirit': ['bold', 'adventurous', 'wild', 'untamed', 'lion', 'safari'],
      'Enchanted Rose': ['romantic', 'magical', 'vintage', 'rose', 'enchanted', 'delicate'],
      'Retro Muse': ['nostalgic', 'trendy', 'creative', 'retro', 'vintage', 'classic'],
      'Roaring Majesty': ['powerful', 'commanding', 'confident', 'majestic', 'royal'],
      'Dreamscape Urbanite': ['ambitious', 'visionary', 'urban', 'modern', 'city'],
      'Wolf Moon': ['loyal', 'strong', 'instinctive', 'wolf', 'moon', 'protective'],
      'Metamorph Muse': ['transformative', 'adaptable', 'evolving', 'change', 'growth'],
      'Flutter Charm': ['playful', 'delicate', 'lively', 'butterfly', 'charm', 'light'],
      'Caribbean Dreamer': ['vibrant', 'colorful', 'free-spirited', 'island', 'tropical'],
      'Crimson Blossom': ['bold', 'passionate', 'fiery', 'crimson', 'blossom', 'strong']
    };

    const keywords = personalityKeywords[personalityName] || [];
    return keywords.some(keyword => traitsText.toLowerCase().includes(keyword.toLowerCase()));
  }

  private extractPersonalityDescription(traitsText: string, productName: string): string {
    // Extract the specific product description from the traits text
    const lines = traitsText.split('\n');
    for (const line of lines) {
      if (line.includes(productName)) {
        const match = line.match(/:"([^"]+)"/);
        return match ? match[1] : `Perfect match for your unique personality and style preferences.`;
      }
    }
    return `This beautiful piece reflects your unique personality and style.`;
  }

  private extractUniqueQuestions(entries: PersonalityDatasetEntry[]): Array<{
    question: string;
    options: Array<{
      text: string;
      personality: string;
    }>;
  }> {
    const questionMap = new Map<string, Set<string>>();
    const personalityMap = new Map<string, Map<string, string>>();

    entries.forEach(entry => {
      if (!questionMap.has(entry.Question)) {
        questionMap.set(entry.Question, new Set());
        personalityMap.set(entry.Question, new Map());
      }

      const options = [
        { text: entry.Option_1, personality: entry.Option_1_Personality },
        { text: entry.Option_2, personality: entry.Option_2_Personality },
        { text: entry.Option_3, personality: entry.Option_3_Personality },
        { text: entry.Option_4, personality: entry.Option_4_Personality }
      ];

      options.forEach(option => {
        if (option.text && option.personality) {
          questionMap.get(entry.Question)!.add(option.text);
          personalityMap.get(entry.Question)!.set(option.text, option.personality);
        }
      });
    });

    return Array.from(questionMap.entries()).map(([question, optionsSet]) => ({
      question,
      options: Array.from(optionsSet).map(optionText => ({
        text: optionText,
        personality: personalityMap.get(question)!.get(optionText) || 'Unknown'
      }))
    }));
  }

  getPersonalityTypes(): EnhancedPersonalityType[] {
    return Array.from(this.personalityTypes.values());
  }

  getPersonalityType(name: string): EnhancedPersonalityType | undefined {
    return this.personalityTypes.get(name);
  }

  getAllQuestions(): Array<{
    question: string;
    options: Array<{
      text: string;
      personality: string;
    }>;
  }> {
    const allQuestions = new Map<string, Set<string>>();
    const personalityMap = new Map<string, Map<string, string>>();

    this.personalityDataset.forEach(entry => {
      if (!allQuestions.has(entry.Question)) {
        allQuestions.set(entry.Question, new Set());
        personalityMap.set(entry.Question, new Map());
      }

      const options = [
        { text: entry.Option_1, personality: entry.Option_1_Personality },
        { text: entry.Option_2, personality: entry.Option_2_Personality },
        { text: entry.Option_3, personality: entry.Option_3_Personality },
        { text: entry.Option_4, personality: entry.Option_4_Personality }
      ];

      options.forEach(option => {
        if (option.text && option.personality) {
          allQuestions.get(entry.Question)!.add(option.text);
          personalityMap.get(entry.Question)!.set(option.text, option.personality);
        }
      });
    });

    return Array.from(allQuestions.entries()).map(([question, optionsSet]) => ({
      question,
      options: Array.from(optionsSet).map(optionText => ({
        text: optionText,
        personality: personalityMap.get(question)!.get(optionText) || 'Unknown'
      }))
    }));
  }

  analyzePersonality(answers: Record<string, string>): EnhancedPersonalityAnalysis {
    // Count personality occurrences based on answers
    const personalityCounts = new Map<string, number>();
    const selectedOptions: string[] = [];

    Object.entries(answers).forEach(([question, selectedOption]) => {
      selectedOptions.push(selectedOption);
      
      // Find the personality type for this option
      this.personalityDataset.forEach(entry => {
        if (entry.Question === question) {
          const options = [
            { text: entry.Option_1, personality: entry.Option_1_Personality },
            { text: entry.Option_2, personality: entry.Option_2_Personality },
            { text: entry.Option_3, personality: entry.Option_3_Personality },
            { text: entry.Option_4, personality: entry.Option_4_Personality }
          ];

          options.forEach(option => {
            if (option.text === selectedOption && option.personality) {
              const count = personalityCounts.get(option.personality) || 0;
              personalityCounts.set(option.personality, count + 1);
            }
          });
        }
      });
    });

    // Find dominant personality
    let dominantPersonality = 'Unknown';
    let maxCount = 0;

    personalityCounts.forEach((count, personality) => {
      if (count > maxCount) {
        maxCount = count;
        dominantPersonality = personality;
      }
    });

    // Get enhanced personality type data
    const personalityType = this.getPersonalityType(dominantPersonality);
    
    if (!personalityType) {
      return this.getDefaultAnalysis();
    }

    // Generate matched bags and artwork
    const matchedBags = this.findMatchingBags(answers, personalityType);
    const matchedArtwork = personalityType.artworkProducts.slice(0, 4);

    // Generate detailed analysis
    const detailedAnalysis = this.generateDetailedAnalysis(personalityType, selectedOptions, answers);

    return {
      personalityType: personalityType.name,
      description: personalityType.description,
      strengths: this.generateStrengths(personalityType.name),
      insights: this.generateInsights(personalityType.name),
      recommendations: this.generateRecommendations(personalityType.name),
      products: this.generateProducts(personalityType.name),
      matchedBags,
      matchedArtwork,
      sentiment: this.generateSentiment(personalityType.name),
      detailedAnalysis,
      styleRecommendations: this.generateStyleRecommendations(personalityType.name),
      lifestyleAdvice: this.generateLifestyleAdvice(personalityType.name)
    };
  }

  private findMatchingBags(answers: Record<string, string>, personalityType: EnhancedPersonalityType): Array<{
    name: string;
    link: string;
    reason: string;
    imageUrl?: string;
    price?: string;
  }> {
    const matchedBags: Array<{
      name: string;
      link: string;
      reason: string;
      imageUrl?: string;
      price?: string;
    }> = [];

    // Get bags from the dominant personality type
    const personalityBags = personalityType.bags.slice(0, 3);

    personalityBags.forEach(bag => {
      // Find the corresponding dataset entry for more context
      const entry = this.personalityDataset.find(e => e.Bag_Name === bag.name);
      
      let reason = `Perfect match for your ${personalityType.name.toLowerCase()} personality`;
      
      if (entry) {
        // Create a more specific reason based on the bag's characteristics
        const answerValues = Object.values(answers);
        const hasAdventure = answerValues.some(a => a.toLowerCase().includes('adventure') || a.toLowerCase().includes('explore'));
        const hasNature = answerValues.some(a => a.toLowerCase().includes('nature') || a.toLowerCase().includes('garden'));
        const hasUrban = answerValues.some(a => a.toLowerCase().includes('city') || a.toLowerCase().includes('urban'));

        if (hasAdventure) {
          reason = `Ideal for your adventurous spirit and ${personalityType.name.toLowerCase()} nature`;
        } else if (hasNature) {
          reason = `Complements your love for nature and ${personalityType.name.toLowerCase()} essence`;
        } else if (hasUrban) {
          reason = `Perfect for your urban lifestyle and ${personalityType.name.toLowerCase()} style`;
        }
      }

      matchedBags.push({
        name: bag.name,
        link: bag.link,
        reason
      });
    });

    return matchedBags;
  }

  private generateDetailedAnalysis(personalityType: EnhancedPersonalityType, selectedOptions: string[], answers: Record<string, string>): string {
    const answerCount = Object.keys(answers).length;
    const personalityTraits = this.getPersonalityTraits(personalityType.name);
    
    let analysis = `Based on your quiz responses, you embody the ${personalityType.name} personality type. `;
    analysis += `This ${personalityType.description.toLowerCase()} `;
    
    // Add specific insights based on answers
    const answerValues = Object.values(answers);
    const hasCreative = answerValues.some(a => a.toLowerCase().includes('creative') || a.toLowerCase().includes('artistic'));
    const hasAdventure = answerValues.some(a => a.toLowerCase().includes('adventure') || a.toLowerCase().includes('explore'));
    const hasNature = answerValues.some(a => a.toLowerCase().includes('nature') || a.toLowerCase().includes('garden'));
    const hasUrban = answerValues.some(a => a.toLowerCase().includes('city') || a.toLowerCase().includes('urban'));

    if (hasCreative) {
      analysis += `Your creative and artistic choices reflect your imaginative nature. `;
    }
    if (hasAdventure) {
      analysis += `Your adventurous spirit shows through in your preference for exploration and new experiences. `;
    }
    if (hasNature) {
      analysis += `Your connection to nature and tranquility is evident in your choices. `;
    }
    if (hasUrban) {
      analysis += `Your urban sophistication and modern outlook shine through in your selections. `;
    }

    analysis += `Your ${personalityType.name.toLowerCase()} personality makes you naturally drawn to accessories that reflect your unique character and lifestyle preferences. `;
    analysis += `The recommended products are carefully selected to complement your ${personalityTraits.join(', ')} traits and enhance your personal style.`;

    return analysis;
  }

  private getPersonalityTraits(personalityName: string): string[] {
    const traitMap: Record<string, string[]> = {
      'Savannah Spirit': ['bold', 'untamed', 'adventurous'],
      'Enchanted Rose': ['romantic', 'magical', 'vintage'],
      'Retro Muse': ['nostalgic', 'trendy', 'creative'],
      'Roaring Majesty': ['powerful', 'commanding', 'confident'],
      'Dreamscape Urbanite': ['ambitious', 'visionary', 'urban'],
      'Wolf Moon': ['loyal', 'strong', 'instinctive'],
      'Metamorph Muse': ['transformative', 'adaptable', 'evolving'],
      'Flutter Charm': ['playful', 'delicate', 'lively'],
      'Caribbean Dreamer': ['vibrant', 'colorful', 'free-spirited'],
      'Crimson Blossom': ['bold', 'passionate', 'fiery']
    };

    return traitMap[personalityName] || ['unique', 'distinctive', 'individual'];
  }

  private generateStrengths(personalityName: string): string[] {
    const strengthMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Natural leadership and bold decision-making',
        'Fearless approach to new challenges',
        'Strong sense of adventure and exploration'
      ],
      'Enchanted Rose': [
        'Deep emotional intelligence and empathy',
        'Creative imagination and artistic sensibility',
        'Ability to find beauty in everyday moments'
      ],
      'Retro Muse': [
        'Unique blend of nostalgia and innovation',
        'Creative problem-solving with vintage charm',
        'Ability to bridge past and present seamlessly'
      ],
      'Roaring Majesty': [
        'Natural authority and commanding presence',
        'Strong willpower and determination',
        'Ability to inspire and lead others'
      ],
      'Dreamscape Urbanite': [
        'Visionary thinking and ambitious goals',
        'Adaptability to fast-paced environments',
        'Innovative approach to urban challenges'
      ]
    };

    return strengthMap[personalityName] || [
      'Unique perspective and individuality',
      'Natural creativity and imagination',
      'Strong sense of personal style'
    ];
  }

  private generateInsights(personalityName: string): string[] {
    const insightMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Your bold nature makes you a natural leader in any situation',
        'You thrive in environments that allow for freedom and exploration',
        'Your adventurous spirit attracts others who seek excitement'
      ],
      'Enchanted Rose': [
        'Your romantic nature helps you create meaningful connections',
        'You have a unique ability to see magic in ordinary moments',
        'Your vintage charm adds timeless elegance to everything you do'
      ],
      'Retro Muse': [
        'Your ability to blend old and new makes you a trendsetter',
        'You have a natural talent for creating unique style combinations',
        'Your nostalgic approach brings comfort and familiarity to others'
      ],
      'Roaring Majesty': [
        'Your commanding presence naturally draws attention and respect',
        'You have the power to inspire confidence in those around you',
        'Your strong will helps you achieve ambitious goals'
      ],
      'Dreamscape Urbanite': [
        'Your visionary thinking helps you see opportunities others miss',
        'You thrive in dynamic environments that challenge your creativity',
        'Your urban sophistication gives you a modern edge'
      ]
    };

    return insightMap[personalityName] || [
      'Your unique personality makes you stand out in any crowd',
      'You have a natural ability to express your individuality',
      'Your distinctive style reflects your inner confidence'
    ];
  }

  private generateRecommendations(personalityName: string): string[] {
    const recommendationMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Choose bold, statement pieces that reflect your adventurous nature',
        'Opt for durable, travel-friendly accessories that can keep up with your lifestyle',
        'Embrace earthy tones and natural materials that connect with your wild spirit'
      ],
      'Enchanted Rose': [
        'Select romantic, vintage-inspired pieces that tell a story',
        'Choose soft, feminine details and delicate patterns',
        'Opt for accessories that add a touch of magic to your everyday look'
      ],
      'Retro Muse': [
        'Mix vintage and modern elements for a unique, timeless style',
        'Choose accessories with interesting textures and retro patterns',
        'Embrace bold colors and playful designs that reflect your creative spirit'
      ],
      'Roaring Majesty': [
        'Select powerful, commanding pieces that reflect your strong personality',
        'Choose high-quality materials and sophisticated designs',
        'Opt for accessories that make a bold statement and command attention'
      ],
      'Dreamscape Urbanite': [
        'Choose sleek, modern pieces that reflect your visionary nature',
        'Opt for versatile accessories that can transition from day to night',
        'Embrace innovative designs and cutting-edge styles'
      ]
    };

    return recommendationMap[personalityName] || [
      'Choose accessories that reflect your unique personality and style',
      'Opt for pieces that make you feel confident and authentic',
      'Embrace designs that showcase your individuality and creativity'
    ];
  }

  private generateStyleRecommendations(personalityName: string): string[] {
    const styleMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Embrace bold animal prints and natural textures',
        'Choose structured bags with multiple compartments for your adventures',
        'Opt for warm earth tones and rich leather finishes'
      ],
      'Enchanted Rose': [
        'Select soft, romantic colors and floral patterns',
        'Choose delicate details like embroidery and vintage hardware',
        'Opt for feminine silhouettes with graceful curves'
      ],
      'Retro Muse': [
        'Mix vintage-inspired patterns with modern functionality',
        'Choose bold geometric prints and retro color palettes',
        'Opt for classic shapes with contemporary twists'
      ],
      'Roaring Majesty': [
        'Select sophisticated neutrals and luxury materials',
        'Choose structured, professional silhouettes',
        'Opt for high-quality finishes and premium hardware'
      ],
      'Dreamscape Urbanite': [
        'Embrace sleek, minimalist designs with clean lines',
        'Choose versatile pieces that work from office to evening',
        'Opt for innovative features and modern aesthetics'
      ]
    };

    return styleMap[personalityName] || [
      'Choose pieces that reflect your unique style preferences',
      'Opt for versatile designs that adapt to different occasions',
      'Embrace quality materials that enhance your confidence'
    ];
  }

  private generateLifestyleAdvice(personalityName: string): string[] {
    const lifestyleMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Plan regular outdoor adventures to feed your wild spirit',
        'Surround yourself with natural elements and earthy decor',
        'Embrace spontaneity and new experiences'
      ],
      'Enchanted Rose': [
        'Create magical moments in your daily routine',
        'Surround yourself with beauty and romantic touches',
        'Practice mindfulness to appreciate life\'s small wonders'
      ],
      'Retro Muse': [
        'Blend vintage finds with modern conveniences',
        'Express your creativity through DIY projects',
        'Build a collection of timeless pieces'
      ],
      'Roaring Majesty': [
        'Take on leadership roles that challenge your abilities',
        'Invest in quality pieces that reflect your success',
        'Maintain high standards in all areas of life'
      ],
      'Dreamscape Urbanite': [
        'Stay connected to the latest trends and innovations',
        'Build a professional network that supports your ambitions',
        'Create a living space that reflects your modern lifestyle'
      ]
    };

    return lifestyleMap[personalityName] || [
      'Embrace your unique personality in all aspects of life',
      'Surround yourself with people and things that inspire you',
      'Stay true to your authentic self while growing and evolving'
    ];
  }

  private generateProducts(personalityName: string): string[] {
    const productMap: Record<string, string[]> = {
      'Savannah Spirit': [
        'Leather crossbody bags with bold animal prints',
        'Adventure-ready backpacks with multiple compartments',
        'Statement wallets with natural textures'
      ],
      'Enchanted Rose': [
        'Vintage-inspired clutches with romantic details',
        'Delicate coin purses with floral patterns',
        'Elegant wristlets with soft, feminine designs'
      ],
      'Retro Muse': [
        'Vintage-style satchels with modern functionality',
        'Retro-print cosmetic bags with bold patterns',
        'Classic hobos with contemporary twists'
      ],
      'Roaring Majesty': [
        'Commanding satchels with sophisticated details',
        'Premium leather organizers with luxury finishes',
        'Bold statement pieces with powerful presence'
      ],
      'Dreamscape Urbanite': [
        'Sleek crossbody bags with modern silhouettes',
        'Versatile organizers for busy city life',
        'Innovative designs with cutting-edge features'
      ]
    };

    return productMap[personalityName] || [
      'Personalized accessories that reflect your unique style',
      'Versatile pieces that adapt to your lifestyle',
      'Quality accessories that enhance your confidence'
    ];
  }

  private generateSentiment(personalityName: string): string {
    const sentimentMap: Record<string, string> = {
      'Savannah Spirit': 'Bold and adventurous with a wild, untamed spirit',
      'Enchanted Rose': 'Romantic and magical with a touch of vintage elegance',
      'Retro Muse': 'Nostalgic yet trendy, blending old with new',
      'Roaring Majesty': 'Powerful and commanding with natural authority',
      'Dreamscape Urbanite': 'Ambitious and visionary with urban sophistication',
      'Wolf Moon': 'Loyal and strong with intuitive instincts',
      'Metamorph Muse': 'Transformative and adaptable with growth mindset',
      'Flutter Charm': 'Playful and delicate with lively energy',
      'Caribbean Dreamer': 'Vibrant and colorful with island spirit',
      'Crimson Blossom': 'Bold and passionate with fiery determination'
    };

    return sentimentMap[personalityName] || 'Unique and distinctive with authentic personality';
  }

  private getDefaultAnalysis(): EnhancedPersonalityAnalysis {
    return {
      personalityType: 'Unique Individual',
      description: 'A distinctive personality with authentic character and style.',
      strengths: [
        'Natural creativity and imagination',
        'Strong sense of personal identity',
        'Ability to express individuality'
      ],
      insights: [
        'Your unique perspective makes you stand out',
        'You have a natural talent for self-expression',
        'Your authentic nature attracts genuine connections'
      ],
      recommendations: [
        'Choose accessories that reflect your true self',
        'Embrace designs that showcase your individuality',
        'Select pieces that make you feel confident'
      ],
      products: [
        'Personalized accessories with unique details',
        'Versatile pieces that adapt to your style',
        'Quality items that enhance your confidence'
      ],
      matchedBags: [
        {
          name: 'Classic Leather Satchel',
          link: 'https://anuschkaleather.in/collections/all',
          reason: 'Perfect foundation piece for your unique style'
        }
      ],
      matchedArtwork: [],
      sentiment: 'Authentic and individual with distinctive character',
      detailedAnalysis: 'Your unique personality shines through in your choices, reflecting your authentic nature and individual style preferences.',
      styleRecommendations: [
        'Choose pieces that reflect your unique style preferences',
        'Opt for versatile designs that adapt to different occasions',
        'Embrace quality materials that enhance your confidence'
      ],
      lifestyleAdvice: [
        'Embrace your unique personality in all aspects of life',
        'Surround yourself with people and things that inspire you',
        'Stay true to your authentic self while growing and evolving'
      ]
    };
  }
}

// Export singleton instance
const enhancedPersonalityLoader = new EnhancedPersonalityLoader();
export default enhancedPersonalityLoader; 