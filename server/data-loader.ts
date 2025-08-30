import path from 'path';
import xlsx from 'xlsx';
import { Product } from './types';

export async function loadProducts(): Promise<Product[]> {
    // Read Excel file and convert first sheet to JSON
    const excelPath = path.resolve(process.cwd(), process.env.CSV_FILE_PATH || 'mapped_persona_artwork_data.xlsx');
    console.log(`📂 Loading Excel from: ${excelPath}`);
    const workbook = xlsx.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    // raw data as array of object
    const raw: Record<string, unknown>[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });

    // Debug: Log the available columns
    if (raw.length > 0) {
        console.log('📊 Available Excel columns:', Object.keys(raw[0]));
        console.log('📝 First row sample:', raw[0]);
    }

    // map CSV headers to Product interface
    const products: Product[] = raw.map(row => ({
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

    // Debug: Show available themes
    const themes = new Set(products.map(p => p.categories).filter(t => t));
    console.log('🎨 Available themes in Excel:', Array.from(themes));

    return products;
} 