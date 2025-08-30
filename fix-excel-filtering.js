import fs from 'fs';

// Read the current Excel data to understand the structure
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

console.log('=== EXCEL DATA STRUCTURE ANALYSIS ===');
console.log(`Total products: ${catalogData.length}`);

// Show sample data structure
console.log('\nSample product structure:');
console.log(JSON.stringify(catalogData[0], null, 2));

// Analyze the Themes column
console.log('\n=== THEMES ANALYSIS ===');
const themes = {};
catalogData.forEach(product => {
    const theme = product.categories || product.Themes || 'Unknown';
    themes[theme] = (themes[theme] || 0) + 1;
});

console.log('Available themes in Excel:');
console.log(JSON.stringify(themes, null, 2));

// Show sample products for each theme
console.log('\n=== SAMPLE PRODUCTS BY THEME ===');
Object.keys(themes).forEach(theme => {
    const sampleProducts = catalogData.filter(p => (p.categories || p.Themes) === theme).slice(0, 3);
    console.log(`\n${theme} (${themes[theme]} products):`);
    sampleProducts.forEach(p => {
        console.log(`  - ${p['Product Name']} (${p['Artwork Name']})`);
    });
});

// Create a simple filtering function that works with the Excel structure
function filterProductsByTheme(products, theme, bagType) {
    console.log(`\n=== FILTERING: Theme="${theme}", BagType="${bagType}" ===`);
    
    return products.filter(product => {
        const productTheme = product.categories || product.Themes || '';
        const productName = product['Product Name'] || '';
        const artworkName = product['Artwork Name'] || '';
        
        // Theme matching - use exact match from Excel
        let themeMatch = false;
        
        if (theme.toLowerCase() === 'animal') {
            // For Animal theme, check if the Excel theme is "Animal" or if artwork name contains animal keywords
            themeMatch = productTheme.toLowerCase() === 'animal' || 
                        productTheme.toLowerCase().includes('animal') ||
                        artworkName.toLowerCase().includes('leopard') ||
                        artworkName.toLowerCase().includes('tiger') ||
                        artworkName.toLowerCase().includes('elephant') ||
                        artworkName.toLowerCase().includes('bird') ||
                        artworkName.toLowerCase().includes('butterfly') ||
                        artworkName.toLowerCase().includes('dragon');
        } else {
            // For other themes, use exact matching
            themeMatch = productTheme.toLowerCase() === theme.toLowerCase();
        }
        
        // Bag type matching
        let bagMatch = true; // Default to true if no bag type specified
        if (bagType) {
            const bagTypeLower = bagType.toLowerCase();
            bagMatch = productName.toLowerCase().includes(bagTypeLower) ||
                      productName.toLowerCase().includes('crossbody') ||
                      productName.toLowerCase().includes('satchel') ||
                      productName.toLowerCase().includes('hobo') ||
                      productName.toLowerCase().includes('wallet') ||
                      productName.toLowerCase().includes('pouch') ||
                      productName.toLowerCase().includes('clutch');
        }
        
        if (themeMatch && bagMatch) {
            console.log(`✅ MATCH: ${product['Product Name']} (${product['Artwork Name']}) - Theme: ${productTheme}`);
        }
        
        return themeMatch && bagMatch;
    });
}

// Test the filtering
console.log('\n=== TESTING FILTERING ===');
const animalCrossbodyResults = filterProductsByTheme(catalogData, 'Animal', 'crossbody');
console.log(`\nFound ${animalCrossbodyResults.length} Animal + Crossbody products`);

// Save the filtered results for testing
const testResults = {
    theme: 'Animal',
    bagType: 'crossbody',
    totalProducts: animalCrossbodyResults.length,
    products: animalCrossbodyResults.slice(0, 12).map(p => ({
        productName: p['Product Name'],
        artworkName: p['Artwork Name'],
        theme: p.categories || p.Themes,
        productType: p['Product Type'],
        image: p['Image URL'],
        price: p.Price
    }))
};

fs.writeFileSync('test-filtering-results.json', JSON.stringify(testResults, null, 2));
console.log('\nTest results saved to test-filtering-results.json');
