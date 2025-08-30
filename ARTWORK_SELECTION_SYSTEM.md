# Artwork Selection Questions and LLM System

## 🎨 **ARTWORK SELECTION QUESTIONS**

### **Question 1: Artwork Theme Selection**
```
Pick the artwork theme that resonates with you:

1. 🦁 Animal (wildlife and majestic creatures)
   - Wildlife, safari animals, birds, fish, domestic animals
   - Keywords: animal, wildlife, creature, beast, mammal, bird, fish, reptile

2. 🌸 Flowers/Plants (blooms and leafy calm)
   - Floral designs, botanical patterns, garden themes
   - Keywords: flower, plant, bloom, petal, leaf, garden, botanical, floral

3. 🏔️ Nature/Landscape (vistas and natural forms)
   - Mountains, oceans, forests, landscapes, natural scenery
   - Keywords: nature, landscape, mountain, sea, ocean, forest, vista, scenery

4. ⭐ Symbols/Emblems (meaning and character)
   - Cultural symbols, meaningful icons, heritage designs
   - Keywords: symbol, emblem, icon, meaningful, timeless, heritage, cultural

5. 🎨 Pattern/Abstract (abstract shapes and geometry)
   - Geometric patterns, modern designs, artistic forms
   - Keywords: pattern, abstract, geometric, design, shape, form, modern, artistic

6. 🚗 Vehicles/Transport
   - Cars, planes, boats, travel themes
   - Keywords: vehicle, transport, car, plane, boat, travel, journey

7. 🍽️ Food & Drink
   - Culinary themes, beverage designs, gastronomy
   - Keywords: food, drink, culinary, gastronomy, coffee, wine, kitchen

8. 🎭 Other (unique and unexpected)
   - Mixed themes, eclectic designs, unique combinations
   - Keywords: mixed, variety, diverse, eclectic, unique, special
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

## 🤖 **LLM PROMPT FOR ARTWORK ANALYSIS**

```javascript
const artworkAnalysisPrompt = `You are an expert fashion stylist and product curator specializing in handbag and accessory recommendations. 

Your task is to analyze the user's artwork and product preferences${personality || sentiment ? ', along with their personality and mood,' : ''} to suggest the most suitable bag types from our available categories.

**User Profile:**
- Selected Artwork Theme: ${artworkTheme}
- Initial Product Choice: ${productType}
- Artwork Preference Details: ${JSON.stringify(artworkPreferences)}
${personality ? `- Personality Traits: ${personality}` : ''}
${sentiment ? `- Current Mood/Sentiment: ${sentiment}` : ''}

**Available Product Categories:**
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

## 🏗️ **TREE STRUCTURE FOR RECOMMENDATIONS**

```javascript
const artworkThemeDecisionTree = {
  'Animal': {
    personalityWeights: { 'Boldness': 0.8, 'Elegance': 0.4, 'Whimsy': 0.7 },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Animal themes suggest bold, adventurous personalities who prefer functional, hands-free options'
  },
  'Flowers/Plants': {
    personalityWeights: { 'Boldness': 0.4, 'Elegance': 0.9, 'Whimsy': 0.6 },
    recommendedBagTypes: ['clutch', 'pouch', 'satchel'],
    reasoning: 'Floral themes indicate elegant, refined personalities who appreciate sophisticated accessories'
  },
  'Nature/Landscape': {
    personalityWeights: { 'Boldness': 0.7, 'Elegance': 0.6, 'Whimsy': 0.5 },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Nature themes suggest balanced personalities who value both style and functionality'
  },
  'Symbols/Emblems': {
    personalityWeights: { 'Boldness': 0.5, 'Elegance': 0.7, 'Whimsy': 0.8 },
    recommendedBagTypes: ['clutch', 'accessory', 'pouch'],
    reasoning: 'Symbol themes indicate creative, meaningful personalities who appreciate cultural significance'
  },
  'Pattern/Abstract': {
    personalityWeights: { 'Boldness': 0.6, 'Elegance': 0.8, 'Whimsy': 0.9 },
    recommendedBagTypes: ['clutch', 'pouch', 'accessory'],
    reasoning: 'Abstract themes suggest artistic, creative personalities who appreciate unique designs'
  },
  'Vehicles/Transport': {
    personalityWeights: { 'Boldness': 0.9, 'Elegance': 0.3, 'Whimsy': 0.6 },
    recommendedBagTypes: ['crossbody', 'satchel', 'hobo'],
    reasoning: 'Vehicle themes suggest adventurous, dynamic personalities who need practical, durable options'
  },
  'Food & Drink': {
    personalityWeights: { 'Boldness': 0.5, 'Elegance': 0.6, 'Whimsy': 0.8 },
    recommendedBagTypes: ['pouch', 'accessory', 'clutch'],
    reasoning: 'Food themes suggest social, creative personalities who appreciate lifestyle-oriented accessories'
  },
  'Other (Unspecified)': {
    personalityWeights: { 'Boldness': 0.5, 'Elegance': 0.6, 'Whimsy': 0.7 },
    recommendedBagTypes: ['satchel', 'crossbody', 'pouch'],
    reasoning: 'Mixed themes suggest versatile personalities who appreciate variety and adaptability'
  }
};
```

## 🎯 **COMPLETE LLM PROMPT FOR COPY-PASTE**

```
You are an expert fashion stylist and AI recommendation system specializing in personalized handbag and accessory curation.

**AVAILABLE PRODUCT CATEGORIES:**
1. wallet - Wallets & Card Holders
2. crossbody - Crossbody Bags  
3. satchel - Satchels & Totes
4. hobo - Hobo Bags
5. clutch - Clutches & Evening Bags
6. pouch - Pouches & Organizers
7. accessory - Accessories & Charms

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

**USER INPUT:**
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
Return JSON only:
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

## 📋 **USAGE INSTRUCTIONS**

1. **Copy the complete LLM prompt above**
2. **Replace the user input variables** with actual user data
3. **Send to your LLM** (Gemini, GPT, Claude, etc.)
4. **Parse the JSON response** to get recommendations
5. **Display results** with personalized explanations

This system provides a powerful, tree-structured approach to matching users with the perfect artwork-themed products based on their personality, preferences, and functional needs.
