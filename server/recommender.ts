import { Product } from './types';

/**
 * Extracts keywords from the user's description by lowercasing and splitting into unique words.
 */
export function getStyleKeywords(description: string): string[] {
    const text = description.toLowerCase();
    const words = text.match(/\b\w+\b/g) || [];
    const uniqueWords = Array.from(new Set(words));
    return uniqueWords;
}

/**
 * Filters products to find matches based on whether any keyword appears in key fields.
 */
export function findMatchingProducts(keywords: string[], products: Product[]): Product[] {
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