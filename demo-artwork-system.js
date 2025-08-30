#!/usr/bin/env node

/**
 * Demo Script for Enhanced Artwork Selection System
 * 
 * This script demonstrates the key functionality of the artwork selection system
 * including theme selection, product type selection, and personalized recommendations.
 */

console.log('🎨 Enhanced Artwork Selection System Demo');
console.log('==========================================\n');

// Simulate the artwork data service
class ArtworkDataService {
  constructor() {
    this.artworkData = [
      {
        artworkName: "Abstract Leopard",
        primaryTheme: "Animal",
        productType: "Bag",
        personalityTraits: "Vibrant and wild - for individuals who appreciate the spirit of adventure",
        overallPersonality: "Light, joyful, and nurturing",
        buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
        psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
      },
      {
        artworkName: "African Adventure",
        primaryTheme: "Other (Unspecified)",
        productType: "Bag",
        personalityTraits: "Vibrant, Exotic, and Explorative - for those open to new experiences",
        overallPersonality: "Wild, magnetic, and full of expressive energy",
        buyerPersonalityMatch: "ENFP or ESTP types — outgoing, high-energy creators who chase life with joy",
        psychologicalAppeal: "Speaks to the wild-at-heart, perfect for someone who expresses emotions through color and rhythm"
      },
      {
        artworkName: "Boho Paisley",
        primaryTheme: "Pattern/Abstract",
        productType: "Bag",
        personalityTraits: "Bohemian and Free-Spirited - creative, nomadic, and expressive",
        overallPersonality: "Light, joyful, and nurturing",
        buyerPersonalityMatch: "INFP and ISFJ personalities — warm-hearted, imaginative, and quietly strong",
        psychologicalAppeal: "Appeals to those who see beauty in subtlety, and seek connection through calm presence"
      },
      {
        artworkName: "Butterfly Blooms Bronze",
        primaryTheme: "Animal",
        productType: "Bag",
        personalityTraits: "Elegance with a Touch of Whimsy - sophisticated yet playful",
        overallPersonality: "Cosmic in spirit, draws power from the unknown with quiet confidence",
        buyerPersonalityMatch: "INFJ or INTJ personalities — deep thinkers who dream with discipline",
        psychologicalAppeal: "Attracts those who gaze at stars and search for meaning, introspective yet luminous"
      }
    ];
  }

  getArtworkThemes() {
    const themeCounts = this.artworkData.reduce((acc, artwork) => {
      acc[artwork.primaryTheme] = (acc[artwork.primaryTheme] || 0) + 1;
      return acc;
    }, {});

    return [
      { id: 'animals', label: 'Animal (wildlife and majestic creatures)', value: 'Animal', count: themeCounts['Animal'] || 0 },
      { id: 'pattern_abstract', label: 'Pattern/Abstract (abstract shapes and geometry)', value: 'Pattern/Abstract', count: themeCounts['Pattern/Abstract'] || 0 },
      { id: 'other', label: 'Other (Unspecified)', value: 'Other (Unspecified)', count: themeCounts['Other (Unspecified)'] || 0 }
    ];
  }

  getProductTypes() {
    return [
      { id: 'bag', label: 'Bag (versatile for anything)', value: 'Bag' },
      { id: 'tote', label: 'Tote (big carry-all)', value: 'Tote' },
      { id: 'crossbody', label: 'Crossbody (hands-free)', value: 'Crossbody' }
    ];
  }

  calculatePersonalityMatch(artwork, personality, sentiment) {
    let score = 0;
    
    // Check personality traits alignment
    if (artwork.personalityTraits.toLowerCase().includes(personality.toLowerCase())) {
      score += 0.4;
    }
    
    // Check sentiment alignment
    if (artwork.psychologicalAppeal) {
      if (sentiment === 'Positive' && (artwork.psychologicalAppeal.toLowerCase().includes('joy') || artwork.psychologicalAppeal.toLowerCase().includes('positive'))) {
        score += 0.3;
      } else if (sentiment === 'Balanced' && (artwork.psychologicalAppeal.toLowerCase().includes('calm') || artwork.psychologicalAppeal.toLowerCase().includes('balanced'))) {
        score += 0.3;
      } else if (sentiment === 'Negative' && (artwork.psychologicalAppeal.toLowerCase().includes('introspective') || artwork.psychologicalAppeal.toLowerCase().includes('deep'))) {
        score += 0.3;
      }
    }
    
    // Check buyer personality match
    if (artwork.buyerPersonalityMatch) {
      if (personality === 'Unique' && artwork.buyerPersonalityMatch.toLowerCase().includes('creative')) {
        score += 0.3;
      } else if (personality === 'Adventurous' && artwork.buyerPersonalityMatch.toLowerCase().includes('adventurous')) {
        score += 0.3;
      } else if (personality === 'Elegant' && artwork.buyerPersonalityMatch.toLowerCase().includes('elegant')) {
        score += 0.3;
      }
    }
    
    return Math.min(score, 1.0);
  }

  getPersonalizedRecommendations(theme, productType, personality, sentiment, limit = 12) {
    // Get artwork that matches the theme and product type
    let matchingArtwork = this.artworkData.filter(artwork => 
      artwork.primaryTheme === theme && artwork.productType === productType
    );
    
    // If no exact matches, get artwork by theme only
    if (matchingArtwork.length === 0) {
      matchingArtwork = this.artworkData.filter(artwork => artwork.primaryTheme === theme);
    }
    
    // If still no matches, get artwork by product type only
    if (matchingArtwork.length === 0) {
      matchingArtwork = this.artworkData.filter(artwork => artwork.productType === productType);
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
    
    return topArtwork;
  }
}

// Demo functions
function demoArtworkThemes() {
  console.log('🎨 Demo 1: Available Artwork Themes');
  console.log('------------------------------------');
  
  const service = new ArtworkDataService();
  const themes = service.getArtworkThemes();
  
  themes.forEach(theme => {
    console.log(`• ${theme.label} (${theme.count} designs available)`);
  });
  
  console.log('');
}

function demoProductTypes() {
  console.log('👜 Demo 2: Available Product Types');
  console.log('-----------------------------------');
  
  const service = new ArtworkDataService();
  const productTypes = service.getProductTypes();
  
  productTypes.forEach(type => {
    console.log(`• ${type.label}`);
  });
  
  console.log('');
}

function demoPersonalityMatching() {
  console.log('🧠 Demo 3: Personality Matching Algorithm');
  console.log('------------------------------------------');
  
  const service = new ArtworkDataService();
  const testCases = [
    { personality: 'Adventurous', sentiment: 'Positive', theme: 'Animal', productType: 'Bag' },
    { personality: 'Unique', sentiment: 'Balanced', theme: 'Pattern/Abstract', productType: 'Bag' },
    { personality: 'Elegant', sentiment: 'Negative', theme: 'Animal', productType: 'Bag' }
  ];
  
  testCases.forEach((testCase, index) => {
    console.log(`Test Case ${index + 1}: ${testCase.personality} + ${testCase.sentiment} + ${testCase.theme} + ${testCase.productType}`);
    
    const recommendations = service.getPersonalizedRecommendations(
      testCase.theme,
      testCase.productType,
      testCase.personality,
      testCase.sentiment,
      3
    );
    
    recommendations.forEach((artwork, recIndex) => {
      const score = service.calculatePersonalityMatch(artwork, testCase.personality, testCase.sentiment);
      console.log(`  ${recIndex + 1}. ${artwork.artworkName} (Match Score: ${(score * 100).toFixed(1)}%)`);
      console.log(`     Personality: ${artwork.personalityTraits}`);
      console.log(`     Buyer Match: ${artwork.buyerPersonalityMatch}`);
    });
    
    console.log('');
  });
}

function demoCompleteFlow() {
  console.log('🔄 Demo 4: Complete User Flow Simulation');
  console.log('------------------------------------------');
  
  const service = new ArtworkDataService();
  
  // Simulate user selections
  const userSelections = {
    personality: 'Adventurous',
    sentiment: 'Positive',
    artworkTheme: 'Animal',
    productType: 'Bag'
  };
  
  console.log(`👤 User Profile:`);
  console.log(`   Personality: ${userSelections.personality}`);
  console.log(`   Sentiment: ${userSelections.sentiment}`);
  console.log(`   Artwork Theme: ${userSelections.artworkTheme}`);
  console.log(`   Product Type: ${userSelections.productType}`);
  console.log('');
  
  // Get recommendations
  const recommendations = service.getPersonalizedRecommendations(
    userSelections.artworkTheme,
    userSelections.productType,
    userSelections.personality,
    userSelections.sentiment,
    5
  );
  
  console.log(`🎯 Personalized Recommendations (${recommendations.length} items):`);
  recommendations.forEach((artwork, index) => {
    const score = service.calculatePersonalityMatch(artwork, userSelections.personality, userSelections.sentiment);
    console.log(`\n${index + 1}. ${artwork.artworkName}`);
    console.log(`   Match Score: ${(score * 100).toFixed(1)}%`);
    console.log(`   Theme: ${artwork.primaryTheme}`);
    console.log(`   Style: ${artwork.overallPersonality}`);
    console.log(`   Why It Matches: ${artwork.personalityTraits}`);
  });
  
  console.log('');
}

// Run all demos
function runAllDemos() {
  demoArtworkThemes();
  demoProductTypes();
  demoPersonalityMatching();
  demoCompleteFlow();
  
  console.log('✨ Demo Complete!');
  console.log('\nThis demonstrates how the Enhanced Artwork Selection System:');
  console.log('• Dynamically loads artwork themes and product types');
  console.log('• Calculates personality-artwork compatibility scores');
  console.log('• Provides personalized recommendations based on user preferences');
  console.log('• Integrates seamlessly with the existing personality quiz system');
}

// Run the demo
runAllDemos();
