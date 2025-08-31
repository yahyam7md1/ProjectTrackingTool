/**
 * Client API Routes
 * Routes for client-facing endpoints
 */

const express = require('express');
const router = express.Router();

// Import middleware
const verifyClientJWT = require('../../middleware/verifyClientJWT');

// Import controller
const clientController = require('../../controllers/ClientController/clientController');

// Apply client JWT verification middleware to all routes
router.use(verifyClientJWT);

// Route to get all active projects for the authenticated client
router.get('/projects', clientController.getActiveProjects);

// Route to get detailed information for a specific project
router.get('/projects/:projectId', clientController.getProjectDetails);

module.exports = router;
