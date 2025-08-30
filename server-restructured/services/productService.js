/**
 * Product service
 */
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const config = require('../config/config');

class ProductService {
  constructor() {
    this.products = [];
    this.isLoaded = false;
  }
  
  /**
   * Load products from CSV file
   */
  async loadProducts() {
    if (this.isLoaded) return this.products;
    
    const csvPath = path.resolve(__dirname, '..', config.paths.productDataPath);
    
    if (!fs.existsSync(csvPath)) {
      console.warn('⚠️ Product CSV file not found:', csvPath);
      return [];
    }
    
    return new Promise((resolve, reject) => {
      const results = [];
      
      fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
          const product = {
            artworkName: data['Artwork Name'] || '',
            artworkUrl: data['Artwork URL'] || '',
            productName: data['Product Name'] || '',
            productUrl: data['Product URL'] || '',
            imageUrl: data['Image URL'] || '',
            price: data['Price'] || '',
            personalityTraits: data['Personality Traits'] || '',
            productType: data['Product Type'] || 'Bag'
          };
          
          if (product.artworkName && product.productName) {
            results.push(product);
          }
        })
        .on('end', () => {
          console.log(`✅ Loaded ${results.length} products`);
          this.products = results;
          this.isLoaded = true;
          resolve(this.products);
        })
        .on('error', (error) => {
          console.error('❌ Error loading products CSV:', error);
          reject(error);
        });
    });
  }
  
  /**
   * Get all products
   */
  async getAllProducts() {
    if (!this.isLoaded) {
      await this.loadProducts();
    }
    return this.products;
  }
  
  /**
   * Get product by name
   */
  async getProductByName(productName) {
    if (!this.isLoaded) {
      await this.loadProducts();
    }
    
    return this.products.find(p => 
      p.productName.toLowerCase() === productName.toLowerCase()
    );
  }
  
  /**
   * Get products by artwork name
   */
  async getProductsByArtwork(artworkName) {
    if (!this.isLoaded) {
      await this.loadProducts();
    }
    
    return this.products.filter(p => 
      p.artworkName.toLowerCase() === artworkName.toLowerCase()
    );
  }
  
  /**
   * Get products by type
   */
  async getProductsByType(productType) {
    if (!this.isLoaded) {
      await this.loadProducts();
    }
    
    return this.products.filter(p => 
      p.productType.toLowerCase().includes(productType.toLowerCase())
    );
  }
  
  /**
   * Search products by keyword
   */
  async searchProducts(keyword) {
    if (!this.isLoaded) {
      await this.loadProducts();
    }
    
    const normalizedKeyword = keyword.toLowerCase();
    
    return this.products.filter(p => 
      p.productName.toLowerCase().includes(normalizedKeyword) ||
      p.artworkName.toLowerCase().includes(normalizedKeyword) ||
      p.personalityTraits.toLowerCase().includes(normalizedKeyword)
    );
  }
}

module.exports = new ProductService();
