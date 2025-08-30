"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStyleKeywords = getStyleKeywords;
exports.findMatchingProducts = findMatchingProducts;
function getStyleKeywords(description) {
    const text = description.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords;
}
function findMatchingProducts(keywords, products) {
    return products.filter((product) => {
        const haystack = [
            product.productName,
            product.artworkName,
            product.personalityTraits,
        ]
            .join(' ')
            .toLowerCase();
        return keywords.some((keyword) => haystack.includes(keyword.toLowerCase()));
    });
}
