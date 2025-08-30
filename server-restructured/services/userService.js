/**
 * User service for managing user data
 */
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const csv = require('csv-parser');

class UserService {
  constructor() {
    this.users = new Map();
    this.userPreferences = new Map();
    this.isLoaded = false;
  }
  
  /**
   * Load users from CSV file
   */
  async loadUsers() {
    try {
      const usersPath = path.join(process.cwd(), 'server', 'users.csv');
      
      if (!fs.existsSync(usersPath)) {
        console.warn('⚠️ Users CSV file not found:', usersPath);
        return;
      }
      
      return new Promise((resolve, reject) => {
        fs.createReadStream(usersPath)
          .pipe(csv())
          .on('data', (data) => {
            if (data.id && data.email) {
              this.users.set(data.id, {
                id: data.id,
                email: data.email,
                password: data.password,
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                createdAt: data.createdAt || new Date().toISOString()
              });
            }
          })
          .on('end', () => {
            console.log(`✅ Loaded ${this.users.size} users`);
            this.isLoaded = true;
            resolve();
          })
          .on('error', (error) => {
            console.error('❌ Error loading users CSV:', error);
            reject(error);
          });
      });
    } catch (error) {
      console.error('❌ Error in loadUsers:', error);
    }
  }
  
  /**
   * Create a new user
   */
  async createUser(userData) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    // Check if email already exists
    const emailExists = Array.from(this.users.values()).some(
      user => user.email.toLowerCase() === userData.email.toLowerCase()
    );
    
    if (emailExists) {
      throw new Error('User with this email already exists');
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    
    // Create new user object
    const newUser = {
      id: uuidv4(),
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      createdAt: new Date().toISOString()
    };
    
    // Save to memory
    this.users.set(newUser.id, newUser);
    
    // In a real app, we would persist to database here
    
    return newUser;
  }
  
  /**
   * Get user by ID
   */
  async getUserById(userId) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    return this.users.get(userId) || null;
  }
  
  /**
   * Get user by email
   */
  async getUserByEmail(email) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    const normalizedEmail = email.toLowerCase();
    
    return Array.from(this.users.values()).find(
      user => user.email.toLowerCase() === normalizedEmail
    ) || null;
  }
  
  /**
   * Update user
   */
  async updateUser(userId, updateData) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    const user = this.users.get(userId);
    
    if (!user) {
      return null;
    }
    
    // Update user data
    const updatedUser = {
      ...user,
      ...updateData,
      id: userId, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    // Save to memory
    this.users.set(userId, updatedUser);
    
    // In a real app, we would persist to database here
    
    return updatedUser;
  }
  
  /**
   * Authenticate user
   */
  async authenticateUser(email, password) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    const user = await this.getUserByEmail(email);
    
    if (!user) {
      return { user: null, token: null };
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return { user: null, token: null };
    }
    
    // Generate simple token (in a real app, use JWT)
    const token = Buffer.from(`${user.id}:${Date.now()}`).toString('base64');
    
    return {
      user,
      token
    };
  }
  
  /**
   * Get user preferences
   */
  async getUserPreferences(userId) {
    // Return from memory if exists
    if (this.userPreferences.has(userId)) {
      return this.userPreferences.get(userId);
    }
    
    // In a real app, we would load from database
    return null;
  }
  
  /**
   * Update user preferences
   */
  async updateUserPreferences(userId, preferences) {
    // Store in memory
    const updatedPreferences = {
      ...preferences,
      userId,
      updatedAt: new Date().toISOString()
    };
    
    this.userPreferences.set(userId, updatedPreferences);
    
    // In a real app, we would persist to database
    
    return updatedPreferences;
  }
  
  /**
   * Get all users
   */
  async getAllUsers() {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    return Array.from(this.users.values()).map(user => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });
  }
  
  /**
   * Delete user
   */
  async deleteUser(userId) {
    if (!this.isLoaded) {
      await this.loadUsers();
    }
    
    const user = this.users.get(userId);
    
    if (!user) {
      return false;
    }
    
    this.users.delete(userId);
    this.userPreferences.delete(userId);
    
    // In a real app, we would persist to database
    
    return true;
  }
  
  /**
   * Get user personality report
   */
  async getUserPersonalityReport(userId) {
    // For now, return a mock report
    // In a real app, this would fetch from a database
    return {
      userId,
      personalityType: 'Balanced',
      dominantTraits: ['elegance', 'classic'],
      report: 'This is a sample personality report for the user.',
      createdAt: new Date().toISOString()
    };
  }
}

module.exports = new UserService();
