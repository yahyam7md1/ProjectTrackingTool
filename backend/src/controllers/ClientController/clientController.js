/**
 * Client Controller
 * Handles API requests from clients for their project data
 */

const clientViewService = require('../../services/ClientService/clientViewService');

/**
 * Get all active projects for the authenticated client
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getActiveProjects = async (req, res) => {
  try {
    // Extract client ID from request (set by middleware)
    const clientId = req.client.id;
    
    // Get active projects for this client
    const projects = await clientViewService.getActiveProjectsForClient(clientId);
    
    // Return the projects array
    res.status(200).json({
      success: true,
      data: projects
    });
  } catch (error) {
    console.error('Error in getActiveProjects:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve projects'
    });
  }
};

/**
 * Get detailed information for a specific project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getProjectDetails = async (req, res) => {
  try {
    // Extract client ID from request (set by middleware)
    const clientId = req.client.id;
    
    // Extract project ID from request parameters
    const projectId = parseInt(req.params.projectId);
    
    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid project ID'
      });
    }
    
    // Get project details for this client
    const projectDetails = await clientViewService.getProjectDetailsForClient(clientId, projectId);
    
    // Return the project details
    res.status(200).json({
      success: true,
      data: projectDetails
    });
  } catch (error) {
    console.error('Error in getProjectDetails:', error);
    
    // Handle specific error types
    if (error.name === 'ForbiddenError') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to access this project'
      });
    }
    
    if (error.message === 'Project not found') {
      return res.status(404).json({
        success: false,
        error: 'Project not found'
      });
    }
    
    // General server error
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve project details'
    });
  }
};

module.exports = {
  getActiveProjects,
  getProjectDetails
};
