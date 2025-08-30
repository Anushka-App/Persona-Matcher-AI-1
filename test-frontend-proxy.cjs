const fetch = require('node-fetch');

async function testFrontendProxy() {
    console.log('🧪 Testing Animal + Crossbody through frontend proxy...');
    
    const testData = {
        artworkTheme: 'Animal',
        bagType: 'crossbody',
        description: 'Test request for Animal theme and Crossbody bag type'
    };
    
    try {
        // Test through the frontend proxy (port 3001)
        console.log('📤 Sending request to http://localhost:3001/recommendations...');
        console.log('Request data:', JSON.stringify(testData, null, 2));
        
        const response = await fetch('http://localhost:3001/recommendations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log(`📥 Response status: ${response.status}`);
        
        if (response.ok) {
            const data = await response.json();
            console.log('✅ Response received successfully!');
            console.log(`📊 Number of recommendations: ${data.recommendations ? data.recommendations.length : 0}`);
            
            if (data.recommendations && data.recommendations.length > 0) {
                console.log('\n📦 Sample recommendations:');
                data.recommendations.slice(0, 3).forEach((rec, index) => {
                    console.log(`${index + 1}. ${rec.artworkName} - ${rec.productName} (${rec.productType})`);
                });
            } else {
                console.log('❌ No recommendations returned!');
            }
        } else {
            console.log('❌ Error response:');
            const errorText = await response.text();
            console.log(errorText);
        }
    } catch (error) {
        console.error('❌ Network error:', error.message);
    }
}

testFrontendProxy();
