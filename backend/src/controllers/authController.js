/**
 * Authentication Controller
 * Handles the business logic for authentication operations
 */

const { 
  loginAdminService,
  requestClientCodeService,
  verifyClientCodeService
} = require('../services/authService');

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

/**
 * @function requestClientCode
 * @desc    Handles client code request for login
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - Response with status and message
 */
const requestClientCode = async (req, res) => {
  try {
    // Step 1: Extract email from request body
    const { email } = req.body;
    
    // Basic validation
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }
    
    // Step 2: Call the service function
    await requestClientCodeService(email);
    
    // Step 3: Always return a generic success response for security
    // This prevents attackers from determining which emails are valid clients
    return res.status(200).json({
      success: true,
      message: 'If an account exists for this email, a verification code has been sent.'
    });
  } catch (error) {
    console.error('Request client code error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred while processing your request',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @function verifyClientCode
 * @desc    Handles client code verification for login
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - Response with status and message
 */
const verifyClientCode = async (req, res) => {
  try {
    // Extract email and code from request body
    const { email, code } = req.body;
    
    // Basic validation
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }
    
    // Call the service function to verify the code
    const result = await verifyClientCodeService(email, code);
    
    // If successful, return the token
    return res.status(200).json({
      success: true,
      message: 'Verification successful',
      ...result // This spreads the { token } object into the response
    });
  } catch (error) {
    console.error('Verify client code error:', error);
    
    // Check for specific error messages
    if (
      error.message === 'Invalid verification code.' ||
      error.message === 'Verification code has expired.'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'An error occurred during code verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  adminLogin,
  requestClientCode,
  verifyClientCode
};
