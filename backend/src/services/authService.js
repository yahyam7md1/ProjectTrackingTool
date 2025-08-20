/**
 * Authentication Service
 * Provides business logic for authentication operations
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findAdminByEmail } = require('../db/data-access');

/**
 * @function loginAdminService
 * @desc    Service function for admin login
 * @param   {String} email - Admin email
 * @param   {String} password - Admin password
 * @returns {Promise<Object>} - Promise resolving to login result with JWT token
 * @throws  {Error} - Throws error for invalid credentials or server issues
 */
const loginAdminService = async (email, password) => {
  try {
    console.log(`Attempting login for email: ${email}`);
    
    // Step 1: Find the admin by email
    const admin = await findAdminByEmail(email);
    
    console.log('Admin lookup result:', admin ? 'Found' : 'Not found');
    
    // Step 2: If no admin is found, throw error
    if (!admin) {
      throw new Error('Invalid credentials');
    }
    
    console.log('Comparing password with hash');
    
    // Step 3: Compare the provided password with the stored hash
    const isPasswordValid = await bcrypt.compare(password, admin.password_hash);
    
    console.log('Password valid:', isPasswordValid);
    
    // Step 4: If passwords don't match, throw error
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    console.log('Generating JWT token');
    const secretKey = process.env.JWT_SECRET || 'phasetracker_default_secret_key';
    console.log('Using JWT secret:', secretKey.substring(0, 3) + '...[redacted]');
    
    // Step 5: Generate JWT token
    const token = jwt.sign(
      { adminId: admin.id },
      secretKey,
      { expiresIn: '8h' }
    );
    
    console.log('Token generated successfully');
    
    // Return token
    return { token };
  } catch (error) {
    console.error('Error in loginAdminService:', error);
    throw error;
  }
};

module.exports = {
  loginAdminService
};
