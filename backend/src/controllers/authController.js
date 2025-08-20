/**
 * Authentication Controller
 * Handles the business logic for authentication operations
 */

const { loginAdminService } = require('../services/authService');

/**
 * @function adminLogin
 * @desc    Handles admin user login
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - Response with status and message
 */
const adminLogin = async (req, res) => {
  try {
    // Step 1: Extract email and password from request body
    const { email, password } = req.body;
    
    // Step 2: Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }
    
    // Step 3: Call login service
    const result = await loginAdminService(email, password);
    
    // Step 4: Send successful response with JWT token
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      ...result // This spreads the { token } object into the response
    });
    
  } catch (error) {
    // Step 5: Handle errors
    if (error.message === 'Invalid credentials') {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }
    
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: error.message  // Always show error for debugging
    });
  }
};

module.exports = {
  adminLogin
};
