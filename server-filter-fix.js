// This is the corrected filtering logic that should replace the complex logic in server/index.ts

function getRecommendationsFromExcel(artworkTheme, bagType, productDatabase) {
    console.log(`🎯 Getting recommendations for: Theme="${artworkTheme}", BagType="${bagType}"`);
    
    // Filter products by theme and bag type using the Excel data structure
    const filteredProducts = productDatabase.filter(product => {
        const productTheme = product.categories || product.Themes || '';
        const productName = product['Product Name'] || product.productName || '';
        
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
    
    // Return top 12 products in the format expected by the frontend
    return filteredProducts.slice(0, 12).map(product => ({
        id: product['Product URL']?.split('/').pop() || product.id || `product-${Math.random().toString(36).substr(2, 9)}`,
        name: product['Product Name'] || product.productName,
        artworkName: product['Artwork Name'] || product.artworkName,
        productName: product['Product Name'] || product.productName,
        personaName: product['Artwork Name'] || product.artworkName,
        personaDescription: product.categories || product.Themes,
        price: product.Price || product.price,
        image: product['Image URL'] || product.image,
        link: product['Product URL'] || product.link,
        productType: product['Product Type'] || product.productType || 'Bag',
        description: product['Personality Traits'] || product.description || `Beautiful ${product.categories || product.Themes} themed ${product['Product Name'] || product.productName}`,
        psychologicalAppeal: product.categories || product.Themes,
        artworkPersonality: product['Artwork Name'] || product.artworkName
    }));
}

// Example usage:
// const recommendations = getRecommendationsFromExcel('Animal', 'crossbody', productDatabase);

module.exports = { getRecommendationsFromExcel };
