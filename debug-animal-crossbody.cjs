const XLSX = require('xlsx');

// Load the Excel data
const workbook = XLSX.readFile('mapped_persona_artwork_data.xlsx');
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet);

// Simulate the filtering logic from server/index.ts
function testAnimalCrossbodyFiltering() {
    const artworkTheme = 'Animal';
    const bagType = 'crossbody';
    const bagPref = 'Crossbody'; // This is what the server maps 'crossbody' to
    
    console.log(`🎯 Testing filtering for: Artwork Theme = "${artworkTheme}", Bag Type = "${bagType}" (mapped to "${bagPref}")`);
    console.log('=' .repeat(80));
    
    // First, let's see all Animal themed items
    const animalItems = data.filter(row => row['Themes'] === 'Animal');
    console.log(`📊 Total Animal themed items: ${animalItems.length}`);
    
    // Now let's see all Crossbody items
    const crossbodyItems = data.filter(row => row['Product Type'] === 'Crossbody');
    console.log(`📊 Total Crossbody items: ${crossbodyItems.length}`);
    
    // Now let's see Animal + Crossbody combinations
    const animalCrossbodyItems = data.filter(row => 
        row['Themes'] === 'Animal' && row['Product Type'] === 'Crossbody'
    );
    console.log(`📊 Total Animal + Crossbody items: ${animalCrossbodyItems.length}`);
    
    console.log('\n🔍 Sample Animal + Crossbody items:');
    animalCrossbodyItems.slice(0, 5).forEach((row, index) => {
        console.log(`${index + 1}. ${row['Artwork Name']} - ${row['Product Name']}`);
    });
    
    // Now let's simulate the exact filtering logic from the server
    console.log('\n🔧 Testing server filtering logic...');
    
    const matches = data.filter(p => {
        // Check artwork theme
        let themeMatch = false;
        const excelThemes = p['Themes']?.toLowerCase() || '';
        const artworkLower = p['Artwork Name']?.toLowerCase() || '';
        
        // Animal theme matching logic from server
        if (artworkTheme.toLowerCase() === 'animal') {
            themeMatch = excelThemes.includes('animal');
            
            if (!themeMatch) {
                const animalKeywords = [
                    'leopard', 'tiger', 'lion', 'elephant', 'zebra', 'giraffe', 'cheetah', 'safari', 'wildlife', 'jungle',
                    'bird', 'eagle', 'owl', 'peacock', 'flamingo', 'parrot', 'cardinal', 'robin', 'swan',
                    'cat', 'dog', 'horse', 'bear', 'wolf', 'fox', 'deer', 'rabbit', 'butterfly', 'fish', 'turtle',
                    'abstract leopard', 'wild', 'creature', 'beast', 'fauna', 'dragon', 'phoenix'
                ];
                themeMatch = animalKeywords.some(keyword => artworkLower.includes(keyword));
                
                const flowerExclusions = ['garden', 'rose', 'floral', 'bloom', 'petal', 'flower', 'botanical'];
                const hasFlowerTerms = flowerExclusions.some(term => artworkLower.includes(term));
                if (hasFlowerTerms && !artworkLower.includes('safari') && !artworkLower.includes('wild')) {
                    themeMatch = false;
                }
            }
        }
        
        // Check bag type
        const bagMatch = p['Product Type']?.toLowerCase().includes(bagPref.toLowerCase()) ||
            p['Product Name']?.toLowerCase().includes(bagPref.toLowerCase());
        
        return themeMatch && bagMatch;
    });
    
    console.log(`✅ Server logic found ${matches.length} matches`);
    
    if (matches.length > 0) {
        console.log('\n📦 Sample matches from server logic:');
        matches.slice(0, 5).forEach((match, index) => {
            console.log(`${index + 1}. ${match['Artwork Name']} - ${match['Product Name']} (${match['Product Type']})`);
        });
    } else {
        console.log('❌ No matches found! This explains the issue.');
        
        // Let's debug why no matches
        console.log('\n🔍 Debugging why no matches:');
        
        // Check theme matching
        const themeMatches = data.filter(p => {
            const excelThemes = p['Themes']?.toLowerCase() || '';
            return excelThemes.includes('animal');
        });
        console.log(`Theme matches (exact 'animal' in Themes): ${themeMatches.length}`);
        
        // Check bag matching
        const bagMatches = data.filter(p => {
            return p['Product Type']?.toLowerCase().includes('crossbody');
        });
        console.log(`Bag matches (contains 'crossbody'): ${bagMatches.length}`);
        
        // Check both
        const bothMatches = data.filter(p => {
            const excelThemes = p['Themes']?.toLowerCase() || '';
            return excelThemes.includes('animal') && p['Product Type']?.toLowerCase().includes('crossbody');
        });
        console.log(`Both matches: ${bothMatches.length}`);
    }
}

testAnimalCrossbodyFiltering();
