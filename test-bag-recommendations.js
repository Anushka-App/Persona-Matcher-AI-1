import fs from 'fs';

// Read the Excel data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

// Simple theme mapping to Excel categories
function mapUserThemeToExcelCategory(userTheme) {
    const themeMap = {
        'animal': 'Animal',
        'flowers/plants': 'Flowers/Plants',
        'nature/landscape': 'Nature/Landscape',
        'symbols/emblems': 'Symbols/Emblems',
        'pattern/abstract': 'Pattern/Abstract',
        'vehicles/transport': 'Vehicles/Transport',
        'food & drink': 'Food & Drink',
        'other (unspecified)': 'Other (Unspecified)'
    };
    return themeMap[userTheme.toLowerCase()] || userTheme;
}

// Simplified filtering function - DIRECT EXCEL CATEGORY MATCH ONLY
function filterProducts(artworkTheme, bagType) {
    console.log(`🎯 Testing filtering for theme: "${artworkTheme}" and bag type: "${bagType}"`);
    
    // Map user theme to Excel category
    const excelCategory = mapUserThemeToExcelCategory(artworkTheme);
    console.log(`📋 Mapped to Excel category: "${excelCategory}"`);
    
    // Filter products by EXACT Excel category match
    const filteredProducts = catalogData.filter(product => {
        const productCategory = product.categories || '';
        const productName = product['Product Name'] || '';
        
        // EXACT CATEGORY MATCH - This is the key fix
        const categoryMatch = productCategory === excelCategory;
        
        // Bag type matching - check if product name contains the bag type
        let bagMatch = true; // Default to true if no bag type specified
        if (bagType && bagType.trim()) {
            const bagTypeLower = bagType.toLowerCase();
            bagMatch = productName.toLowerCase().includes(bagTypeLower);
        }
        
        return categoryMatch && bagMatch;
    });

    console.log(`✅ Found ${filteredProducts.length} products with exact category match for "${excelCategory}"`);
    
    // Log sample matches for debugging
    if (filteredProducts.length > 0) {
        console.log(`📝 Sample matches:`);
        filteredProducts.slice(0, 5).forEach((product, index) => {
            console.log(`  ${index + 1}. ${product['Artwork Name']} - ${product['Product Name']} (Category: ${product.categories})`);
        });
    } else {
        console.log(`❌ No products found for category "${excelCategory}"`);
    }
    
    return filteredProducts;
}

// Test different themes
console.log('🧪 TESTING BAG RECOMMENDATION FILTERING\n');

// Test 1: Animal theme
console.log('=== TEST 1: ANIMAL THEME ===');
const animalProducts = filterProducts('animal', 'crossbody');
console.log(`Total animal products found: ${animalProducts.length}\n`);

// Test 2: Flowers/Plants theme
console.log('=== TEST 2: FLOWERS/PLANTS THEME ===');
const flowerProducts = filterProducts('flowers/plants', 'clutch');
console.log(`Total flower products found: ${flowerProducts.length}\n`);

// Test 3: Nature/Landscape theme
console.log('=== TEST 3: NATURE/LANDSCAPE THEME ===');
const natureProducts = filterProducts('nature/landscape', 'satchel');
console.log(`Total nature products found: ${natureProducts.length}\n`);

// Test 4: Pattern/Abstract theme
console.log('=== TEST 4: PATTERN/ABSTRACT THEME ===');
const patternProducts = filterProducts('pattern/abstract', 'pouch');
console.log(`Total pattern products found: ${patternProducts.length}\n`);

// Test 5: Symbols/Emblems theme
console.log('=== TEST 5: SYMBOLS/EMBLEMS THEME ===');
const symbolProducts = filterProducts('symbols/emblems', 'accessory');
console.log(`Total symbol products found: ${symbolProducts.length}\n`);

// Test 6: Vehicles/Transport theme
console.log('=== TEST 6: VEHICLES/TRANSPORT THEME ===');
const vehicleProducts = filterProducts('vehicles/transport', 'crossbody');
console.log(`Total vehicle products found: ${vehicleProducts.length}\n`);

// Test 7: Food & Drink theme
console.log('=== TEST 7: FOOD & DRINK THEME ===');
const foodProducts = filterProducts('food & drink', 'pouch');
console.log(`Total food products found: ${foodProducts.length}\n`);

// Test 8: Other (Unspecified) theme
console.log('=== TEST 8: OTHER (UNSPECIFIED) THEME ===');
const otherProducts = filterProducts('other (unspecified)', 'satchel');
console.log(`Total other products found: ${otherProducts.length}\n`);

// Summary
console.log('📊 SUMMARY OF ALL TESTS:');
console.log(`Animal theme: ${animalProducts.length} products`);
console.log(`Flowers/Plants theme: ${flowerProducts.length} products`);
console.log(`Nature/Landscape theme: ${natureProducts.length} products`);
console.log(`Pattern/Abstract theme: ${patternProducts.length} products`);
console.log(`Symbols/Emblems theme: ${symbolProducts.length} products`);
console.log(`Vehicles/Transport theme: ${vehicleProducts.length} products`);
console.log(`Food & Drink theme: ${foodProducts.length} products`);
console.log(`Other (Unspecified) theme: ${otherProducts.length} products`);

// Verify that we're getting the right categories
console.log('\n🔍 VERIFYING CATEGORY MATCHES:');
const allCategories = [...new Set(catalogData.map(item => item.categories).filter(Boolean))];
console.log('Available Excel categories:', allCategories);

// Test that each category has products
allCategories.forEach(category => {
    const categoryProducts = catalogData.filter(product => product.categories === category);
    console.log(`${category}: ${categoryProducts.length} products`);
});
