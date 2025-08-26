/**
 * Admin Routes
 * Handles all protected admin operations
 */

const express = require('express');
const { verifyAdminJWT } = require('../middleware/authMiddleware');
const projectController = require('../controllers/projectController');
const phaseController = require('../controllers/phaseController');
const clientController = require('../controllers/clientController');

const router = express.Router();



// Apply authentication middleware to all routes in this router
router.use(verifyAdminJWT);

/**
 * Project Routes
 * All routes are relative to /api/admin
 */

/**
 * @route   GET /projects
 * @desc    Get all projects
 * @access  Private - Admin only
 */
router.get('/projects', projectController.getAllProjects);

/**
 * @route   POST /projects
 * @desc    Create a new project
 * @access  Private - Admin only
 */
router.post('/projects', projectController.createProject);

/**
 * @route   GET /projects/:projectId
 * @desc    Get a single project by ID
 * @access  Private - Admin only
 */
router.get('/projects/:projectId', projectController.getProjectById);

/**
 * @route   PUT /projects/:projectId
 * @desc    Update a project
 * @access  Private - Admin only
 */
router.put('/projects/:projectId', projectController.updateProject);

/**
 * @route   DELETE /projects/:projectId
 * @desc    Delete a project
 * @access  Private - Admin only
 */
router.delete('/projects/:projectId', projectController.deleteProject);

/**
 * Phase Management Routes
 */

/**
 * @route   POST /projects/:projectId/phases
 * @desc    Add a new phase to a project
 * @access  Private - Admin only
 */
router.post('/projects/:projectId/phases', phaseController.addPhaseToProject);

/**
 * @route   POST /projects/:projectId/phases/:phaseId/set-active
 * @desc    Set a phase as active and update previous phases' statuses
 * @access  Private - Admin only
 */
router.post('/projects/:projectId/phases/:phaseId/set-active', phaseController.setActivePhase);

/**
 * @route   PUT /projects/:projectId/phases/reorder
 * @desc    Reorder phases for a project
 * @access  Private - Admin only
 */
router.put('/projects/:projectId/phases/reorder', phaseController.reorderPhases);

/**
 * @route   PUT /projects/:projectId/phases/:phaseId
 * @desc    Update a specific phase
 * @access  Private - Admin only
 */
router.put('/projects/:projectId/phases/:phaseId', phaseController.updatePhase);

/**
 * @route   DELETE /projects/:projectId/phases/:phaseId
 * @desc    Delete a specific phase
 * @access  Private - Admin only
 */
router.delete('/projects/:projectId/phases/:phaseId', phaseController.deletePhase);

/**
 * Client Management Routes
 */

/**
 * @route   POST /projects/:projectId/clients
 * @desc    Assign a client to a project
 * @access  Private - Admin only
 */
router.post('/projects/:projectId/clients', clientController.assignClientToProject);

/**
 * @route   DELETE /projects/:projectId/clients
 * @desc    Remove a client from a project
 * @access  Private - Admin only
 */
router.delete('/projects/:projectId/clients', clientController.removeClientFromProject);

module.exports = router;