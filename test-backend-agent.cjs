#!/usr/bin/env node

/**
 * Backend Testing Agent
 * Tests all API endpoints to ensure the recommendation system is working
 */

const fetch = require('node-fetch');

class BackendTestingAgent {
    constructor() {
        this.baseUrl = 'http://localhost:8000';
        this.testResults = [];
    }

    async runAllTests() {
        console.log('🧪 Backend Testing Agent Starting...\n');
        
        try {
            // Test 1: Server Status
            await this.testServerStatus();
            
            // Test 2: Excel Data Loading
            await this.testExcelDataLoading();
            
            // Test 3: Recommendations Endpoint
            await this.testRecommendationsEndpoint();
            
            // Test 4: Artwork Data Endpoint
            await this.testArtworkDataEndpoint();
            
            // Test 5: Loading Images Endpoint
            await this.testLoadingImagesEndpoint();
            
            // Test 6: Test Updated Endpoint
            await this.testUpdatedEndpoint();
            
            // Print Summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ Testing failed:', error.message);
        }
    }

    async testServerStatus() {
        console.log('🔍 Test 1: Server Status');
        try {
            const response = await fetch(`${this.baseUrl}/api/status`);
            const data = await response.json();
            
            if (response.ok && data.status === 'Recommender API running') {
                console.log('✅ Server is running and responding');
                console.log(`📊 Status: ${data.status}`);
                this.testResults.push({ test: 'Server Status', status: 'PASS' });
            } else {
                console.log('❌ Server status check failed');
                console.log('Response:', data);
                this.testResults.push({ test: 'Server Status', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Server status check failed:', error.message);
            this.testResults.push({ test: 'Server Status', status: 'FAIL' });
        }
        console.log('');
    }

    async testExcelDataLoading() {
        console.log('🔍 Test 2: Excel Data Loading');
        try {
            const response = await fetch(`${this.baseUrl}/recommendations?description=test`);
            const data = await response.json();
            
            if (response.ok && data.recommendations && data.recommendations.length > 0) {
                console.log(`✅ Excel data loaded successfully: ${data.recommendations.length} products`);
                console.log(`📊 Sample product: ${data.recommendations[0].name}`);
                this.testResults.push({ test: 'Excel Data Loading', status: 'PASS' });
            } else {
                console.log('❌ Excel data loading failed');
                console.log('Response:', data);
                this.testResults.push({ test: 'Excel Data Loading', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Excel data loading failed:', error.message);
            this.testResults.push({ test: 'Excel Data Loading', status: 'FAIL' });
        }
        console.log('');
    }

    async testRecommendationsEndpoint() {
        console.log('🔍 Test 3: Recommendations Endpoint (POST)');
        try {
            const testPayload = {
                description: 'Style-conscious individual looking for bag bag for everyday use',
                bagType: 'bag',
                occasion: 'everyday',
                artworkTheme: 'Flowers/Plants'
            };

            const response = await fetch(`${this.baseUrl}/recommendations`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(testPayload)
            });

            const data = await response.json();
            
            if (response.ok && data.success && data.recommendations && data.recommendations.length > 0) {
                console.log(`✅ Recommendations endpoint working: ${data.recommendations.length} products`);
                console.log(`📝 Explanation: ${data.explanation}`);
                console.log(`👤 User Profile: ${data.userProfile.personality} - ${data.userProfile.artworkTheme}`);
                this.testResults.push({ test: 'Recommendations Endpoint', status: 'PASS' });
            } else {
                console.log('❌ Recommendations endpoint failed');
                console.log('Response:', data);
                this.testResults.push({ test: 'Recommendations Endpoint', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Recommendations endpoint failed:', error.message);
            this.testResults.push({ test: 'Recommendations Endpoint', status: 'FAIL' });
        }
        console.log('');
    }

    async testArtworkDataEndpoint() {
        console.log('🔍 Test 4: Artwork Data Endpoint');
        try {
            const response = await fetch(`${this.baseUrl}/api/artwork-data`);
            const data = await response.json();
            
            if (response.ok && data.success && data.data && data.data.length > 0) {
                console.log(`✅ Artwork data endpoint working: ${data.data.length} artworks`);
                console.log(`📊 Available themes: ${data.themes?.length || 0}`);
                console.log(`📊 Available product types: ${data.productTypes?.length || 0}`);
                this.testResults.push({ test: 'Artwork Data Endpoint', status: 'PASS' });
            } else {
                console.log('❌ Artwork data endpoint failed');
                console.log('Response:', data);
                this.testResults.push({ test: 'Artwork Data Endpoint', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Artwork data endpoint failed:', error.message);
            this.testResults.push({ test: 'Artwork Data Endpoint', status: 'FAIL' });
        }
        console.log('');
    }

    async testLoadingImagesEndpoint() {
        console.log('🔍 Test 5: Loading Images Endpoint');
        try {
            const response = await fetch(`${this.baseUrl}/loading-images`);
            const data = await response.json();
            
            if (response.ok && data.images && data.images.length > 0) {
                console.log(`✅ Loading images endpoint working: ${data.images.length} images`);
                this.testResults.push({ test: 'Loading Images Endpoint', status: 'PASS' });
            } else {
                console.log('❌ Loading images endpoint failed');
                this.testResults.push({ test: 'Loading Images Endpoint', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Loading images endpoint failed:', error.message);
            this.testResults.push({ test: 'Loading Images Endpoint', status: 'FAIL' });
        }
        console.log('');
    }

    async testUpdatedEndpoint() {
        console.log('🔍 Test 6: Test Updated Endpoint');
        try {
            const response = await fetch(`${this.baseUrl}/test-updated`);
            const data = await response.json();
            
            if (response.ok && data.message === 'Server is running updated code') {
                console.log('✅ Test updated endpoint working');
                this.testResults.push({ test: 'Test Updated Endpoint', status: 'PASS' });
            } else {
                console.log('❌ Test updated endpoint failed');
                this.testResults.push({ test: 'Test Updated Endpoint', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Test updated endpoint failed:', error.message);
            this.testResults.push({ test: 'Test Updated Endpoint', status: 'FAIL' });
        }
        console.log('');
    }

    printTestSummary() {
        console.log('📊 Test Summary:');
        console.log('================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const total = this.testResults.length;
        
        this.testResults.forEach(result => {
            const icon = result.status === 'PASS' ? '✅' : '❌';
            console.log(`${icon} ${result.test}: ${result.status}`);
        });
        
        console.log('\n📈 Results:');
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`❌ Failed: ${failed}/${total}`);
        console.log(`📊 Success Rate: ${Math.round((passed/total) * 100)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 All tests passed! The backend is working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Please check the errors above.');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const agent = new BackendTestingAgent();
    agent.runAllTests();
}

module.exports = BackendTestingAgent;
