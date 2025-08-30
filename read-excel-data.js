import XLSX from 'xlsx';
import fs from 'fs';

try {
    // Read the Excel file
    const workbook = XLSX.readFile('persona_artwork_data_mapped.xlsx');
    
    // Get the first sheet
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    
    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    // Save to JSON file for easier access
    fs.writeFileSync('catalog-data.json', JSON.stringify(data, null, 2));
    
    console.log(`Successfully read ${data.length} products from Excel file`);
    console.log('Sample data structure:');
    console.log(JSON.stringify(data[0], null, 2));
    
    // Show column names
    if (data.length > 0) {
        console.log('\nAvailable columns:');
        console.log(Object.keys(data[0]));
    }
    
} catch (error) {
    console.error('Error reading Excel file:', error.message);
}
