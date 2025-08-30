import { processUserInputs } from './fashion-stylist-system.js';

// Test case 1: Animal theme with crossbody preference
const testUser1 = {
    artworkTheme: 'Animal',
    productType: 'crossbody',
    personality: {
        boldness: 85,
        elegance: 45,
        whimsy: 70
    },
    sentiment: 'Positive'
};

// Test case 2: Flowers/Plants theme with clutch preference
const testUser2 = {
    artworkTheme: 'Flowers/Plants',
    productType: 'clutch',
    personality: {
        boldness: 30,
        elegance: 95,
        whimsy: 60
    },
    sentiment: 'Balanced'
};

// Test case 3: Pattern/Abstract theme with pouch preference (no personality data)
const testUser3 = {
    artworkTheme: 'Pattern/Abstract',
    productType: 'pouch',
    sentiment: 'Negative'
};

console.log('=== FASHION STYLIST SYSTEM TEST ===\n');

console.log('Test Case 1: Animal + Crossbody + Bold Personality');
console.log('User Inputs:', JSON.stringify(testUser1, null, 2));
console.log('\nResults:');
console.log(JSON.stringify(processUserInputs(testUser1), null, 2));

console.log('\n' + '='.repeat(80) + '\n');

console.log('Test Case 2: Flowers/Plants + Clutch + Elegant Personality');
console.log('User Inputs:', JSON.stringify(testUser2, null, 2));
console.log('\nResults:');
console.log(JSON.stringify(processUserInputs(testUser2), null, 2));

console.log('\n' + '='.repeat(80) + '\n');

console.log('Test Case 3: Pattern/Abstract + Pouch (No Personality Data)');
console.log('User Inputs:', JSON.stringify(testUser3, null, 2));
console.log('\nResults:');
console.log(JSON.stringify(processUserInputs(testUser3), null, 2));
