import fs from 'fs';

// Read the Excel data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

// Simulate the fixed server filtering logic
function testServerFiltering(artworkTheme, bagType) {
    console.log(`🎯 Testing server filtering: Theme="${artworkTheme}", BagType="${bagType}"`);
    
    // Filter products using the corrected logic
    const filteredProducts = catalogData.filter(p => {
        const productTheme = p.categories || p.Themes || '';
        const productName = p['Product Name'] || '';
        
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
    
    // Show first 5 results
    console.log('\nFirst 5 results:');
    filteredProducts.slice(0, 5).forEach((product, index) => {
        console.log(`${index + 1}. ${product['Product Name']} (${product['Artwork Name']}) - Theme: ${product.categories}`);
    });
    
    return filteredProducts;
}

// Test the fix
console.log('=== TESTING SERVER FILTERING FIX ===\n');

// Test 1: Animal + Crossbody (the problematic case)
console.log('=== TEST 1: Animal + Crossbody ===');
const animalCrossbodyResults = testServerFiltering('Animal', 'crossbody');

// Test 2: Flowers/Plants + Clutch
console.log('\n=== TEST 2: Flowers/Plants + Clutch ===');
const flowersClutchResults = testServerFiltering('Flowers/Plants', 'clutch');

// Test 3: Pattern/Abstract + Pouch
console.log('\n=== TEST 3: Pattern/Abstract + Pouch ===');
const patternPouchResults = testServerFiltering('Pattern/Abstract', 'pouch');

// Summary
console.log('\n=== SUMMARY ===');
console.log(`Animal + Crossbody: ${animalCrossbodyResults.length} products`);
console.log(`Flowers/Plants + Clutch: ${flowersClutchResults.length} products`);
console.log(`Pattern/Abstract + Pouch: ${patternPouchResults.length} products`);

// Verify that Animal results are actually Animal-themed
console.log('\n=== VERIFICATION ===');
const animalThemes = animalCrossbodyResults.map(p => p.categories);
const uniqueThemes = [...new Set(animalThemes)];
console.log('Themes in Animal results:', uniqueThemes);

if (uniqueThemes.length === 1 && uniqueThemes[0] === 'Animal') {
    console.log('✅ SUCCESS: All Animal results are actually Animal-themed!');
} else {
    console.log('❌ ISSUE: Animal results contain non-Animal themes:', uniqueThemes);
}

console.log('\n✅ Server filtering fix test completed!');
