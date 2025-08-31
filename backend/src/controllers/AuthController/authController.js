/**
 * Authentication Controller
 * Handles the business logic for authentication operations
 */

const { 
  loginAdminService,
  requestClientCodeService,
  verifyClientCodeService,
  signupAdminService,
  verifyAdminAccountService
} = require('../../services/Auth/authService');

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
    
    if (error.message === 'Account not verified. Please check your email.') {
      return res.status(403).json({
        success: false,
        message: 'Account not verified. Please check your email.'
      });
    }
    
    console.error('Login error:', error);
    return res.status(500).json({
      success: false,
      message: 'An error occurred during login',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
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

/**
 * @function adminSignup
 * @desc    Handles admin account creation and sends verification code
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - Response with status and message
 */
const adminSignup = async (req, res) => {
  try {
    // Step 1: Extract user data from request body
    const { email, password, firstName, lastName } = req.body;
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required: email, password, firstName, lastName'
      });
    }
    
    // Step 2: Call the signup service
    await signupAdminService({ email, password, firstName, lastName });
    
    // Step 3: Return success response
    return res.status(201).json({
      success: true,
      message: 'Account created successfully. Please check your email to verify your account.'
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    
    // Step 4: Handle specific error cases
    if (error.message === 'An account with this email already exists.') {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    // Generic error response
    return res.status(500).json({
      success: false,
      message: 'An error occurred during admin signup',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @function verifyAdminAccount
 * @desc    Handles admin account verification with code
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @returns {Object} - Response with status and message
 */
const verifyAdminAccount = async (req, res) => {
  try {
    // Extract email and verification code from request body
    const { email, code } = req.body;
    
    // Validate input
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and verification code are required'
      });
    }
    
    // Call the service function to verify the admin account
    const result = await verifyAdminAccountService(email, code);
    
    // If successful, return the token
    return res.status(200).json({
      success: true,
      message: 'Admin account verified successfully',
      token: result.token
    });
  } catch (error) {
    console.error('Admin account verification error:', error);
    
    // Check for specific error messages
    if (
      error.message === 'Admin account not found' ||
      error.message === 'Invalid verification code' ||
      error.message === 'Verification code has expired' ||
      error.message === 'Verification code has already been used' ||
      error.message === 'Admin account is already verified'
    ) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }
    
    // Generic server error
    return res.status(500).json({
      success: false,
      message: 'An error occurred during admin account verification',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  adminLogin,
  requestClientCode,
  verifyClientCode,
  adminSignup,
  verifyAdminAccount
};
