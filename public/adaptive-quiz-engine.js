/**
 * Enhanced Adaptive Personality Quiz - Branching Logic Module
 * Implements dynamic question flow and intelligent personality assessment
 */

class AdaptiveQuizEngine {
    constructor(quizData) {
        this.quizData = quizData;
        this.userScores = {};
        this.quizHistory = [];
        this.userResponses = [];
        this.currentNode = null;
        this.questionNumber = 1;
        this.adaptationThreshold = 25; // Threshold for applying adaptive logic
        
        this.initializeScores();
    }
    
    initializeScores() {
        // Initialize all personality dimensions to 0
        const allDimensions = [
            ...this.quizData.dimensions.style,
            ...this.quizData.dimensions.aaker
        ];
        
        allDimensions.forEach(dimension => {
            this.userScores[dimension] = 0;
        });
    }
    
    /**
     * Get the next question based on current node and selected option
     */
    getNextQuestion(currentNodeId, selectedOptionIndex) {
        const node = this.quizData.graph.nodes[currentNodeId];
        if (!node || !node.options[selectedOptionIndex]) {
            console.error('Invalid node or option:', currentNodeId, selectedOptionIndex);
            return null;
        }
        
        const selectedOption = node.options[selectedOptionIndex];
        
        // Record the user's journey
        this.recordResponse(currentNodeId, selectedOptionIndex, node, selectedOption);
        
        // Apply weights to scores
        this.applyWeights(selectedOption.weights);
        
        // Determine next node with adaptive logic
        let nextNodeId = selectedOption.next;
        
        if (this.shouldApplyAdaptiveLogic(currentNodeId)) {
            nextNodeId = this.getAdaptiveNextNode(currentNodeId, selectedOption);
        }
        
        return nextNodeId;
    }
    
    recordResponse(nodeId, optionIndex, node, selectedOption) {
        const response = {
            nodeId: nodeId,
            question: node.question,
            selectedIndex: optionIndex,
            selectedText: selectedOption.text,
            weights: selectedOption.weights,
            timestamp: Date.now(),
            questionNumber: this.questionNumber
        };
        
        this.quizHistory.push(response);
        this.userResponses.push({
            nodeId: nodeId,
            questionNumber: this.questionNumber,
            question: node.question,
            selectedOption: selectedOption.text,
            weights: selectedOption.weights
        });
        // Advance question counter after recording
        this.questionNumber += 1;
    }
    
    applyWeights(weights) {
        Object.keys(weights).forEach(trait => {
            if (this.userScores.hasOwnProperty(trait)) {
                this.userScores[trait] += weights[trait];
            }
        });
    }
    
    shouldApplyAdaptiveLogic(nodeId) {
        const totalScore = Object.values(this.userScores).reduce((sum, score) => sum + score, 0);
        const majorBranchPoints = ['Q1', 'Q2A', 'Q2B', 'Q2C', 'Q2D', 'Q3A', 'Q3B', 'Q3C', 'Q3D'];
        
        return (
            totalScore > this.adaptationThreshold ||
            majorBranchPoints.includes(nodeId) ||
            this.questionNumber > 2
        );
    }
    
    getAdaptiveNextNode(currentNodeId, selectedOption) {
        const personalityProfile = this.getCurrentPersonalityProfile();
        const dominantTraits = personalityProfile.dominantTraits;
        
        // Advanced branching logic based on personality emergence
        if (dominantTraits.length >= 2) {
            const [primaryTrait, secondaryTrait] = dominantTraits;
            
            // Wild/Bold path optimization
            if (this.isWildPersonality(primaryTrait, secondaryTrait)) {
                return this.getWildPath(selectedOption.next);
            }
            
            // Elegant/Refined path optimization
            if (this.isElegantPersonality(primaryTrait, secondaryTrait)) {
                return this.getElegantPath(selectedOption.next);
            }
            
            // Creative/Artistic path optimization
            if (this.isCreativePersonality(primaryTrait, secondaryTrait)) {
                return this.getCreativePath(selectedOption.next);
            }
            
            // Minimalist/Practical path optimization
            if (this.isMinimalistPersonality(primaryTrait, secondaryTrait)) {
                return this.getMinimalistPath(selectedOption.next);
            }
        }
        
        // Default to original branching if no specific pattern detected
        return selectedOption.next;
    }
    
    getCurrentPersonalityProfile() {
        const totalScore = Object.values(this.userScores).reduce((sum, score) => sum + score, 0);
        const sortedTraits = Object.keys(this.userScores)
            .sort((a, b) => this.userScores[b] - this.userScores[a]);
        
        const dominantTraits = sortedTraits
            .filter(trait => this.userScores[trait] > 0)
            .slice(0, 4);
        
        return {
            totalScore,
            dominantTraits,
            scores: { ...this.userScores }
        };
    }
    
    isWildPersonality(primary, secondary) {
        const wildTraits = ['Boldness', 'Excitement', 'Ruggedness', 'Color Playfulness'];
        return wildTraits.includes(primary) || wildTraits.includes(secondary);
    }
    
    isElegantPersonality(primary, secondary) {
        const elegantTraits = ['Elegance', 'Sophistication', 'Luxury Leaning', 'Minimalism'];
        return elegantTraits.includes(primary) || elegantTraits.includes(secondary);
    }
    
    isCreativePersonality(primary, secondary) {
        const creativeTraits = ['Artistic Flair', 'Whimsy', 'Color Playfulness'];
        return creativeTraits.includes(primary) || creativeTraits.includes(secondary);
    }
    
    isMinimalistPersonality(primary, secondary) {
        const minimalistTraits = ['Minimalism', 'Competence', 'Sincerity', 'Versatility'];
        return minimalistTraits.includes(primary) || minimalistTraits.includes(secondary);
    }
    
    getWildPath(defaultNext) {
        // For wild personalities, guide toward more expressive options
        const wildAlternatives = {
            'Q4': 'Q4_WILD',  // Hypothetical wild variant
            'Q5': 'Q5_WILD'   // Hypothetical wild variant
        };
        const candidate = wildAlternatives[defaultNext];
        const nodeMap = (this.quizData && this.quizData.graph && this.quizData.graph.nodes) || {};
        return candidate && nodeMap[candidate] ? candidate : defaultNext;
    }
    
    getElegantPath(defaultNext) {
        // For elegant personalities, guide toward more refined options
        const elegantAlternatives = {
            'Q4': 'Q4_ELEGANT',
            'Q5': 'Q5_ELEGANT'
        };
        const candidate = elegantAlternatives[defaultNext];
        const nodeMap = (this.quizData && this.quizData.graph && this.quizData.graph.nodes) || {};
        return candidate && nodeMap[candidate] ? candidate : defaultNext;
    }
    
    getCreativePath(defaultNext) {
        // For creative personalities, guide toward more artistic options
        const creativeAlternatives = {
            'Q4': 'Q4_CREATIVE',
            'Q5': 'Q5_CREATIVE'
        };
        const candidate = creativeAlternatives[defaultNext];
        const nodeMap = (this.quizData && this.quizData.graph && this.quizData.graph.nodes) || {};
        return candidate && nodeMap[candidate] ? candidate : defaultNext;
    }
    
    getMinimalistPath(defaultNext) {
        // For minimalist personalities, guide toward more practical options
        const minimalistAlternatives = {
            'Q4': 'Q4_MINIMAL',
            'Q5': 'Q5_MINIMAL'
        };
        const candidate = minimalistAlternatives[defaultNext];
        const nodeMap = (this.quizData && this.quizData.graph && this.quizData.graph.nodes) || {};
        return candidate && nodeMap[candidate] ? candidate : defaultNext;
    }
    
    /**
     * Calculate final personality type based on accumulated scores
     */
    calculatePersonalityType() {
        const profile = this.getCurrentPersonalityProfile();
        const { dominantTraits, scores } = profile;
        
        // Advanced personality mapping based on trait combinations
        if (dominantTraits.length < 2) {
            return this.getBasicPersonalityType(dominantTraits[0]);
        }
        
        const [primary, secondary, tertiary] = dominantTraits;
        
        // Complex personality combinations
        if (this.matchesPattern(['Boldness', 'Artistic Flair'], [primary, secondary, tertiary])) {
            return 'The Wild Maverick';
        }
        
        if (this.matchesPattern(['Boldness', 'Excitement'], [primary, secondary, tertiary])) {
            return 'The Untamed Explorer';
        }
        
        if (this.matchesPattern(['Whimsy', 'Sincerity'], [primary, secondary, tertiary])) {
            return 'The Gentle Guardian';
        }
        
        if (this.matchesPattern(['Whimsy', 'Minimalism'], [primary, secondary, tertiary])) {
            return 'The Cosmic Dreamer';
        }
        
        if (this.matchesPattern(['Nature Affinity', 'Elegance'], [primary, secondary, tertiary])) {
            return 'The Nature Muse';
        }
        
        if (this.matchesPattern(['Elegance', 'Sophistication'], [primary, secondary, tertiary])) {
            return 'The Refined Connoisseur';
        }
        
        if (this.matchesPattern(['Minimalism', 'Competence'], [primary, secondary, tertiary])) {
            return 'The Pragmatic Minimalist';
        }
        
        if (this.matchesPattern(['Artistic Flair', 'Color Playfulness'], [primary, secondary, tertiary])) {
            return 'The Creative Catalyst';
        }
        
        // Fallback to basic type
        return this.getBasicPersonalityType(primary);
    }
    
    matchesPattern(requiredTraits, userTraits) {
        return requiredTraits.every(trait => userTraits.includes(trait));
    }
    
    getBasicPersonalityType(primaryTrait) {
        const basicMapping = {
            'Boldness': 'The Wild Maverick',
            'Elegance': 'The Nature Muse',
            'Whimsy': 'The Gentle Guardian',
            'Minimalism': 'The Cosmic Dreamer',
            'Artistic Flair': 'The Creative Catalyst',
            'Nature Affinity': 'The Nature Muse',
            'Excitement': 'The Untamed Explorer',
            'Sophistication': 'The Refined Connoisseur',
            'Competence': 'The Pragmatic Minimalist'
        };
        
        return basicMapping[primaryTrait] || 'The Unique Individual';
    }
    
    /**
     * Get detailed personality report
     */
    getPersonalityReport() {
        const personalityType = this.calculatePersonalityType();
        const profile = this.getCurrentPersonalityProfile();
        
        return {
            personalityType,
            dominantTraits: profile.dominantTraits.slice(0, 5),
            allScores: profile.scores,
            totalScore: profile.totalScore,
            quizJourney: this.userResponses,
            adaptiveDecisions: this.getAdaptiveDecisions()
        };
    }
    
    getAdaptiveDecisions() {
        // Track where adaptive logic was applied
        return this.quizHistory.filter(response => 
            this.shouldApplyAdaptiveLogic(response.nodeId)
        );
    }
    
    reset() {
        this.initializeScores();
        this.quizHistory = [];
        this.userResponses = [];
        this.currentNode = null;
        this.questionNumber = 1;
    }
}

// Export for use in main application
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdaptiveQuizEngine;
} else if (typeof window !== 'undefined') {
    // Prevent duplicate declaration - check if already exists
    if (typeof window.AdaptiveQuizEngine === 'undefined') {
        window.AdaptiveQuizEngine = AdaptiveQuizEngine;
        console.log('AdaptiveQuizEngine loaded successfully');
    } else {
        console.warn('AdaptiveQuizEngine already exists, skipping re-declaration');
        // Don't throw an error, just log a warning
    }
    
    // Clear the loading flag if it exists
    if (window.__loadingQuizEngine !== undefined) {
        window.__loadingQuizEngine = false;
    }
}
