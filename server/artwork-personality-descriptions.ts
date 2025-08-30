import path from 'path';
import xlsx from 'xlsx';
import fs from 'fs';

interface ArtworkPersonalityDescription {
    artworkName: string;
    artworkUrl: string;
    imageUrl: string;
    designElements: string;
    overallPersonality: string;
    buyerPersonalityMatch: string;
    psychologicalAppeal: string;
}

const artworkDescriptions: Map<string, ArtworkPersonalityDescription> = new Map();

export async function loadArtworkPersonalityDescriptions(): Promise<Map<string, ArtworkPersonalityDescription>> {
    try {
        // Try to read the CSV file from the public directory (optional file)
        const csvPath = path.resolve(process.cwd(), 'public/Anuschka_Artwork_Personality_Descriptions.csv');

        // Check if file exists before trying to read it
        if (!fs.existsSync(csvPath)) {
            console.log('📄 Optional artwork personality descriptions file not found, using LLM generation instead');
            return artworkDescriptions; // Return empty map
        }

        const workbook = xlsx.readFile(csvPath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];

        // Convert to JSON
        const raw: Record<string, unknown>[] = xlsx.utils.sheet_to_json(sheet, { defval: '' });

        // Clear existing map
        artworkDescriptions.clear();

        // Process each row
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
    } catch (error) {
        console.error('❌ Error loading artwork personality descriptions:', error);
        return new Map();
    }
}

export function getArtworkDescription(artworkName: string): ArtworkPersonalityDescription | undefined {
    return artworkDescriptions.get(artworkName);
}

export function getArtworkPersonality(artworkName: string): string {
    const description = artworkDescriptions.get(artworkName);
    if (description && description.overallPersonality) {
        return description.overallPersonality;
    }
    return `${artworkName} - Beautiful handcrafted bag with unique artwork that reflects your personality`;
}
