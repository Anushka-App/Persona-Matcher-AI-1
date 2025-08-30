// Simple data loader for serverless environment
import fs from 'fs';
import path from 'path';

export async function loadProducts() {
    try {
        // In serverless environment, we'll embed the data or load from a simple JSON file
        // For now, return some sample data that matches the bag types
        return [
            // Crossbody bags
            { productName: "Crossbody Phone Case - 1173", productType: "crossbody", price: "$89", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Perfect for the busy, on-the-go lifestyle" },
            { productName: "Organizer Wallet Crossbody - 1149", productType: "crossbody", price: "$125", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Organized and efficient personality" },
            { productName: "4 in 1 Organizer Crossbody - 711", productType: "crossbody", price: "$145", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Multi-functional and practical mindset" },

            // Tote bags
            { productName: "Classic Work Tote - 664", productType: "tote", price: "$189", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Professional and sophisticated approach" },
            { productName: "Medium Tote - 7603", productType: "tote", price: "$165", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Versatile and adaptable style" },
            { productName: "Large Zip Top Tote - 698", productType: "tote", price: "$199", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Bold and statement-making personality" },

            // Handbags
            { productName: "Medium Handbag Classic - 500", productType: "handbag", price: "$155", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Timeless and elegant taste" },
            { productName: "Large Handbag Deluxe - 501", productType: "handbag", price: "$189", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Confident and refined style" },
            { productName: "Small Handbag Compact - 502", productType: "handbag", price: "$125", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Minimalist and focused approach" },

            // Shoulder bags
            { productName: "Shoulder Bag Classic - 600", productType: "shoulder", price: "$145", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Comfortable and practical choice" },
            { productName: "Shoulder Bag Medium - 601", productType: "shoulder", price: "$165", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Balanced and harmonious style" },

            // Clutches
            { productName: "Evening Clutch Elegant - 800", productType: "clutch", price: "$95", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Sophisticated evening style" },
            { productName: "Day Clutch Casual - 801", productType: "clutch", price: "$75", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Chic and contemporary taste" },

            // Satchels
            { productName: "Satchel Professional - 900", productType: "satchel", price: "$175", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Structured and organized mindset" },
            { productName: "Satchel Casual - 901", productType: "satchel", price: "$155", imageUrl: "https://via.placeholder.com/300", productUrl: "#", personalityTraits: "Classic with modern twist" }
        ];
    } catch (error) {
        console.error('Error loading products:', error);
        return [];
    }
}
