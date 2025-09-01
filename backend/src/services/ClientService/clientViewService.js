/**
 * Client View Service
 * Contains business logic for client's secure view of projects
 */

const clientRepository = require('../../db/repo/AdminDashboardRepo/clientRepository');
const projectRepository = require('../../db/repo/AdminDashboardRepo/projectRepository');
const phaseRepository = require('../../db/repo/AdminDashboardRepo/phaseRepository');

class ForbiddenError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ForbiddenError';
    this.statusCode = 403;
  }
}

/**
 * Get all active projects for a specific client
 * @param {number} clientId - The ID of the client
 * @returns {Promise<Array>} Array of active project objects
 */
const getActiveProjectsForClient = async (clientId) => {
  try {
    // Get all project IDs associated with the client
    const projectIds = await clientRepository.findProjectIdsByClientId(clientId);
    
    // If no projects found, return an empty array
    if (!projectIds || projectIds.length === 0) {
      return [];
    }
    
    // Get all active projects with the given IDs
    const activeProjects = await projectRepository.findActiveProjectsByIds(projectIds);
    
    return activeProjects;
  } catch (error) {
    console.error('Error getting active projects for the client:', error);
    throw error;
  }
};

/**
 * Get detailed project information for a specific client and project
 * @param {number} clientId - The ID of the client
 * @param {number} projectId - The ID of the project
 * @returns {Promise<Object>} Project object with phases
 * @throws {ForbiddenError} If the client is not assigned to the project
 * @throws {ForbiddenError} If the project status is not 'Active'
 */
const getProjectDetailsForClient = async (clientId, projectId) => {
  try {
    // Security check: Verify if client is assigned to this project
    const isAssigned = await clientRepository.isClientAssignedToProject(clientId, projectId);
    
    if (!isAssigned) {
      throw new ForbiddenError('Client is not authorized to access this project');
    }
    
    // Get project details
    const project = await projectRepository.findProjectById(projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Security check: Verify if project is active
    if (project.status !== 'Active') {
      throw new ForbiddenError('Access denied: Project is not active');
    }
    
    // Get project phases
    const phases = await phaseRepository.findPhasesByProjectId(projectId);
    
    // Assemble the complete project object
    const projectDetails = {
      ...project,
      phases: phases || []
    };
    
    return projectDetails;
  } catch (error) {
    console.error('Error getting project details for client:', error);
    throw error;
  }
};

module.exports = {
  getActiveProjectsForClient,
  getProjectDetailsForClient,
  ForbiddenError
};
