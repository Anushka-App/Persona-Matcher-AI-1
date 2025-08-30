# Complete Artwork Selection and LLM Recommendation System

## 🎨 **ARTWORK SELECTION QUESTIONS**

### **Question 1: Artwork Theme Selection**
```
Pick the artwork theme that resonates with you:

1. 🦁 Animal (wildlife and majestic creatures)
   - Wildlife, safari animals, birds, fish, domestic animals
   - Keywords: animal, wildlife, creature, beast, mammal, bird, fish, reptile, lion, tiger, elephant, peacock, butterfly

2. 🌸 Flowers/Plants (blooms and leafy calm)
   - Floral designs, botanical patterns, garden themes
   - Keywords: flower, plant, bloom, petal, leaf, garden, botanical, floral, rose, lily, orchid

3. 🏔️ Nature/Landscape (vistas and natural forms)
   - Mountains, oceans, forests, landscapes, natural scenery
   - Keywords: nature, landscape, mountain, sea, ocean, forest, vista, scenery, sunset, valley

4. ⭐ Symbols/Emblems (meaning and character)
   - Cultural symbols, meaningful icons, heritage designs
   - Keywords: symbol, emblem, icon, meaningful, timeless, heritage, cultural, mandala, tribal

5. 🎨 Pattern/Abstract (abstract shapes and geometry)
   - Geometric patterns, modern designs, artistic forms
   - Keywords: pattern, abstract, geometric, design, shape, form, modern, artistic, contemporary

6. 🚗 Vehicles/Transport
   - Cars, planes, boats, travel themes
   - Keywords: vehicle, transport, car, plane, boat, travel, journey, adventure

7. 🍽️ Food & Drink
   - Culinary themes, beverage designs, gastronomy
   - Keywords: food, drink, culinary, gastronomy, coffee, wine, kitchen, dining

8. 🎭 Other (unique and unexpected)
   - Mixed themes, eclectic designs, unique combinations
   - Keywords: mixed, variety, diverse, eclectic, unique, special, unexpected
```

### **Question 2: Product Type Selection**
```
Select the product type that would be your perfect companion:

1. 💳 Wallets & Card Holders
   - Compact organizers for cards, cash, essentials
   - Perfect for: Minimalists, organized individuals

2. 👜 Crossbody Bags
   - Hands-free bags worn across the body
   - Perfect for: Active lifestyles, hands-free convenience

3. 👝 Satchels & Totes
   - Structured bags with handles and compartments
   - Perfect for: Work, shopping, organized storage

4. 🎒 Hobo Bags
   - Soft, slouchy shoulder bags
   - Perfect for: Casual, relaxed style

5. 💼 Clutches & Evening Bags
   - Elegant handheld bags for special occasions
   - Perfect for: Formal events, evening wear

6. 👝 Pouches & Organizers
   - Small bags for cosmetics, electronics, travel
   - Perfect for: Organization, travel, essentials

7. ✨ Accessories & Charms
   - Bag charms, cuffs, decorative items
   - Perfect for: Personalization, style accents
```

## 🤖 **LLM PROMPT STRUCTURE**

### **Artwork Analysis LLM Prompt**
```javascript
const artworkAnalysisPrompt = `You are an expert fashion stylist and product curator specializing in handbag and accessory recommendations. 

Your task is to analyze the user's artwork and product preferences${personality || sentiment ? ', along with their personality and mood,' : ''} to suggest the most suitable bag types from our available categories.

**User Profile:**
- Selected Artwork Theme: ${artworkTheme}
- Initial Product Choice: ${productType}
- Artwork Preference Details: ${JSON.stringify(artworkPreferences)}
${personality ? `- Personality Traits: ${personality}` : ''}
${sentiment ? `- Current Mood/Sentiment: ${sentiment}` : ''}

**Available Product Categories in Excel Database:**
1. wallet - Wallets & Card Holders (compact organizers for cards, cash, essentials)
2. crossbody - Crossbody Bags (hands-free bags worn across the body)
3. satchel - Satchels & Totes (structured bags with handles and compartments)
4. hobo - Hobo Bags (soft, slouchy shoulder bags)
5. clutch - Clutches & Evening Bags (elegant handheld bags for special occasions)
6. pouch - Pouches & Organizers (small bags for cosmetics, electronics, travel)
7. accessory - Accessories & Charms (bag charms, cuffs, decorative items)

**Analysis Instructions:**
1. Consider how the artwork theme (${artworkTheme}) relates to aesthetic preferences and functional needs
2. Analyze what the artwork theme suggests about the user's style preferences
${personality ? '3. Factor in their personality traits to understand their lifestyle and functional needs' : ''}
${sentiment ? '4. Consider their current mood and how it might influence their style choices' : ''}
${personality || sentiment ? '5. Think about how the chosen product type aligns with their complete profile' : '3. Think about how the chosen product type aligns with the artwork aesthetic'}
${personality || sentiment ? '6. Suggest the BEST bag type from the available categories that matches their artwork, personality, and current state' : '4. Suggest the BEST bag type from the available categories that matches their artwork and product selections'}

**Output Requirements:**
Return JSON only:
{
  "suggestedBagType": "category_name_from_list_above",
  "confidence": 85-95,
  "insights": "Brief explanation of why this bag type suits their artwork preferences${personality ? ', personality traits' : ''}${sentiment ? ', and current mood' : ''}. Focus on style alignment and functional fit.",
  "alternativeTypes": ["type1", "type2"] 
}

No additional text outside JSON.`;
```

### **Enhanced Recommendation LLM Prompt**
```javascript
const enhancedRecommendationPrompt = `You are an expert fashion stylist and AI recommendation system specializing in personalized handbag and accessory curation.

**User Profile Analysis:**
- Personality Type: ${personality}
- Sentiment/Mood: ${sentiment}
- Artwork Theme Preference: ${artworkTheme}
- Product Type Preference: ${productType}
- Personality Scores: ${JSON.stringify(scores)}
- Quiz Journey: ${JSON.stringify(quizJourney)}

**Available Product Database:**
${productDatabase.map(p => `- ${p.artworkName} (${p.productType}): ${p.personalityTraits}`).join('\n')}

**Scoring Algorithm:**
1. Personality Trait Alignment (40% weight)
   - Boldness: Dynamic, energetic, adventurous traits
   - Elegance: Sophisticated, refined, timeless traits  
   - Whimsy: Creative, playful, artistic traits

2. Artwork Theme Compatibility (30% weight)
   - Exact theme matches: ${artworkTheme}
   - Theme keywords: ${getThemeKeywords(artworkTheme)}
   - Fallback scoring for theme variations

3. Bag Type Preference (20% weight)
   - Exact product type: ${productType}
   - Functional compatibility
   - Lifestyle alignment

4. Sentiment Alignment (10% weight)
   - Mood-based style preferences
   - Emotional resonance with designs

**Recommendation Instructions:**
1. Analyze each product using the 4-factor scoring algorithm
2. Calculate weighted scores (0-100) for each product
3. Select top 12 products with highest scores
4. Provide personalized explanations for each recommendation
5. Include confidence scores and match reasoning

**Output Format:**
Return JSON only:
{
  "recommendations": [
    {
      "productId": "unique_id",
      "artworkName": "Artwork Name",
      "productName": "Product Name", 
      "productType": "Bag Type",
      "matchScore": 85-95,
      "confidence": "High/Medium/Low",
      "personalityAlignment": "How it matches their personality",
      "artworkCompatibility": "How it fits their artwork theme",
      "functionalFit": "How it meets their bag type needs",
      "personalizedInsight": "Why this is perfect for them"
    }
  ],
  "userProfile": {
    "dominantTraits": ["trait1", "trait2"],
    "stylePreferences": ["preference1", "preference2"],
    "lifestyleInsights": "Lifestyle analysis based on choices",
    "recommendationStrategy": "Overall recommendation approach"
  },
  "summary": {
    "totalProducts": 12,
    "averageMatchScore": 85-95,
    "confidenceLevel": "High/Medium/Low",
    "keyInsights": "Main takeaways about user preferences"
  }
}

No additional text outside JSON.`;
```

## 🏗️ **COMPLETE SYSTEM ARCHITECTURE**

### **Frontend Component Structure**
```typescript
// ArtworkSelectionFlow.tsx
interface ArtworkSelectionFlowProps {
  // Component manages artwork theme and product type selection
}

interface QuestionOption {
  id: string;
  label: string;
  value: string;
  icon: string;
  color: string;
}

// Question 1: Artwork Theme Options
const getArtworkThemeOptions = (): QuestionOption[] => {
  return [
    {
      id: 'animals',
      label: 'Animal (wildlife and majestic creatures)',
      value: 'Animal',
      icon: '🦁',
      color: 'from-orange-400 to-amber-500'
    },
    {
      id: 'flowers_plants',
      label: 'Flowers/Plants (blooms and leafy calm)',
      value: 'Flowers/Plants',
      icon: '🌸',
      color: 'from-pink-400 to-rose-500'
    },
    {
      id: 'nature_landscape',
      label: 'Nature/Landscape (vistas and natural forms)',
      value: 'Nature/Landscape',
      icon: '🏔️',
      color: 'from-green-400 to-emerald-500'
    },
    {
      id: 'symbols_emblems',
      label: 'Symbols/Emblems (meaning and character)',
      value: 'Symbols/Emblems',
      icon: '⭐',
      color: 'from-purple-400 to-indigo-500'
    },
    {
      id: 'pattern_abstract',
      label: 'Pattern/Abstract (abstract shapes and geometry)',
      value: 'Pattern/Abstract',
      icon: '🎨',
      color: 'from-blue-400 to-cyan-500'
    },
    {
      id: 'vehicles_transport',
      label: 'Vehicles/Transport',
      value: 'Vehicles/Transport',
      icon: '🚗',
      color: 'from-red-400 to-pink-500'
    },
    {
      id: 'food_drink',
      label: 'Food & Drink',
      value: 'Food & Drink',
      icon: '🍽️',
      color: 'from-yellow-400 to-orange-500'
    },
    {
      id: 'other',
      label: 'Other (unique and unexpected)',
      value: 'Other (Unspecified)',
      icon: '🎭',
      color: 'from-gray-400 to-slate-500'
    }
  ];
};

// Question 2: Product Type Options
const getProductTypeOptions = (): QuestionOption[] => {
  return [
    {
      id: 'wallet',
      label: 'Wallets & Card Holders',
      value: 'wallet',
      icon: '💳',
      color: 'from-emerald-400 to-teal-600'
    },
    {
      id: 'crossbody',
      label: 'Crossbody Bags',
      value: 'crossbody',
      icon: '👜',
      color: 'from-purple-400 to-indigo-600'
    },
    {
      id: 'satchel',
      label: 'Satchels & Totes',
      value: 'satchel',
      icon: '👝',
      color: 'from-brown-400 to-amber-600'
    },
    {
      id: 'hobo',
      label: 'Hobo Bags',
      value: 'hobo',
      icon: '🎒',
      color: 'from-pink-400 to-rose-600'
    },
    {
      id: 'clutch',
      label: 'Clutches & Evening Bags',
      value: 'clutch',
      icon: '💼',
      color: 'from-violet-400 to-purple-600'
    },
    {
      id: 'pouch',
      label: 'Pouches & Organizers',
      value: 'pouch',
      icon: '👝',
      color: 'from-cyan-400 to-blue-600'
    },
    {
      id: 'accessory',
      label: 'Accessories & Charms',
      value: 'accessory',
      icon: '✨',
      color: 'from-orange-400 to-red-600'
    }
  ];
};
```

### **Backend API Endpoints**
```typescript
// Server endpoints for artwork analysis and recommendations

// 1. Artwork Analysis Endpoint
app.post('/api/artwork-analysis', async (req: Request, res: Response) => {
  const {
    artworkTheme,
    productType,
    artworkPreferences,
    personality,
    sentiment
  } = req.body;

  // Use artworkAnalysisPrompt above
  // Returns: suggestedBagType, confidence, insights, alternativeTypes
});

// 2. Enhanced Recommendations Endpoint
app.post('/recommendations', async (req: Request, res: Response) => {
  const { description, bagType, occasion, artworkTheme, llmInsights } = req.body;
  
  // Multi-factor filtering and scoring
  // Returns: recommendations, explanation, userProfile, confidenceScore
});
```

### **Scoring Algorithm Implementation**
```typescript
// Enhanced scoring system with 4-factor algorithm

class RecommendationEngine {
  calculateProductMatchScore(product: Product, userProfile: UserProfile) {
    let totalScore = 0;
    const reasons = [];
    
    // 1. Personality Trait Alignment (40% weight)
    const personalityScore = this.calculatePersonalityAlignment(product, userProfile.personalityScores);
    totalScore += personalityScore * 0.4;
    
    // 2. Artwork Theme Compatibility (30% weight)
    const artworkScore = this.calculateArtworkCompatibility(product, userProfile.artworkTheme);
    totalScore += artworkScore * 0.3;
    
    // 3. Bag Type Preference (20% weight)
    const bagTypeScore = this.calculateBagTypeCompatibility(product, userProfile.bagType);
    totalScore += bagTypeScore * 0.2;
    
    // 4. Sentiment Alignment (10% weight)
    const sentimentScore = this.calculateSentimentAlignment(product, userProfile.sentiment);
    totalScore += sentimentScore * 0.1;
    
    return { score: totalScore, reasons };
  }

  calculatePersonalityAlignment(product: Product, personalityScores: Record<string, number>) {
    const { Boldness, Elegance, Whimsy } = personalityScores;
    
    let score = 0;
    const productTraits = product.personalityTraits?.toLowerCase() || '';
    
    // Boldness scoring
    if (Boldness > 70) {
      const boldKeywords = ['bold', 'dynamic', 'energetic', 'adventurous', 'wild', 'safari'];
      if (boldKeywords.some(keyword => productTraits.includes(keyword))) {
        score += Boldness * 0.4;
      }
    }
    
    // Elegance scoring
    if (Elegance > 70) {
      const elegantKeywords = ['elegant', 'sophisticated', 'refined', 'timeless', 'classic'];
      if (elegantKeywords.some(keyword => productTraits.includes(keyword))) {
        score += Elegance * 0.4;
      }
    }
    
    // Whimsy scoring
    if (Whimsy > 70) {
      const whimsyKeywords = ['creative', 'playful', 'artistic', 'unique', 'imaginative'];
      if (whimsyKeywords.some(keyword => productTraits.includes(keyword))) {
        score += Whimsy * 0.4;
      }
    }
    
    return Math.min(score, 100);
  }

  calculateArtworkCompatibility(product: Product, artworkTheme: string) {
    const themeKeywords = {
      'Animal': ['animal', 'wildlife', 'creature', 'beast', 'mammal', 'bird', 'fish', 'reptile', 'lion', 'tiger', 'elephant', 'peacock', 'butterfly'],
      'Flowers/Plants': ['flower', 'plant', 'bloom', 'petal', 'leaf', 'garden', 'botanical', 'floral', 'rose', 'lily', 'orchid'],
      'Nature/Landscape': ['nature', 'landscape', 'mountain', 'sea', 'ocean', 'forest', 'vista', 'scenery', 'sunset', 'valley'],
      'Symbols/Emblems': ['symbol', 'emblem', 'icon', 'meaningful', 'timeless', 'heritage', 'cultural', 'mandala', 'tribal'],
      'Pattern/Abstract': ['pattern', 'abstract', 'geometric', 'design', 'shape', 'form', 'modern', 'artistic', 'contemporary'],
      'Vehicles/Transport': ['vehicle', 'transport', 'car', 'plane', 'boat', 'travel', 'journey', 'adventure'],
      'Food & Drink': ['food', 'drink', 'culinary', 'gastronomy', 'coffee', 'wine', 'kitchen', 'dining'],
      'Other (Unspecified)': ['mixed', 'variety', 'diverse', 'eclectic', 'unique', 'special', 'unexpected']
    };

    const keywords = themeKeywords[artworkTheme] || [];
    const productTraits = product.personalityTraits?.toLowerCase() || '';
    const artworkName = product.artworkName?.toLowerCase() || '';
    
    const matchCount = keywords.filter(keyword => 
      productTraits.includes(keyword) || artworkName.includes(keyword)
    ).length;
    
    return Math.min((matchCount / keywords.length) * 100, 100);
  }

  calculateBagTypeCompatibility(product: Product, bagType: string) {
    const productType = product.productType?.toLowerCase() || '';
    const productName = product.productName?.toLowerCase() || '';
    
    if (productType.includes(bagType.toLowerCase()) || productName.includes(bagType.toLowerCase())) {
      return 100; // Exact match
    }
    
    // Partial matches
    const bagTypeSynonyms = {
      'wallet': ['card', 'holder', 'organizer'],
      'crossbody': ['shoulder', 'messenger', 'sling'],
      'satchel': ['tote', 'handbag', 'purse'],
      'hobo': ['slouchy', 'soft', 'casual'],
      'clutch': ['evening', 'formal', 'handheld'],
      'pouch': ['small', 'mini', 'organizer'],
      'accessory': ['charm', 'decoration', 'accent']
    };
    
    const synonyms = bagTypeSynonyms[bagType] || [];
    const hasSynonym = synonyms.some(synonym => 
      productType.includes(synonym) || productName.includes(synonym)
    );
    
    return hasSynonym ? 70 : 30; // Partial match vs weak match
  }

  calculateSentimentAlignment(product: Product, sentiment: string) {
    const productTraits = product.personalityTraits?.toLowerCase() || '';
    
    const sentimentKeywords = {
      'Positive': ['bright', 'uplifting', 'joyful', 'optimistic', 'cheerful'],
      'Balanced': ['harmonious', 'balanced', 'calm', 'peaceful', 'serene'],
      'Negative': ['deep', 'introspective', 'contemplative', 'mysterious', 'sophisticated']
    };
    
    const keywords = sentimentKeywords[sentiment] || [];
    const matchCount = keywords.filter(keyword => productTraits.includes(keyword)).length;
    
    return Math.min((matchCount / keywords.length) * 100, 100);
  }
}
```

### **Tree Structure for Recommendations**
```typescript
// Decision tree for artwork theme to product type mapping

const artworkThemeDecisionTree = {
  'Animal': {
    personalityWeights: {
      'Boldness': 0.8,
      'Elegance': 0.4,
      'Whimsy': 0.7
    },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Animal themes suggest bold, adventurous personalities who prefer functional, hands-free options'
  },
  'Flowers/Plants': {
    personalityWeights: {
      'Boldness': 0.4,
      'Elegance': 0.9,
      'Whimsy': 0.6
    },
    recommendedBagTypes: ['clutch', 'pouch', 'satchel'],
    reasoning: 'Floral themes indicate elegant, refined personalities who appreciate sophisticated accessories'
  },
  'Nature/Landscape': {
    personalityWeights: {
      'Boldness': 0.7,
      'Elegance': 0.6,
      'Whimsy': 0.5
    },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Nature themes suggest balanced personalities who value both style and functionality'
  },
  'Symbols/Emblems': {
    personalityWeights: {
      'Boldness': 0.5,
      'Elegance': 0.7,
      'Whimsy': 0.8
    },
    recommendedBagTypes: ['clutch', 'accessory', 'pouch'],
    reasoning: 'Symbol themes indicate creative, meaningful personalities who appreciate cultural significance'
  },
  'Pattern/Abstract': {
    personalityWeights: {
      'Boldness': 0.6,
      'Elegance': 0.8,
      'Whimsy': 0.9
    },
    recommendedBagTypes: ['clutch', 'pouch', 'accessory'],
    reasoning: 'Abstract themes suggest artistic, creative personalities who appreciate unique designs'
  },
  'Vehicles/Transport': {
    personalityWeights: {
      'Boldness': 0.9,
      'Elegance': 0.3,
      'Whimsy': 0.6
    },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Vehicle themes suggest adventurous, dynamic personalities who need practical, durable options'
  },
  'Food & Drink': {
    personalityWeights: {
      'Boldness': 0.5,
      'Elegance': 0.6,
      'Whimsy': 0.8
    },
    recommendedBagTypes: ['pouch', 'accessory', 'clutch'],
    reasoning: 'Food themes suggest social, creative personalities who appreciate lifestyle-oriented accessories'
  },
  'Other (Unspecified)': {
    personalityWeights: {
      'Boldness': 0.5,
      'Elegance': 0.6,
      'Whimsy': 0.7
    },
    recommendedBagTypes: ['satchel', 'crossbody', 'pouch'],
    reasoning: 'Mixed themes suggest versatile personalities who appreciate variety and adaptability'
  }
};
```

## 📋 **COMPLETE LLM PROMPT FOR COPY-PASTE**

Here's the complete LLM prompt you can copy and paste:

```
You are an expert fashion stylist and AI recommendation system specializing in personalized handbag and accessory curation. Your task is to analyze user preferences and provide highly personalized product recommendations.

**SYSTEM CONTEXT:**
You work with a database of handcrafted leather bags and accessories featuring unique artwork designs. Each product has artwork themes, personality traits, and functional characteristics.

**AVAILABLE PRODUCT CATEGORIES:**
1. wallet - Wallets & Card Holders (compact organizers for cards, cash, essentials)
2. crossbody - Crossbody Bags (hands-free bags worn across the body)
3. satchel - Satchels & Totes (structured bags with handles and compartments)
4. hobo - Hobo Bags (soft, slouchy shoulder bags)
5. clutch - Clutches & Evening Bags (elegant handheld bags for special occasions)
6. pouch - Pouches & Organizers (small bags for cosmetics, electronics, travel)
7. accessory - Accessories & Charms (bag charms, cuffs, decorative items)

**ARTWORK THEMES:**
- Animal: wildlife, safari animals, birds, fish, domestic animals
- Flowers/Plants: floral designs, botanical patterns, garden themes
- Nature/Landscape: mountains, oceans, forests, landscapes, natural scenery
- Symbols/Emblems: cultural symbols, meaningful icons, heritage designs
- Pattern/Abstract: geometric patterns, modern designs, artistic forms
- Vehicles/Transport: cars, planes, boats, travel themes
- Food & Drink: culinary themes, beverage designs, gastronomy
- Other (Unspecified): mixed themes, eclectic designs, unique combinations

**PERSONALITY TRAITS:**
- Boldness: dynamic, energetic, adventurous, confident
- Elegance: sophisticated, refined, timeless, graceful
- Whimsy: creative, playful, artistic, imaginative

**SCORING ALGORITHM:**
1. Personality Trait Alignment (40% weight)
2. Artwork Theme Compatibility (30% weight)
3. Bag Type Preference (20% weight)
4. Sentiment Alignment (10% weight)

**USER INPUT FORMAT:**
{
  "personality": "Unique/Adventurous/Elegant",
  "sentiment": "Positive/Balanced/Negative",
  "artworkTheme": "Selected artwork theme",
  "productType": "Selected product type",
  "personalityScores": {
    "Boldness": 0-100,
    "Elegance": 0-100,
    "Whimsy": 0-100
  }
}

**ANALYSIS INSTRUCTIONS:**
1. Analyze the user's personality profile and dominant traits
2. Consider how the artwork theme reflects their aesthetic preferences
3. Evaluate the functional needs based on their product type choice
4. Factor in their current sentiment/mood
5. Apply the 4-factor scoring algorithm to available products
6. Select the best 12 products with highest match scores
7. Provide personalized explanations for each recommendation

**OUTPUT REQUIREMENTS:**
Return JSON only with the following structure:
{
  "suggestedBagType": "best_matching_category",
  "confidence": 85-95,
  "insights": "Personalized explanation of why this bag type suits their preferences",
  "alternativeTypes": ["alternative1", "alternative2"],
  "recommendations": [
    {
      "productId": "unique_id",
      "artworkName": "Artwork Name",
      "productName": "Product Name",
      "productType": "Bag Type",
      "matchScore": 85-95,
      "confidence": "High/Medium/Low",
      "personalityAlignment": "How it matches their personality",
      "artworkCompatibility": "How it fits their artwork theme",
      "functionalFit": "How it meets their bag type needs",
      "personalizedInsight": "Why this is perfect for them"
    }
  ],
  "userProfile": {
    "dominantTraits": ["trait1", "trait2"],
    "stylePreferences": ["preference1", "preference2"],
    "lifestyleInsights": "Lifestyle analysis based on choices",
    "recommendationStrategy": "Overall recommendation approach"
  },
  "summary": {
    "totalProducts": 12,
    "averageMatchScore": 85-95,
    "confidenceLevel": "High/Medium/Low",
    "keyInsights": "Main takeaways about user preferences"
  }
}

**DECISION TREE LOGIC:**
- Animal themes → Bold personalities → Crossbody/Satchel recommendations
- Flower themes → Elegant personalities → Clutch/Pouch recommendations
- Nature themes → Balanced personalities → Crossbody/Satchel recommendations
- Symbol themes → Creative personalities → Clutch/Accessory recommendations
- Abstract themes → Artistic personalities → Clutch/Pouch recommendations
- Vehicle themes → Adventurous personalities → Crossbody/Satchel recommendations
- Food themes → Social personalities → Pouch/Accessory recommendations

Always provide detailed, personalized reasoning for each recommendation and ensure the suggestions align with the user's complete profile including personality, artwork preferences, and functional needs.
```

## 🎯 **USAGE INSTRUCTIONS**

1. **Copy the complete LLM prompt above**
2. **Replace the user input variables** with actual user data
3. **Send to your LLM** (Gemini, GPT, Claude, etc.)
4. **Parse the JSON response** to get recommendations
5. **Display results** with personalized explanations

This system provides a powerful, tree-structured approach to matching users with the perfect artwork-themed products based on their personality, preferences, and functional needs.
