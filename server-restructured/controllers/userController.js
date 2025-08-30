/**
 * User controller
 */
const userService = require('../services/userService');

/**
 * Register a new user
 */
exports.register = async (req, res, next) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email and password are required'
      });
    }
    
    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User already exists',
        details: 'A user with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await userService.createUser({
      email,
      password,
      firstName,
      lastName
    });
    
    // Remove password from response
    const { password: _, ...userResponse } = newUser;
    
    res.status(201).json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Login user
 */
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        error: 'Missing required fields',
        details: 'Email and password are required'
      });
    }
    
    // Authenticate user
    const { user, token } = await userService.authenticateUser(email, password);
    
    if (!user) {
      return res.status(401).json({
        error: 'Authentication failed',
        details: 'Invalid email or password'
      });
    }
    
    // Set cookie with token
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000 // 24 hours
    });
    
    // Remove password from response
    const { password: _, ...userResponse } = user;
    
    res.json({
      status: 'success',
      data: {
        user: userResponse,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user profile
 */
exports.getUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const user = await userService.getUserById(userId);
    
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
        details: `User with ID "${userId}" not found`
      });
    }
    
    // Remove password from response
    const { password, ...userResponse } = user;
    
    res.json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user profile
 */
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const updateData = req.body;
    
    // Don't allow password updates through this endpoint
    if (updateData.password) {
      delete updateData.password;
    }
    
    const updatedUser = await userService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      return res.status(404).json({
        error: 'User not found',
        details: `User with ID "${userId}" not found`
      });
    }
    
    // Remove password from response
    const { password, ...userResponse } = updatedUser;
    
    res.json({
      status: 'success',
      data: userResponse
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user preferences
 */
exports.getUserPreferences = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const preferences = await userService.getUserPreferences(userId);
    
    if (!preferences) {
      return res.status(404).json({
        error: 'Preferences not found',
        details: `Preferences for user "${userId}" not found`
      });
    }
    
    res.json({
      status: 'success',
      data: preferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update user preferences
 */
exports.updateUserPreferences = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const preferences = req.body;
    
    const updatedPreferences = await userService.updateUserPreferences(userId, preferences);
    
    res.json({
      status: 'success',
      data: updatedPreferences
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user exists
 */
exports.checkUserExists = async (req, res, next) => {
  try {
    const { userCookieId } = req.params;
    
    // For now, return a simple response
    // In a real app, you would check against a database
    res.json({
      status: 'success',
      exists: false,
      message: 'User check completed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check user authentication
 */
exports.checkUserAuth = async (req, res, next) => {
  try {
    const { userCookieId } = req.params;
    
    // For now, return a simple response
    // In a real app, you would validate the token/cookie
    res.json({
      status: 'success',
      authenticated: false,
      message: 'Auth check completed'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get all users (admin)
 */
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await userService.getAllUsers();
    
    res.json({
      status: 'success',
      data: users
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user (admin)
 */
exports.deleteUser = async (req, res, next) => {
  try {
    const { userId } = req.params;
    
    const deleted = await userService.deleteUser(userId);
    
    if (!deleted) {
      return res.status(404).json({
        error: 'User not found',
        details: `User with ID "${userId}" not found`
      });
    }
    
    res.json({
      status: 'success',
      message: 'User deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user personality report
 */
exports.getUserPersonalityReport = async (req, res, next) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        error: 'Missing parameter',
        details: 'User ID is required'
      });
    }
    
    const report = await userService.getUserPersonalityReport(userId);
    
    if (!report) {
      return res.status(404).json({
        error: 'Report not found',
        details: `Personality report for user "${userId}" not found`
      });
    }
    
    res.json({
      status: 'success',
      data: report
    });
  } catch (error) {
    next(error);
  }
};
