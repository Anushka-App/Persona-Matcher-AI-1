#!/usr/bin/env node

/**
 * Test Runner Script
 * Runs both backend and UI testing agents to verify the entire system
 */

const BackendTestingAgent = require('./test-backend-agent');
const UITestingAgent = require('./test-ui-agent');

class TestRunner {
    constructor() {
        this.backendAgent = new BackendTestingAgent();
        this.uiAgent = new UITestingAgent();
        this.overallResults = [];
    }

    async runAllTests() {
        console.log('🚀 Test Runner Starting...\n');
        console.log('=' .repeat(50));
        
        try {
            // Run Backend Tests
            console.log('🧪 Running Backend Tests...\n');
            await this.runBackendTests();
            
            console.log('\n' + '=' .repeat(50));
            
            // Run UI Tests
            console.log('🎨 Running UI Tests...\n');
            await this.runUITests();
            
            // Print Overall Summary
            this.printOverallSummary();
            
        } catch (error) {
            console.error('❌ Test runner failed:', error.message);
        }
    }

    async runBackendTests() {
        try {
            // Override the printTestSummary method to capture results
            const originalPrintSummary = this.backendAgent.printTestSummary.bind(this.backendAgent);
            
            this.backendAgent.printTestSummary = () => {
                // Capture results without printing
                this.overallResults.push({
                    category: 'Backend',
                    results: [...this.backendAgent.testResults]
                });
            };
            
            await this.backendAgent.runAllTests();
            
            // Restore original method and print results
            this.backendAgent.printTestSummary = originalPrintSummary;
            this.backendAgent.printTestSummary();
            
        } catch (error) {
            console.error('❌ Backend tests failed:', error.message);
            this.overallResults.push({
                category: 'Backend',
                results: [{ test: 'Backend Tests', status: 'FAIL' }]
            });
        }
    }

    async runUITests() {
        try {
            // Override the printTestSummary method to capture results
            const originalPrintSummary = this.uiAgent.printTestSummary.bind(this.uiAgent);
            
            this.uiAgent.printTestSummary = () => {
                // Capture results without printing
                this.overallResults.push({
                    category: 'UI',
                    results: [...this.uiAgent.testResults]
                });
            };
            
            await this.uiAgent.runAllTests();
            
            // Restore original method and print results
            this.uiAgent.printTestSummary = originalPrintSummary;
            this.uiAgent.printTestSummary();
            
        } catch (error) {
            console.error('❌ UI tests failed:', error.message);
            this.overallResults.push({
                category: 'UI',
                results: [{ test: 'UI Tests', status: 'FAIL' }]
            });
        }
    }

    printOverallSummary() {
        console.log('\n' + '=' .repeat(50));
        console.log('🏆 OVERALL TEST SUMMARY');
        console.log('=' .repeat(50));
        
        let totalTests = 0;
        let totalPassed = 0;
        let totalFailed = 0;
        let totalPartial = 0;
        
        this.overallResults.forEach(category => {
            console.log(`\n📊 ${category.category} Results:`);
            
            const passed = category.results.filter(r => r.status === 'PASS').length;
            const failed = category.results.filter(r => r.status === 'FAIL').length;
            const partial = category.results.filter(r => r.status === 'PARTIAL').length;
            const total = category.results.length;
            
            console.log(`   ✅ Passed: ${passed}/${total}`);
            console.log(`   ⚠️ Partial: ${partial}/${total}`);
            console.log(`   ❌ Failed: ${failed}/${total}`);
            
            totalTests += total;
            totalPassed += passed;
            totalFailed += failed;
            totalPartial += partial;
        });
        
        console.log('\n' + '=' .repeat(50));
        console.log('📈 OVERALL RESULTS:');
        console.log(`   Total Tests: ${totalTests}`);
        console.log(`   ✅ Passed: ${totalPassed}`);
        console.log(`   ⚠️ Partial: ${totalPartial}`);
        console.log(`   ❌ Failed: ${totalFailed}`);
        
        const successRate = Math.round(((totalPassed + totalPartial * 0.5) / totalTests) * 100);
        console.log(`   📊 Success Rate: ${successRate}%`);
        
        if (totalFailed === 0) {
            console.log('\n🎉 EXCELLENT! All tests passed! The system is working perfectly.');
        } else if (totalFailed <= 2) {
            console.log('\n⚠️ GOOD! Most tests passed. A few minor issues to address.');
        } else {
            console.log('\n❌ ATTENTION NEEDED! Several tests failed. Please review the issues above.');
        }
        
        console.log('\n' + '=' .repeat(50));
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    const runner = new TestRunner();
    runner.runAllTests();
}

module.exports = TestRunner;
