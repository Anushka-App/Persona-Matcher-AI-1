import fs from 'fs';

// Read the Excel data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

// Simple and correct filtering function
function getRecommendations(artworkTheme, bagType) {
    console.log(`🎯 Getting recommendations for: Theme="${artworkTheme}", BagType="${bagType}"`);
    
    // Filter products by theme and bag type
    const filteredProducts = catalogData.filter(product => {
        const productTheme = product.categories || '';
        const productName = product['Product Name'] || '';
        
        // Theme matching - use exact match from Excel
        let themeMatch = false;
        
        if (artworkTheme.toLowerCase() === 'animal') {
            // For Animal theme, check if the Excel theme is "Animal"
            themeMatch = productTheme.toLowerCase() === 'animal';
        } else {
            // For other themes, use exact matching
            themeMatch = productTheme.toLowerCase() === artworkTheme.toLowerCase();
        }
        
        // Bag type matching - check if product name contains the bag type
        let bagMatch = true; // Default to true if no bag type specified
        if (bagType) {
            const bagTypeLower = bagType.toLowerCase();
            bagMatch = productName.toLowerCase().includes(bagTypeLower);
        }
        
        return themeMatch && bagMatch;
    });
    
    console.log(`✅ Found ${filteredProducts.length} products matching criteria`);
    
    // Return top 12 products
    return filteredProducts.slice(0, 12).map(product => ({
        id: product['Product URL']?.split('/').pop() || `product-${Math.random().toString(36).substr(2, 9)}`,
        name: product['Product Name'],
        artworkName: product['Artwork Name'],
        productName: product['Product Name'],
        personaName: product['Artwork Name'],
        personaDescription: product.categories,
        price: product.Price,
        image: product['Image URL'],
        link: product['Product URL'],
        productType: product['Product Type'] || 'Bag',
        description: product['Personality Traits'] || `Beautiful ${product.categories} themed ${product['Product Name']}`,
        psychologicalAppeal: product.categories,
        artworkPersonality: product['Artwork Name']
    }));
}

// Test the function
console.log('=== TESTING SIMPLE EXCEL FILTERING ===\n');

// Test 1: Animal + Crossbody
const animalCrossbodyResults = getRecommendations('Animal', 'crossbody');
console.log('\n=== ANIMAL + CROSSBODY RESULTS ===');
animalCrossbodyResults.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.artworkName})`);
});

// Test 2: Flowers/Plants + Clutch
const flowersClutchResults = getRecommendations('Flowers/Plants', 'clutch');
console.log('\n=== FLOWERS/PLANTS + CLUTCH RESULTS ===');
flowersClutchResults.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.artworkName})`);
});

// Test 3: Pattern/Abstract + Pouch
const patternPouchResults = getRecommendations('Pattern/Abstract', 'pouch');
console.log('\n=== PATTERN/ABSTRACT + POUCH RESULTS ===');
patternPouchResults.forEach((product, index) => {
    console.log(`${index + 1}. ${product.name} (${product.artworkName})`);
});

// Save results for comparison
const testResults = {
    animalCrossbody: animalCrossbodyResults,
    flowersClutch: flowersClutchResults,
    patternPouch: patternPouchResults
};

fs.writeFileSync('simple-filter-results.json', JSON.stringify(testResults, null, 2));
console.log('\n✅ Test results saved to simple-filter-results.json');

// Show summary
console.log('\n=== SUMMARY ===');
console.log(`Animal + Crossbody: ${animalCrossbodyResults.length} products`);
console.log(`Flowers/Plants + Clutch: ${flowersClutchResults.length} products`);
console.log(`Pattern/Abstract + Pouch: ${patternPouchResults.length} products`);
