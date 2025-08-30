"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.loadProducts = loadProducts;
const path_1 = __importDefault(require("path"));
const xlsx_1 = __importDefault(require("xlsx"));
async function loadProducts() {
    const excelPath = path_1.default.resolve(process.cwd(), process.env.CSV_FILE_PATH || 'mapped_persona_artwork_data.xlsx');
    console.log(`📂 Loading Excel from: ${excelPath}`);
    const workbook = xlsx_1.default.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const raw = xlsx_1.default.utils.sheet_to_json(sheet, { defval: '' });
    if (raw.length > 0) {
        console.log('📊 Available Excel columns:', Object.keys(raw[0]));
        console.log('📝 First row sample:', raw[0]);
    }
    const products = raw.map(row => ({
        artworkName: String(row['Artwork Name'] || row['ArtworkName'] || ''),
        artworkUrl: String(row['Artwork URL'] || row['ArtworkURL'] || ''),
        productName: String(row['Product Name'] || row['ProductName'] || ''),
        productUrl: String(row['Product URL'] || row['ProductURL'] || ''),
        imageUrl: String(row['Image URL'] || row['ImageURL'] || ''),
        price: String(row['Price'] || ''),
        personalityTraits: String(row['Personality Traits'] || row['PersonalityTraits'] || ''),
        productType: String(row['Product Type'] || row['ProductType'] || 'Handbag'),
        categories: String(row['Themes'] || row['categories'] || ''),
        Themes: String(row['Themes'] || ''),
    }));
    console.log(`✅ Loaded ${products.length} products from Excel`);
    const themes = new Set(products.map(p => p.categories).filter(t => t));
    console.log('🎨 Available themes in Excel:', Array.from(themes));
    return products;
}
