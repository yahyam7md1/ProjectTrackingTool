/**
 * Authentication Middleware
 * This middleware handles JWT authentication for different user types
 */

const jwt = require('jsonwebtoken');

/**
 * @function verifyAdminJWT
 * @desc    Middleware to verify admin JWT tokens
 * @param   {Object} req - Express request object
 * @param   {Object} res - Express response object
 * @param   {Function} next - Express next middleware function
 * @returns {void}
 */
const verifyAdminJWT = (req, res, next) => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Authorization header is missing." });
  }

  // Check if the header format is correct (Bearer <token>)
  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Token format is invalid. Must be 'Bearer <token>'." });
  }

  // Extract the token from the Authorization header
  const token = authHeader.split(' ')[1];

  try {
    // Verify the token with JWT_SECRET
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach the decoded payload to the request object
    req.admin = decoded;
    
    // Continue to the next middleware or route handler
    next();
  } catch (error) {
    // Handle token verification errors (invalid signature, expired token, etc)
    return res.status(403).json({ message: "Invalid or expired token." });
  }
};

module.exports = {
  verifyAdminJWT
};
