/**
 * Authentication Routes
 * Handles all authentication related endpoints
 */
//This file is the first thing an incoming web request hits. 
// Its only responsibility is to look at the URL and the HTTP method
// (e.g., POST on /api/v1/auth/admin/login) and direct the request to the correct "manager" to handle it.
// It acts like a traffic cop, pointing requests to the right place.
const express = require('express');
const { 
  adminLogin, 
  requestClientCode, 
  verifyClientCode,
  adminSignup,
  verifyAdminAccount
} = require('../../controllers/AuthController/authController');
const router = express.Router();

/**
 * @route   POST /admin/login
 * @desc    Login for admin users
 * @access  Public
 */
router.post('/admin/login', adminLogin);

/**
 * @route   POST /client/request-code
 * @desc    Request a verification code for client login
 * @access  Public
 */
router.post('/client/request-code', requestClientCode);

/**
 * @route   POST /client/verify-code
 * @desc    Verify a client's login code
 * @access  Public
 */
router.post('/client/verify-code', verifyClientCode);

/**
 * @route   POST /admin/signup
 * @desc    Create a new admin account and send verification code
 * @access  Public
 */
router.post('/admin/signup', adminSignup);

/**
 * @route   POST /admin/verify-account
 * @desc    Verify admin account with code and complete registration
 * @access  Public
 */
router.post('/admin/verify-account', verifyAdminAccount);

module.exports = router;
