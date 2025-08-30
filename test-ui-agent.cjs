#!/usr/bin/env node

/**
 * UI Testing Agent
 * Tests frontend components and user flows to ensure the recommendation system works end-to-end
 */

const puppeteer = require('puppeteer');

class UITestingAgent {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.testResults = [];
        this.browser = null;
        this.page = null;
    }

    async runAllTests() {
        console.log('🎨 UI Testing Agent Starting...\n');
        
        try {
            // Launch browser
            await this.launchBrowser();
            
            // Test 1: Homepage Loading
            await this.testHomepageLoading();
            
            // Test 2: Personality Quiz Flow
            await this.testPersonalityQuizFlow();
            
            // Test 3: Artwork Selection Flow
            await this.testArtworkSelectionFlow();
            
            // Test 4: Recommendations Display
            await this.testRecommendationsDisplay();
            
            // Test 5: Product Details
            await this.testProductDetails();
            
            // Test 6: Navigation and Routing
            await this.testNavigationAndRouting();
            
            // Print Summary
            this.printTestSummary();
            
        } catch (error) {
            console.error('❌ UI Testing failed:', error.message);
        } finally {
            await this.cleanup();
        }
    }

    async launchBrowser() {
        console.log('🌐 Launching browser...');
        this.browser = await puppeteer.launch({ 
            headless: false, // Set to true for headless testing
            slowMo: 100 // Slow down actions for visibility
        });
        this.page = await this.browser.newPage();
        
        // Set viewport
        await this.page.setViewport({ width: 1280, height: 720 });
        
        console.log('✅ Browser launched successfully\n');
    }

    async testHomepageLoading() {
        console.log('🔍 Test 1: Homepage Loading');
        try {
            await this.page.goto(this.baseUrl, { waitUntil: 'networkidle0' });
            
            // Check if homepage loads
            const title = await this.page.title();
            if (title && title.includes('Persona')) {
                console.log('✅ Homepage loaded successfully');
                console.log(`📄 Page title: ${title}`);
                this.testResults.push({ test: 'Homepage Loading', status: 'PASS' });
            } else {
                console.log('❌ Homepage title not found');
                this.testResults.push({ test: 'Homepage Loading', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Homepage loading failed:', error.message);
            this.testResults.push({ test: 'Homepage Loading', status: 'FAIL' });
        }
        console.log('');
    }

    async testPersonalityQuizFlow() {
        console.log('🔍 Test 2: Personality Quiz Flow');
        try {
            // Navigate to personality quiz
            await this.page.goto(`${this.baseUrl}/personality-quiz`, { waitUntil: 'networkidle0' });
            
            // Wait for quiz to load
            await this.page.waitForSelector('[data-testid="quiz-question"]', { timeout: 10000 });
            
            // Answer first question
            const firstOption = await this.page.$('[data-testid="quiz-option"]');
            if (firstOption) {
                await firstOption.click();
                console.log('✅ First quiz question answered');
                
                // Wait for next question or results
                await this.page.waitForTimeout(2000);
                
                this.testResults.push({ test: 'Personality Quiz Flow', status: 'PASS' });
            } else {
                console.log('❌ Quiz options not found');
                this.testResults.push({ test: 'Personality Quiz Flow', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Personality quiz flow failed:', error.message);
            this.testResults.push({ test: 'Personality Quiz Flow', status: 'FAIL' });
        }
        console.log('');
    }

    async testArtworkSelectionFlow() {
        console.log('🔍 Test 3: Artwork Selection Flow');
        try {
            // Navigate to artwork selection
            await this.page.goto(`${this.baseUrl}/artwork-selection`, { waitUntil: 'networkidle0' });
            
            // Wait for artwork options to load
            await this.page.waitForSelector('[data-testid="artwork-option"]', { timeout: 10000 });
            
            // Select an artwork theme
            const artworkOption = await this.page.$('[data-testid="artwork-option"]');
            if (artworkOption) {
                await artworkOption.click();
                console.log('✅ Artwork theme selected');
                
                // Wait for bag type selection
                await this.page.waitForTimeout(2000);
                
                // Select a bag type
                const bagTypeOption = await this.page.$('[data-testid="bag-type-option"]');
                if (bagTypeOption) {
                    await bagTypeOption.click();
                    console.log('✅ Bag type selected');
                    this.testResults.push({ test: 'Artwork Selection Flow', status: 'PASS' });
                } else {
                    console.log('❌ Bag type options not found');
                    this.testResults.push({ test: 'Artwork Selection Flow', status: 'FAIL' });
                }
            } else {
                console.log('❌ Artwork options not found');
                this.testResults.push({ test: 'Artwork Selection Flow', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Artwork selection flow failed:', error.message);
            this.testResults.push({ test: 'Artwork Selection Flow', status: 'FAIL' });
        }
        console.log('');
    }

    async testRecommendationsDisplay() {
        console.log('🔍 Test 4: Recommendations Display');
        try {
            // Wait for recommendations to load
            await this.page.waitForSelector('[data-testid="recommendation-item"]', { timeout: 15000 });
            
            // Check if recommendations are displayed
            const recommendations = await this.page.$$('[data-testid="recommendation-item"]');
            if (recommendations.length > 0) {
                console.log(`✅ Recommendations displayed: ${recommendations.length} items`);
                
                // Check if images are loading
                const images = await this.page.$$('[data-testid="recommendation-item"] img');
                if (images.length > 0) {
                    console.log(`✅ Product images loaded: ${images.length} images`);
                }
                
                this.testResults.push({ test: 'Recommendations Display', status: 'PASS' });
            } else {
                console.log('❌ No recommendations displayed');
                this.testResults.push({ test: 'Recommendations Display', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Recommendations display failed:', error.message);
            this.testResults.push({ test: 'Recommendations Display', status: 'FAIL' });
        }
        console.log('');
    }

    async testProductDetails() {
        console.log('🔍 Test 5: Product Details');
        try {
            // Click on first recommendation to view details
            const firstRecommendation = await this.page.$('[data-testid="recommendation-item"]');
            if (firstRecommendation) {
                await firstRecommendation.click();
                
                // Wait for product details to load
                await this.page.waitForTimeout(2000);
                
                // Check if product details are displayed
                const productName = await this.page.$('[data-testid="product-name"]');
                const productPrice = await this.page.$('[data-testid="product-price"]');
                
                if (productName || productPrice) {
                    console.log('✅ Product details displayed');
                    this.testResults.push({ test: 'Product Details', status: 'PASS' });
                } else {
                    console.log('❌ Product details not found');
                    this.testResults.push({ test: 'Product Details', status: 'FAIL' });
                }
            } else {
                console.log('❌ No recommendations to test');
                this.testResults.push({ test: 'Product Details', status: 'FAIL' });
            }
        } catch (error) {
            console.log('❌ Product details test failed:', error.message);
            this.testResults.push({ test: 'Product Details', status: 'FAIL' });
        }
        console.log('');
    }

    async testNavigationAndRouting() {
        console.log('🔍 Test 6: Navigation and Routing');
        try {
            // Test navigation between pages
            const pages = ['/', '/personality-quiz', '/artwork-selection', '/upload'];
            let navigationSuccess = 0;
            
            for (const page of pages) {
                try {
                    await this.page.goto(`${this.baseUrl}${page}`, { waitUntil: 'networkidle0' });
                    navigationSuccess++;
                    console.log(`✅ Navigated to ${page}`);
                } catch (error) {
                    console.log(`❌ Failed to navigate to ${page}`);
                }
            }
            
            if (navigationSuccess === pages.length) {
                console.log('✅ All navigation routes working');
                this.testResults.push({ test: 'Navigation and Routing', status: 'PASS' });
            } else {
                console.log(`⚠️ ${navigationSuccess}/${pages.length} navigation routes working`);
                this.testResults.push({ test: 'Navigation and Routing', status: 'PARTIAL' });
            }
        } catch (error) {
            console.log('❌ Navigation test failed:', error.message);
            this.testResults.push({ test: 'Navigation and Routing', status: 'FAIL' });
        }
        console.log('');
    }

    printTestSummary() {
        console.log('📊 UI Test Summary:');
        console.log('===================');
        
        const passed = this.testResults.filter(r => r.status === 'PASS').length;
        const failed = this.testResults.filter(r => r.status === 'FAIL').length;
        const partial = this.testResults.filter(r => r.status === 'PARTIAL').length;
        const total = this.testResults.length;
        
        this.testResults.forEach(result => {
            let icon = '❌';
            if (result.status === 'PASS') icon = '✅';
            else if (result.status === 'PARTIAL') icon = '⚠️';
            console.log(`${icon} ${result.test}: ${result.status}`);
        });
        
        console.log('\n📈 Results:');
        console.log(`✅ Passed: ${passed}/${total}`);
        console.log(`⚠️ Partial: ${partial}/${total}`);
        console.log(`❌ Failed: ${failed}/${total}`);
        console.log(`📊 Success Rate: ${Math.round(((passed + partial * 0.5)/total) * 100)}%`);
        
        if (failed === 0) {
            console.log('\n🎉 All UI tests passed! The frontend is working correctly.');
        } else {
            console.log('\n⚠️ Some UI tests failed. Please check the errors above.');
        }
    }

    async cleanup() {
        if (this.browser) {
            await this.browser.close();
            console.log('🔒 Browser closed');
        }
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const agent = new UITestingAgent();
    agent.runAllTests();
}

module.exports = UITestingAgent;
