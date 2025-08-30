/**
 * LLM service for AI-based text processing
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

class LLMService {
  constructor() {
    this.genAI = null;
    this.apiKey = config.api.gemini;
    this.isConfigured = false;
    
    this.initializeClient();
  }
  
  /**
   * Initialize the Gemini client
   */
  initializeClient() {
    if (this.apiKey && this.apiKey !== 'hardcoded_gemini_api_key_here') {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.isConfigured = true;
        console.log('✅ Gemini API client initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Gemini API client:', error);
        this.isConfigured = false;
      }
    } else {
      console.warn('⚠️ Gemini API key not configured or invalid');
      this.isConfigured = false;
    }
  }
  
  /**
   * Check if LLM service is available
   */
  isAvailable() {
    return this.isConfigured && this.genAI !== null;
  }
  
  /**
   * Extract style keywords from text description
   */
  async extractStyleKeywords(description) {
    if (!this.isAvailable()) {
      console.warn('⚠️ LLM service not available for extracting style keywords');
      return [];
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Extract style keywords from the following description that would be relevant for matching with fashion products.
        Focus on extracting adjectives describing style elements, colors, patterns, moods, and aesthetics.
        Return only a JSON array of keywords, with no explanations.
        
        Description: "${description}"
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Parse JSON array from response
      const cleanedResponse = responseText.replace(/```json|```|\n/g, '').trim();
      
      try {
        const keywords = JSON.parse(cleanedResponse);
        return Array.isArray(keywords) ? keywords : [];
      } catch (parseError) {
        console.error('❌ Failed to parse LLM response as JSON array:', parseError);
        
        // Fallback: try to extract words from non-JSON response
        const words = cleanedResponse
          .split(/[,\s]+/)
          .map(word => word.trim())
          .filter(word => word.length > 0);
          
        return words;
      }
    } catch (error) {
      console.error('❌ Error using LLM to extract style keywords:', error);
      return [];
    }
  }
  
  /**
   * Generate personality analysis from quiz responses
   */
  async generatePersonalityAnalysis(responses) {
    if (!this.isAvailable()) {
      console.warn('⚠️ LLM service not available for personality analysis');
      return null;
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Analyze the following personality quiz responses and generate a detailed personality profile.
        
        Focus on three core traits:
        1. Boldness (Low, Moderate, or High)
        2. Elegance (Low, Moderate, or High)
        3. Whimsy (Low, Moderate, or High)
        
        Also provide:
        - A style statement summarizing their personality
        - Key strengths and growth areas
        - Personal development tips
        
        Responses:
        ${JSON.stringify(responses, null, 2)}
        
        Return the analysis as a well-formatted JSON object with the following structure:
        {
          "traits": {
            "boldness": { "level": "Low|Moderate|High", "description": "..." },
            "elegance": { "level": "Low|Moderate|High", "description": "..." },
            "whimsy": { "level": "Low|Moderate|High", "description": "..." }
          },
          "styleStatement": "...",
          "strengths": ["...", "..."],
          "growthAreas": ["...", "..."],
          "personalDevelopmentTips": ["...", "..."]
        }
      `;
      
      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract and parse JSON from response
      const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || 
                       responseText.match(/{[\s\S]*}/);
                       
      if (jsonMatch) {
        const jsonString = jsonMatch[0].replace(/```json|```/g, '').trim();
        return JSON.parse(jsonString);
      } else {
        console.error('❌ Could not extract valid JSON from LLM response');
        return null;
      }
    } catch (error) {
      console.error('❌ Error generating personality analysis with LLM:', error);
      return null;
    }
  }
  
  /**
   * Generate personality report in markdown format
   */
  async generatePersonalityReport(personalityProfile) {
    if (!this.isAvailable()) {
      console.warn('⚠️ LLM service not available for personality report generation');
      return 'Personality report not available - LLM service inactive';
    }
    
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      const prompt = `
        Create an engaging, personalized personality report in markdown format based on the following personality profile:
        
        ${JSON.stringify(personalityProfile, null, 2)}
        
        The report should include:
        
        1. An introduction with a personalized greeting
        2. A breakdown of each trait (Boldness, Elegance, Whimsy) with examples of how they manifest
        3. A section on how these traits influence the person's style preferences
        4. Strengths and opportunities for growth
        5. Personal development suggestions
        6. A conclusion that summarizes their unique personality blend
        
        Make it conversational, insightful, and visually organized with markdown headings and formatting.
      `;
      
      const result = await model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error('❌ Error generating personality report with LLM:', error);
      return 'Error generating personality report - please try again later';
    }
  }
}

module.exports = new LLMService();
