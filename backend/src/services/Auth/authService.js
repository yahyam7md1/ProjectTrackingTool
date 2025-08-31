/**
 * Authentication Service
 * Provides business logic for authentication operations
 */

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { 
  findAdminByEmail,
  findAdminVerificationCode,
  verifyAdmin,
  markAdminCodeAsUsed
} = require('../../db/repo/AuthRepo/authRepository');
const { sendVerificationEmail } = require('../../utils/emailService');

// Get JWT secret from environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_should_be_in_env';

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
    
    // Step 5: Check if admin account is verified
    if (!admin.is_verified) {
      throw new Error('Account not verified. Please check your email.');
    }
    
    console.log('Generating JWT token');
    const secretKey = process.env.JWT_SECRET || 'phasetracker_default_secret_key';
    console.log('Using JWT secret:', secretKey.substring(0, 3) + '...[redacted]');
    
    // Step 6: Generate JWT token
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

/**
 * @function requestClientCodeService
 * @desc    Service function for requesting client verification code
 * @param   {String} email - Client email
 * @returns {Promise<void>} - Promise resolving when completed
 * @throws  {Error} - Throws error for any issues
 */
const requestClientCodeService = async (email) => {
  try {
    // Import required dependencies
    const { findClientByEmail, createClientVerificationCode } = require('../../db/repo/AuthRepo/authRepository');
    const { sendVerificationEmail } = require('../../utils/emailService');
    
    // Step 1: Find the client by email
    const client = await findClientByEmail(email);
    
    // Step 2: Silently return if no client is found (security measure to prevent email enumeration)
    if (!client) {
      console.log(`No client found with email: ${email}. Silently returning.`);
      return;
    }
    
    // Step 3: Generate a random 6-digit verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Step 4: Calculate expiration (10 minutes from now)
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
    
    // Step 5: Save code to database
    await createClientVerificationCode(client.id, generatedCode, expirationDate);
    
    // Step 6: Send the email with the verification code
    await sendVerificationEmail(client.email, generatedCode);
    
    console.log(`Verification code sent to client: ${email}`);
  } catch (error) {
    console.error('Error in requestClientCodeService:', error);
    throw error;
  }
};

/**
 * @function verifyClientCodeService
 * @desc    Service function for verifying client code
 * @param   {String} email - Client email
 * @param   {String} code - Verification code
 * @returns {Promise<Object>} - Promise resolving to token object if verification successful
 * @throws  {Error} - Throws error for invalid code, expired code, or other issues
 */
const verifyClientCodeService = async (email, code) => {
  try {
    // Import required dependencies
    const { findClientByEmail, findVerificationCode, markCodeAsUsed } = require('../../db/repo/AuthRepo/authRepository');
    const jwt = require('jsonwebtoken');
    
    // Step 1: Find the client by email
    const client = await findClientByEmail(email);
    
    // If no client is found, throw an error
    if (!client) {
      console.log(`No client found with email: ${email}`);
      throw new Error("Invalid verification code.");
    }
    
    // Step 2: Find the verification code
    const codeRecord = await findVerificationCode(client.id, code);
    
    // If no code record is found, throw an error
    if (!codeRecord) {
      console.log(`No matching verification code found for client ID: ${client.id}`);
      throw new Error("Invalid verification code.");
    }
    
    // Step 3: Check if the code has already been used
    if (codeRecord.used_at !== null) {
      console.log(`Verification code has already been used: ${code}`);
      throw new Error("Invalid verification code.");
    }
    
    // Step 4: Check if the code has expired
    const expiresAt = new Date(codeRecord.expires_at);
    const currentTime = new Date();
    
    if (currentTime > expiresAt) {
      console.log(`Verification code has expired: ${code}`);
      throw new Error("Verification code has expired.");
    }
    
    // Step 5: All checks passed, code is valid
    
    // Step 5.1: Mark code as used
    await markCodeAsUsed(codeRecord.id);
    console.log(`Marked code ${code} as used`);
    
    // Step 5.2: Generate JWT token
    console.log('Generating JWT token for client');
    const secretKey = process.env.JWT_SECRET || 'phasetracker_default_secret_key';
    console.log('Using JWT secret:', secretKey.substring(0, 3) + '...[redacted]');
    
    const token = jwt.sign(
      { clientId: client.id },
      secretKey,
      { expiresIn: '8h' }
    );
    
    console.log(`Verification successful for client: ${email}`);
    
    // Step 5.3: Return token
    return { token };
  } catch (error) {
    console.error('Error in verifyClientCodeService:', error);
    throw error;
  }
};

/**
 * @function signupAdminService
 * @desc    Service function for creating a new admin account
 * @param   {Object} userData - Admin user data including email, password, firstName, lastName
 * @returns {Promise<void>} - Promise resolving when completed
 * @throws  {Error} - Throws error for any issues
 */
const signupAdminService = async (userData) => {
  try {
    // Extract user data
    const { email, password, firstName, lastName } = userData;
    
    // Import required dependencies
    const bcrypt = require('bcrypt');
    const { findAdminByEmail, createAdmin, createAdminVerificationCode } = require('../../db/repo/AuthRepo/authRepository');
    const { sendVerificationEmail } = require('../../utils/emailService');
    
    // Step 1: Check for existing user
    const existingAdmin = await findAdminByEmail(email);
    if (existingAdmin) {
      throw new Error("An account with this email already exists.");
    }
    
    // Step 2: Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    
    // Step 3: Create admin record
    const newAdmin = await createAdmin(email, passwordHash, firstName, lastName);
    console.log(`Created new admin with ID: ${newAdmin.id}`);
    
    // Step 4: Generate verification code
    const generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Step 5: Calculate expiration (10 minutes from now)
    const expirationDate = new Date(Date.now() + 10 * 60 * 1000);
    
    // Step 6: Save code to database
    await createAdminVerificationCode(newAdmin.id, generatedCode, expirationDate);
    
    // Step 7: Send verification email
    await sendVerificationEmail(newAdmin.email, generatedCode);
    
    console.log(`Verification code sent to admin: ${email}`);
    
    // Step 8: Return success (no data needed)
  } catch (error) {
    console.error('Error in signupAdminService:', error);
    throw error;
  }
};

/**
 * @function verifyAdminAccountService
 * @desc    Service function for verifying admin account
 * @param   {String} email - Admin email
 * @param   {String} code - Verification code
 * @returns {Promise<Object>} - Promise resolving to result with JWT token
 * @throws  {Error} - Throws error for invalid code or other issues
 */
const verifyAdminAccountService = async (email, code) => {
  try {
    // Step 1: Find the admin by email
    const admin = await findAdminByEmail(email);
    
    if (!admin) {
      throw new Error('Admin account not found');
    }
    
    // Step 2: Check if the admin is already verified
    if (admin.is_verified) {
      throw new Error('Admin account is already verified');
    }
    
    // Step 3: Find the verification code
    const verificationData = await findAdminVerificationCode(admin.id, code);
    
    if (!verificationData) {
      throw new Error('Invalid verification code');
    }
    
    // Step 4: Check if the code has expired
    if (new Date(verificationData.expires_at) < new Date()) {
      throw new Error('Verification code has expired');
    }
    
    // Step 5: Check if the code has already been used
    if (verificationData.used) {
      throw new Error('Verification code has already been used');
    }
    
    // Step 6: Activate the admin account
    await verifyAdmin(admin.id);
    
    // Step 7: Mark the verification code as used
    await markAdminCodeAsUsed(verificationData.id);
    
    // Step 8: Generate JWT token
    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'admin' },
      JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    console.log(`Admin account verified successfully: ${email}`);
    
    // Step 9: Return success with token
    return {
      success: true,
      token,
      message: 'Admin account verified successfully'
    };
  } catch (error) {
    console.error('Error in verifyAdminAccountService:', error);
    throw error;
  }
};

module.exports = {
  loginAdminService,
  requestClientCodeService,
  verifyClientCodeService,
  signupAdminService,
  verifyAdminAccountService
};
