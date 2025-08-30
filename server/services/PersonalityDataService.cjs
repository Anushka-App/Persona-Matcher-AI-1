"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalityDataService = void 0;
const csv_parser_1 = __importDefault(require("csv-parser"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PersonalityDataService {
    constructor() {
        this.questionsData = [];
        this.bagsData = [];
        this.artworkData = [];
        this.personalityTypes = [];
        this.isDataLoaded = false;
    }
    async loadAllData() {
        try {
            await Promise.all([
                this.loadCSVData(),
                this.loadXLSXData()
            ]);
            this.extractPersonalityTypes();
            this.isDataLoaded = true;
            console.log('✅ Personality quiz data loaded successfully');
            console.log(`📝 Questions: ${this.questionsData.length}`);
            console.log(`👜 Bags: ${this.bagsData.length}`);
            console.log(`🎨 Artwork: ${this.artworkData.length}`);
            console.log(`👤 Personality Types: ${this.personalityTypes.length}`);
        }
        catch (error) {
            console.error('❌ Error loading personality quiz data:', error);
            throw error;
        }
    }
    async loadCSVData() {
        return new Promise((resolve, reject) => {
            const csvPath = path_1.default.join(process.cwd(), 'public', 'updated_ml_bags_personality_dataset_cleaned.csv');
            if (!fs_1.default.existsSync(csvPath)) {
                reject(new Error(`CSV file not found: ${csvPath}`));
                return;
            }
            const questions = [];
            const bags = [];
            fs_1.default.createReadStream(csvPath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (row) => {
                if (row.Question && row.Option_1) {
                    questions.push({
                        Question: row.Question,
                        Option_1: row.Option_1,
                        Option_1_Personality: row.Option_1_Personality,
                        Option_2: row.Option_2,
                        Option_2_Personality: row.Option_2_Personality,
                        Option_3: row.Option_3,
                        Option_3_Personality: row.Option_3_Personality,
                        Option_4: row.Option_4,
                        Option_4_Personality: row.Option_4_Personality,
                    });
                }
                if (row.Bag_Name && row.Personality_Description) {
                    bags.push({
                        Bag_Name: row.Bag_Name,
                        Personality_Description: row.Personality_Description,
                        Product_Link: row.Product_Link,
                        Price: row.Price,
                        Brand: row.Brand,
                        Style: row.Style,
                        Material: row.Material,
                        Color: row.Color,
                    });
                }
            })
                .on('end', () => {
                this.questionsData = questions;
                this.bagsData = bags;
                resolve();
            })
                .on('error', reject);
        });
    }
    async loadXLSXData() {
        try {
            const xlsxPath = path_1.default.join(process.cwd(), 'mapped_persona_artwork_data.xlsx');
            if (!fs_1.default.existsSync(xlsxPath)) {
                console.warn(`⚠️ XLSX file not found: ${xlsxPath}`);
                return;
            }
            const workbook = xlsx_1.default.readFile(xlsxPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const rawData = xlsx_1.default.utils.sheet_to_json(worksheet);
            if (rawData.length > 0) {
                console.log('📊 XLSX columns available:', Object.keys(rawData[0]));
            }
            this.artworkData = rawData.map((row) => ({
                Personality_Type: String(row['Personality Traits'] || ''),
                Artwork_Description: String(row['Artwork Name'] || ''),
                Style_Characteristics: String(row['Artwork Name'] || ''),
                Color_Palette: '',
                Mood: '',
                Product_Name: String(row['Product Name'] || ''),
                Artwork_Name: String(row['Artwork Name'] || ''),
                Image_URL: String(row['Image URL'] || ''),
                Product_URL: String(row['Product URL'] || ''),
            })).filter(item => item.Product_Name || item.Artwork_Name);
            console.log(`📊 Loaded ${this.artworkData.length} artwork items from XLSX`);
            if (this.artworkData.length > 0) {
                console.log('📊 Sample artwork item:', this.artworkData[0]);
            }
        }
        catch (error) {
            console.warn('⚠️ Error loading XLSX data:', error);
        }
    }
    extractPersonalityTypes() {
        const personalities = new Set();
        this.questionsData.forEach(question => {
            [question.Option_1_Personality, question.Option_2_Personality,
                question.Option_3_Personality, question.Option_4_Personality].forEach(p => {
                if (p)
                    personalities.add(p);
            });
        });
        this.bagsData.forEach(bag => {
            if (bag.Personality_Description) {
                const match = bag.Personality_Description.match(/(\w+)_\w+/);
                if (match)
                    personalities.add(match[1]);
            }
        });
        this.artworkData.forEach(art => {
            if (art.Personality_Type)
                personalities.add(art.Personality_Type);
        });
        this.personalityTypes = Array.from(personalities);
    }
    getQuestions() {
        if (!this.isDataLoaded)
            throw new Error('Personality quiz data not loaded');
        return this.questionsData;
    }
    getBags() {
        if (!this.isDataLoaded)
            throw new Error('Personality quiz data not loaded');
        return this.bagsData;
    }
    getArtworkData() {
        if (!this.isDataLoaded)
            throw new Error('Personality quiz data not loaded');
        return this.artworkData;
    }
    getPersonalityTypes() {
        if (!this.isDataLoaded)
            throw new Error('Personality quiz data not loaded');
        return this.personalityTypes;
    }
    getBagsByPersonality(personality) {
        return this.bagsData.filter(bag => bag.Personality_Description.toLowerCase().includes(personality.toLowerCase()));
    }
    getArtworkByPersonality(personality) {
        return this.artworkData.find(art => art.Personality_Type.toLowerCase() === personality.toLowerCase()) || null;
    }
    findProductDetails(productName) {
        return this.artworkData.find(art => art.Product_Name && art.Product_Name.toLowerCase().includes(productName.toLowerCase())) || null;
    }
    getProductsWithArtwork() {
        return this.bagsData.map(bag => {
            const artwork = this.findProductDetails(bag.Bag_Name);
            return {
                ...bag,
                artwork: artwork || undefined
            };
        });
    }
    getProductTypeQuestion() {
        return {
            question: "What type of bags do you normally carry.",
            options: [
                {
                    label: "Wallets & Card Holders",
                    value: "wallet",
                    description: "Compact organizers for cards, cash, and essentials"
                },
                {
                    label: "Crossbody Bags",
                    value: "crossbody",
                    description: "Hands-free bags worn across the body"
                },
                {
                    label: "Satchels & Totes",
                    value: "satchel",
                    description: "Structured bags with handles and compartments"
                },
                {
                    label: "Hobo Bags",
                    value: "hobo",
                    description: "Soft, slouchy shoulder bags"
                },
                {
                    label: "Clutches & Evening Bags",
                    value: "clutch",
                    description: "Elegant handheld bags for special occasions"
                },
                {
                    label: "Pouches & Organizers",
                    value: "pouch",
                    description: "Small bags for cosmetics, electronics, and travel"
                },
                {
                    label: "Accessories & Charms",
                    value: "accessory",
                    description: "Bag charms, cuffs, and decorative items"
                }
            ]
        };
    }
    getBagsByProductType(productType) {
        const typeKeywords = {
            wallet: ['wallet', 'coin pouch', 'card case', 'credit card', 'rfid', 'french wallet'],
            crossbody: ['crossbody', 'organizer crossbody', 'sling', 'messenger'],
            satchel: ['satchel', 'tote', 'multi compartment satchel', 'large satchel'],
            hobo: ['hobo', 'shoulder hobo', 'slim hobo', 'convertible hobo'],
            clutch: ['clutch', 'three fold clutch', 'evening'],
            pouch: ['pouch', 'cosmetic', 'zip pouch', 'travel organizer', 'eyeglass'],
            accessory: ['charm', 'cuff', 'key case', 'airpod']
        };
        const keywords = typeKeywords[productType] || [];
        return this.bagsData.filter(bag => {
            const bagName = bag.Bag_Name.toLowerCase();
            return keywords.some(keyword => bagName.includes(keyword));
        });
    }
    getBagsByPersonalityAndProductType(personality, productType) {
        const personalityBags = this.getBagsByPersonality(personality);
        const productTypeBags = this.getBagsByProductType(productType);
        const personalityBagNames = new Set(personalityBags.map(bag => bag.Bag_Name));
        const filteredBags = productTypeBags.filter(bag => personalityBagNames.has(bag.Bag_Name));
        const uniqueArtworkBags = new Map();
        filteredBags.forEach(bag => {
            const artworkDetails = this.findProductDetails(bag.Bag_Name);
            const artworkName = artworkDetails?.Artwork_Name || 'Unknown';
            if (!uniqueArtworkBags.has(artworkName)) {
                uniqueArtworkBags.set(artworkName, bag);
            }
        });
        return Array.from(uniqueArtworkBags.values());
    }
    getUniqueBagsByArtwork(bags) {
        const uniqueArtworkBags = new Map();
        const seenProductNames = new Set();
        bags.forEach(bag => {
            const artworkDetails = this.findProductDetails(bag.Bag_Name);
            const artworkName = artworkDetails?.Artwork_Name || 'Unknown';
            const productName = artworkDetails?.Product_Name || bag.Bag_Name;
            if (seenProductNames.has(productName)) {
                return;
            }
            if (!uniqueArtworkBags.has(artworkName)) {
                uniqueArtworkBags.set(artworkName, bag);
                seenProductNames.add(productName);
            }
        });
        return Array.from(uniqueArtworkBags.values());
    }
}
exports.PersonalityDataService = PersonalityDataService;
