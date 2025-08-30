const fs = require('fs');
const path = require('path');

// Debug script for recommendations endpoint
console.log('=== RECOMMENDATIONS DEBUG SCRIPT ===');

// Test data for different scenarios
const testScenarios = [
    {
        name: 'Upload with Image + Questions',
        description: 'Test upload section with image and questions',
        data: {
            description: 'User wants a crossbody bag for casual day out',
            bagType: 'crossbody',
            occasion: 'casual'
        },
        hasFile: true
    },
    {
        name: 'Personality Quiz + Artwork Selection',
        description: 'Test personality bag recommendation with artwork theme',
        data: {
            description: 'Personality: Bold Adventurer. Artwork Theme: Animals. Product Type: Crossbody. Sentiment: Confident.',
            userProfile: {
                personality: 'Bold Adventurer',
                sentiment: 'Confident',
                personalityScores: {
                    Boldness: 85,
                    Elegance: 60,
                    Whimsy: 75
                },
                dominantTraits: ['Boldness', 'Whimsy', 'Elegance'],
                artworkTheme: 'Animals',
                bagType: 'Crossbody',
                quizAnswers: [
                    { question: 'What do you prefer?', answer: 'Adventure and risk-taking' },
                    { question: 'How do you make decisions?', answer: 'Quick and decisive' }
                ]
            }
        },
        hasFile: false
    },
    {
        name: 'Simple Text Description',
        description: 'Test basic text-based recommendations',
        data: {
            description: 'I need a professional tote bag for work meetings'
        },
        hasFile: false
    }
];

// Check if required files exist
const requiredFiles = [
    'public/Anuschka_Artwork_Personality_Descriptions.csv',
    'public/updated_ml_bags_personality_dataset_cleaned.csv',
    'server/lib/enhancedRecommendationEngine.cjs'
];

console.log('\n=== CHECKING REQUIRED FILES ===');
requiredFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`${exists ? '✅' : '❌'} ${file} - ${exists ? 'Found' : 'Missing'}`);
});

// Check environment variables
console.log('\n=== CHECKING ENVIRONMENT ===');
const envVars = [
    'GEMINI_API_KEY',
    'NODE_ENV',
    'PORT'
];

envVars.forEach(varName => {
    const value = process.env[varName];
    if (value) {
        const masked = varName === 'GEMINI_API_KEY' ? 
            (value.length > 10 ? value.substring(0, 10) + '...' : '***') : 
            value;
        console.log(`✅ ${varName}: ${masked}`);
    } else {
        console.log(`❌ ${varName}: Not set`);
    }
});

// Test enhanced recommendation engine
console.log('\n=== TESTING ENHANCED RECOMMENDATION ENGINE ===');
try {
    const { EnhancedRecommendationEngine } = require('./lib/enhancedRecommendationEngine.cjs');
    const engine = new EnhancedRecommendationEngine();
    console.log('✅ Enhanced recommendation engine loaded successfully');
    
    // Test with sample data
    const testProducts = [
        {
            id: '1',
            artworkName: 'Leopard Safari',
            productName: 'Crossbody Bag',
            productType: 'Crossbody',
            price: '$199',
            imageUrl: '/test-image.jpg',
            productUrl: 'https://example.com',
            personalityTraits: 'Bold and adventurous'
        },
        {
            id: '2',
            artworkName: 'Floral Garden',
            productName: 'Tote Bag',
            productType: 'Tote',
            price: '$249',
            imageUrl: '/test-image2.jpg',
            productUrl: 'https://example.com',
            personalityTraits: 'Elegant and refined'
        }
    ];
    
    const testUserProfile = {
        personality: 'Bold Adventurer',
        sentiment: 'Confident',
        personalityScores: { Boldness: 85, Elegance: 60, Whimsy: 75 },
        dominantTraits: ['Boldness', 'Whimsy', 'Elegance'],
        artworkTheme: 'Animals',
        bagType: 'Crossbody'
    };
    
    const result = engine.generateRecommendations(testProducts, testUserProfile);
    console.log('✅ Engine test successful:', {
        productsCount: result.products?.length || 0,
        matchConfidence: result.matchConfidence,
        hasStyleInsights: !!result.styleInsights,
        hasPersonalizedAdvice: !!result.personalizedAdvice
    });
    
} catch (error) {
    console.error('❌ Enhanced recommendation engine test failed:', error.message);
}

// Test CSV data loading
console.log('\n=== TESTING CSV DATA LOADING ===');
try {
    const csvPath = path.join(process.cwd(), 'public', 'Anuschka_Artwork_Personality_Descriptions.csv');
    if (fs.existsSync(csvPath)) {
        const stats = fs.statSync(csvPath);
        console.log(`✅ Artwork personality CSV found: ${stats.size} bytes`);
        
        // Read first few lines to check format
        const content = fs.readFileSync(csvPath, 'utf8');
        const lines = content.split('\n').slice(0, 3);
        console.log('CSV format check (first 3 lines):');
        lines.forEach((line, i) => {
            if (line.trim()) {
                console.log(`  Line ${i + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
            }
        });
    } else {
        console.log('❌ Artwork personality CSV not found');
    }
} catch (error) {
    console.error('❌ CSV loading test failed:', error.message);
}

// Test product database loading
console.log('\n=== TESTING PRODUCT DATABASE ===');
try {
    const productCsvPath = path.join(process.cwd(), 'public', 'updated_ml_bags_personality_dataset_cleaned.csv');
    if (fs.existsSync(productCsvPath)) {
        const stats = fs.statSync(productCsvPath);
        console.log(`✅ Product database CSV found: ${stats.size} bytes`);
        
        // Read first few lines to check format
        const content = fs.readFileSync(productCsvPath, 'utf8');
        const lines = content.split('\n').slice(0, 3);
        console.log('Product CSV format check (first 3 lines):');
        lines.forEach((line, i) => {
            if (line.trim()) {
                console.log(`  Line ${i + 1}: ${line.substring(0, 100)}${line.length > 100 ? '...' : ''}`);
            }
        });
    } else {
        console.log('❌ Product database CSV not found');
    }
} catch (error) {
    console.error('❌ Product database test failed:', error.message);
}

// Generate test recommendations request
console.log('\n=== GENERATING TEST RECOMMENDATIONS REQUEST ===');
testScenarios.forEach((scenario, index) => {
    console.log(`\n--- Test Scenario ${index + 1}: ${scenario.name} ---`);
    console.log(`Description: ${scenario.description}`);
    
    if (scenario.hasFile) {
        console.log('📁 This scenario includes file upload');
        console.log('   - Create a test image file (e.g., test-image.jpg)');
        console.log('   - Use FormData to send file + data');
    }
    
    console.log('📊 Request data:');
    console.log(JSON.stringify(scenario.data, null, 2));
    
    console.log('🔗 Test with:');
    if (scenario.hasFile) {
        console.log('   curl -X POST http://localhost:8000/recommendations \\');
        console.log('     -F "file=@test-image.jpg" \\');
        console.log('     -F "description=\'User wants a crossbody bag for casual day out\'" \\');
        console.log('     -F "bagType=crossbody" \\');
        console.log('     -F "occasion=casual"');
    } else {
        console.log('   curl -X POST http://localhost:8000/recommendations \\');
        console.log('     -H "Content-Type: application/json" \\');
        console.log('     -d \'' + JSON.stringify(scenario.data) + '\'');
    }
});

// Common issues and solutions
console.log('\n=== COMMON ISSUES AND SOLUTIONS ===');
const issues = [
    {
        issue: 'Upload section not working',
        causes: [
            'Missing multer middleware configuration',
            'File size limits too small',
            'Incorrect form field names',
            'Missing file validation'
        ],
        solutions: [
            'Check multer configuration in server/index.ts',
            'Verify form field names match server expectations',
            'Check file size limits and allowed types',
            'Ensure proper error handling for file uploads'
        ]
    },
    {
        issue: 'Personality bag recommendations not working',
        causes: [
            'Enhanced recommendation engine not loading',
            'Missing personality data or scores',
            'CSV files not properly loaded',
            'LLM API key issues'
        ],
        solutions: [
            'Check enhancedRecommendationEngine.cjs file exists',
            'Verify personality data structure in userProfile',
            'Ensure CSV files are in public/ directory',
            'Check GEMINI_API_KEY environment variable'
        ]
    },
    {
        issue: 'Questions not working properly',
        causes: [
            'Missing question data or options',
            'State management issues',
            'Navigation problems',
            'API endpoint errors'
        ],
        solutions: [
            'Check question data structure in components',
            'Verify React state management',
            'Check navigation logic and routes',
            'Test API endpoints with debug logging'
        ]
    }
];

issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${issue.issue}`);
    console.log('   Causes:');
    issue.causes.forEach(cause => console.log(`     - ${cause}`));
    console.log('   Solutions:');
    issue.solutions.forEach(solution => console.log(`     - ${solution}`));
});

console.log('\n=== DEBUG SCRIPT COMPLETE ===');
console.log('Next steps:');
console.log('1. Start the server: npm run dev');
console.log('2. Check server logs for detailed error information');
console.log('3. Test each scenario with the provided curl commands');
console.log('4. Check browser console for frontend errors');
console.log('5. Verify all required files exist and are accessible');
