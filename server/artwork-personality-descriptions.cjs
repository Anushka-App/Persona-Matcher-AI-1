"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadArtworkPersonalityDescriptions = loadArtworkPersonalityDescriptions;
exports.getArtworkDescription = getArtworkDescription;
exports.getArtworkPersonality = getArtworkPersonality;
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
const fs_1 = __importDefault(require("fs"));
const artworkDescriptions = new Map();
async function loadArtworkPersonalityDescriptions() {
    try {
        const csvPath = path_1.default.resolve(process.cwd(), 'public/Anuschka_Artwork_Personality_Descriptions.csv');
        if (!fs_1.default.existsSync(csvPath)) {
            console.log('📄 Optional artwork personality descriptions file not found, using LLM generation instead');
            return artworkDescriptions;
        }
        const workbook = xlsx_1.default.readFile(csvPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const raw = xlsx_1.default.utils.sheet_to_json(sheet, { defval: '' });
        artworkDescriptions.clear();
        raw.forEach(row => {
            const artworkName = String(row['Artwork Name'] || '').trim();
            if (artworkName) {
                artworkDescriptions.set(artworkName, {
                    artworkName: artworkName,
                    artworkUrl: String(row['Artwork URL'] || ''),
                    imageUrl: String(row['Image URL'] || ''),
                    designElements: String(row['Design Elements'] || ''),
                    overallPersonality: String(row['Overall Personality of Artwork'] || ''),
                    buyerPersonalityMatch: String(row['Buyer Personality Match'] || ''),
                    psychologicalAppeal: String(row['Psychological Appeal'] || '')
                });
            }
        });
        console.log(`✅ Loaded ${artworkDescriptions.size} artwork personality descriptions`);
        return artworkDescriptions;
    }
    catch (error) {
        console.error('❌ Error loading artwork personality descriptions:', error);
        return new Map();
    }
}
function getArtworkDescription(artworkName) {
    return artworkDescriptions.get(artworkName);
}
function getArtworkPersonality(artworkName) {
    const description = artworkDescriptions.get(artworkName);
    if (description && description.overallPersonality) {
        return description.overallPersonality;
    }
    return `${artworkName} - Beautiful handcrafted bag with unique artwork that reflects your personality`;
}
