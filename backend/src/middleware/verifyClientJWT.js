const jwt = require('jsonwebtoken');
 
/**
 * @function verifyClientJWT
 * @desc middleware to verify client JWT tokens
 * @param {object} req - express request object
 * @param {object} res - express response object
 * @param {function} next - express next middleware function
 * @returns {void}
 */
const verifyClientJWT = (req, res, next) => {
    // Check if Authorization header exists
    const authHeader = req.headers.authorization;
    if(!authHeader){
        return res.status(401).json({ message: "The authorization header is missing"});
    }
    
    // Check if header format is correct ( Bearer <token>)
    if (!authHeader.startsWith('Bearer ')){
        return res.status(401).json({message: "Token format is invalid, must be 'Bearer <token>'"});
    }

    // Extract the token from the Authorization header
    const token = authHeader.split(' ')[1];

    try{
        // Verify the token with JWT_SECRET
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a client (Has clientID)
        if (!decoded.clientId){
            return res.status(403).json({message: "Access denied. Not a valid client token"});
        }

        // Attach the decoded payload to the request object
        req.client = { id: decoded.clientId };

        // Continue to the next middleware
        next();
    } catch (error){
        // Handle token verification errors (invalid signature, expired token, etc)
        return res.status(403).json({ message: "Invalid or expired token" });
    }
};

// Export the middleware function
module.exports = verifyClientJWT;