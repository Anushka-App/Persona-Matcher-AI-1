export interface Product {
    artworkName: string;
    artworkUrl: string;
    productName: string;
    productUrl: string;
    imageUrl: string;
    price: string;
    personalityTraits: string;
    // Type of the product, e.g., bag style
    productType: string;
    // Theme/category from Excel data
    categories?: string;
    Themes?: string;
} 