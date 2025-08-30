import fs from 'fs';

// Read the catalog data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

// Analyze themes/categories
const themes = {};
const productTypes = {};

catalogData.forEach(product => {
    const theme = product.categories || 'Other';
    const productName = product['Product Name'] || '';
    
    // Count themes
    themes[theme] = (themes[theme] || 0) + 1;
    
    // Analyze product types from product names
    const name = productName.toLowerCase();
    let detectedType = 'other';
    
    if (name.includes('crossbody') || name.includes('cross-body') || name.includes('sling') || name.includes('messenger')) {
        detectedType = 'crossbody';
    } else if (name.includes('hobo')) {
        detectedType = 'hobo';
    } else if (name.includes('satchel') || name.includes('tote') || name.includes('shopper')) {
        detectedType = 'satchel';
    } else if (name.includes('wallet') || name.includes('card holder') || name.includes('cardholder')) {
        detectedType = 'wallet';
    } else if (name.includes('clutch') || name.includes('evening')) {
        detectedType = 'clutch';
    } else if (name.includes('pouch') || name.includes('organizer') || name.includes('cosmetic') || name.includes('makeup') || name.includes('tech pouch') || name.includes('kit')) {
        detectedType = 'pouch';
    } else if (name.includes('charm') || name.includes('keychain') || name.includes('strap') || name.includes('scarf') || name.includes('twilly') || name.includes('accessory')) {
        detectedType = 'accessory';
    }
    
    productTypes[detectedType] = (productTypes[detectedType] || 0) + 1;
});

console.log('Available Themes:');
console.log(JSON.stringify(themes, null, 2));

console.log('\nDetected Product Types:');
console.log(JSON.stringify(productTypes, null, 2));

console.log('\nSample products by theme:');
Object.keys(themes).forEach(theme => {
    const sampleProducts = catalogData.filter(p => p.categories === theme).slice(0, 3);
    console.log(`\n${theme}:`);
    sampleProducts.forEach(p => {
        console.log(`  - ${p['Product Name']} (${p['Product Name'].toLowerCase().includes('crossbody') ? 'crossbody' : 
            p['Product Name'].toLowerCase().includes('wallet') ? 'wallet' : 
            p['Product Name'].toLowerCase().includes('pouch') ? 'pouch' : 
            p['Product Name'].toLowerCase().includes('clutch') ? 'clutch' : 
            p['Product Name'].toLowerCase().includes('satchel') ? 'satchel' : 
            p['Product Name'].toLowerCase().includes('hobo') ? 'hobo' : 'other'})`);
    });
});
