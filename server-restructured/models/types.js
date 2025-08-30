/**
 * Type definitions for the application
 */

/**
 * @typedef {Object} Product
 * @property {string} artworkName - Name of the artwork
 * @property {string} artworkUrl - URL of the artwork
 * @property {string} productName - Name of the product
 * @property {string} productUrl - URL of the product
 * @property {string} imageUrl - URL of the product image
 * @property {string} price - Price of the product
 * @property {string} personalityTraits - Personality traits associated with the product
 * @property {string} productType - Type of the product, e.g., bag style
 */

/**
 * @typedef {Object} ArtworkPersonalityData
 * @property {string} artworkName - Name of the artwork
 * @property {string} artworkUrl - URL of the artwork
 * @property {string} imageUrl - URL of the artwork image
 * @property {string} designElements - Design elements in the artwork
 * @property {string} overallPersonality - Overall personality of the artwork
 * @property {string} buyerPersonalityMatch - Type of personality that matches with this artwork
 * @property {string} psychologicalAppeal - Psychological appeal of the artwork
 * @property {string} [artworkDescription] - Description of the artwork
 */

/**
 * @typedef {Object} PersonalityTrait
 * @property {('Low'|'Moderate'|'High')} level - Level of the trait
 * @property {string} description - Description of the trait at this level
 */

/**
 * @typedef {Object} PersonalityProfile
 * @property {Object} traits - Personality traits
 * @property {PersonalityTrait} traits.boldness - Boldness trait
 * @property {PersonalityTrait} traits.elegance - Elegance trait
 * @property {PersonalityTrait} traits.whimsy - Whimsy trait
 * @property {string} styleStatement - Statement describing the person's style
 * @property {Array<string>} strengths - Person's strengths
 * @property {Array<string>} growthAreas - Areas for personal growth
 * @property {Array<string>} [personalDevelopmentTips] - Tips for personal development
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique user ID
 * @property {string} email - User's email address
 * @property {string} password - Hashed password
 * @property {string} firstName - User's first name
 * @property {string} lastName - User's last name
 * @property {string} createdAt - Creation timestamp
 * @property {string} [updatedAt] - Last update timestamp
 */

/**
 * @typedef {Object} UserPreferences
 * @property {string} userId - ID of the user
 * @property {string} [bagType] - Preferred bag type
 * @property {string} [styleDescription] - Description of preferred style
 * @property {Array<string>} [personalityTraits] - Personality traits
 * @property {boolean} [emailNotifications] - Whether to receive email notifications
 * @property {string} [updatedAt] - Last update timestamp
 */

// Export dummy values to make the module importable
module.exports = {
  PRODUCT_TYPE: {
    BAG: 'Bag',
    TOTE: 'Tote',
    CROSSBODY: 'Crossbody',
    WALLET: 'Wallet',
    BACKPACK: 'Backpack'
  },
  
  ARTWORK_THEME: {
    ANIMALS: 'Animals',
    FLOWERS_PLANTS: 'Flowers/Plants',
    NATURE_LANDSCAPE: 'Nature/Landscape',
    PATTERN_ABSTRACT: 'Pattern/Abstract',
    SYMBOLS_EMBLEMS: 'Symbols/Emblems',
    OTHER: 'Other (Unspecified)'
  },
  
  PERSONALITY_TRAIT_LEVEL: {
    LOW: 'Low',
    MODERATE: 'Moderate',
    HIGH: 'High'
  }
};
