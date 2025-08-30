import fs from 'fs';

// Read the catalog data
const catalogData = JSON.parse(fs.readFileSync('catalog-data.json', 'utf8'));

console.log(`Loaded ${catalogData.length} products from catalog`);

// Test with a simple user input
const userInputs = {
    artworkTheme: 'Animal',
    productType: 'crossbody',
    personality: {
        boldness: 85,
        elegance: 45,
        whimsy: 70
    },
    sentiment: 'Positive'
};

// Simple scoring function
function simpleScore(product, userTheme, userType) {
    let score = 50; // Base score
    
    // Theme match
    if (product.categories === userTheme) {
        score += 30;
    }
    
    // Product type match
    const productName = product['Product Name'].toLowerCase();
    if (userType === 'crossbody' && productName.includes('crossbody')) {
        score += 20;
    }
    
    return score;
}

// Get top 5 products
const scoredProducts = catalogData
    .map(product => ({
        ...product,
        score: simpleScore(product, userInputs.artworkTheme, userInputs.productType)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

console.log('\nTop 5 recommendations:');
scoredProducts.forEach((product, index) => {
    console.log(`${index + 1}. ${product['Product Name']} (${product.categories}) - Score: ${product.score}`);
});

console.log('\nSystem is working!');
