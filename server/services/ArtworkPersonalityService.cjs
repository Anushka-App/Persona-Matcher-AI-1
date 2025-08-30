"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArtworkPersonalityService = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
class ArtworkPersonalityService {
    constructor() {
        this.artworkData = new Map();
        this.isLoaded = false;
    }
    async loadArtworkPersonalityData() {
        if (this.isLoaded)
            return;
        const csvPath = path.join(process.cwd(), 'artwork_primary_theme_and_product.csv');
        if (!fs.existsSync(csvPath)) {
            console.warn('⚠️ Artwork personality CSV file not found:', csvPath);
            return;
        }
        return new Promise((resolve, reject) => {
            const results = [];
            fs.createReadStream(csvPath)
                .pipe((0, csv_parser_1.default)())
                .on('data', (data) => {
                const artworkData = {
                    artworkName: data['Artwork Name'] || '',
                    artworkUrl: data['Artwork URL'] || '',
                    imageUrl: '',
                    designElements: data['primary_theme'] || '',
                    overallPersonality: data['Personality Traits'] || '',
                    buyerPersonalityMatch: data['Personality Traits'] || '',
                    psychologicalAppeal: data['Personality Traits'] || '',
                    artworkDescription: this.generateArtworkDescription(data['Personality Traits'] || '')
                };
                if (artworkData.artworkName) {
                    results.push(artworkData);
                    this.artworkData.set(artworkData.artworkName.toLowerCase(), artworkData);
                }
            })
                .on('end', () => {
                console.log(`✅ Loaded ${results.length} artwork personality descriptions from ${csvPath}`);
                this.isLoaded = true;
                resolve();
            })
                .on('error', (error) => {
                console.error('❌ Error loading artwork personality CSV:', error);
                reject(error);
            });
        });
    }
    generateArtworkDescription(psychologicalAppeal) {
        return psychologicalAppeal || '';
    }
    getArtworkPersonality(artworkName) {
        if (!this.isLoaded) {
            console.warn('⚠️ Artwork personality data not loaded yet');
            return null;
        }
        const normalizedName = artworkName.toLowerCase();
        return this.artworkData.get(normalizedName) || null;
    }
    getAllArtworkData() {
        return Array.from(this.artworkData.values());
    }
    searchArtworkByName(searchTerm) {
        if (!this.isLoaded)
            return [];
        const normalizedSearch = searchTerm.toLowerCase();
        return Array.from(this.artworkData.values()).filter(artwork => artwork.artworkName.toLowerCase().includes(normalizedSearch));
    }
    getArtworkDescription(artworkName) {
        const artwork = this.getArtworkPersonality(artworkName);
        return artwork?.artworkDescription || artwork?.psychologicalAppeal || '';
    }
    categorizeArtworkTheme(artworkName) {
        const normalizedName = artworkName.toLowerCase();
        const artwork = this.getArtworkPersonality(artworkName);
        const designElements = artwork?.designElements?.toLowerCase() || '';
        const searchText = `${normalizedName} ${designElements}`.toLowerCase();
        if (this.matchesKeywords(searchText, [
            'leopard', 'elephant', 'tiger', 'safari', 'jungle', 'animal', 'wildlife', 'bird', 'cat', 'owl', 'panda',
            'deer', 'lion', 'african', 'amazon', 'cleopatra', 'imperial', 'king', 'queen', 'savanna', 'tropical',
            'gentle giant', 'happy panda', 'siamese', 'wise owl', 'cardinal', 'wolf', 'wolves'
        ])) {
            return 'Animals';
        }
        if (this.matchesKeywords(searchText, [
            'garden', 'floral', 'flower', 'bloom', 'rose', 'lily', 'lotus', 'peony', 'botanical', 'plant',
            'bel fiori', 'butterfly blooms', 'camellia', 'caribbean', 'crimson', 'dancing leaves',
            'dreamy', 'earth song', 'enchanted', 'ethereal', 'paradise', 'passion', 'magical', 'midnight',
            'orchid', 'poppy', 'tropical bloom', 'tulip', 'zen', 'jardin', 'romantic', 'peonies'
        ])) {
            return 'Flowers/Plants';
        }
        if (this.matchesKeywords(searchText, [
            'canyon', 'sea', 'reef', 'forest', 'mountain', 'landscape', 'nature', 'starry', 'meadow',
            'gift of the sea', 'mystical reef', 'paradise found', 'turtle cove', 'rainforest', 'japanese',
            'whimsical forest', 'mystic forest', 'island escape', 'night', 'vista', 'scenery'
        ])) {
            return 'Nature/Landscape';
        }
        if (this.matchesKeywords(searchText, [
            'embossed', 'mandala', 'paisley', 'mosaic', 'pattern', 'abstract', 'geometric', 'tooled',
            'basket', 'croc', 'herringbone', 'boho', 'denim', 'indian', 'city lights', 'modern', 'artistic'
        ])) {
            return 'Pattern/Abstract';
        }
        if (this.matchesKeywords(searchText, [
            'wings', 'skull', 'dragon', 'legend', 'dream', 'heritage', 'symbol', 'emblem', 'cultural',
            'angel', 'calaveras', 'feather', 'high roller', 'love in paris', 'city of dreams', 'painted',
            'hope', 'free spirit', 'guiding light', 'meaningful', 'timeless'
        ])) {
            return 'Symbols/Emblems';
        }
        return 'Other (Unspecified)';
    }
    matchesKeywords(searchText, keywords) {
        return keywords.some(keyword => searchText.includes(keyword));
    }
    getArtworksByTheme(theme) {
        if (!this.isLoaded)
            return [];
        return Array.from(this.artworkData.values()).filter(artwork => this.categorizeArtworkTheme(artwork.artworkName) === theme);
    }
}
exports.ArtworkPersonalityService = ArtworkPersonalityService;
