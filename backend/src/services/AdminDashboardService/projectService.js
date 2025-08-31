/**
 * Project Service
 * Provides business logic for project operations
 */

const projectRepository = require('../../db/repo/AdminDashboardRepo/projectRepository');
const phaseRepository = require('../../db/repo/AdminDashboardRepo/phaseRepository');
const clientRepository = require('../../db/repo/AdminDashboardRepo/clientRepository');

/**
 * Create a new project
 * @param {Object} projectData - The project data
 * @param {string} projectData.name - The name of the project
 * @param {string} projectData.description - The description of the project
 * @param {number} projectData.adminId - The ID of the admin creating the project
 * @returns {Promise<Object>} The newly created project object
 */
const createProject = async (projectData) => {
  try {
    return await projectRepository.createProject(projectData);
  } catch (error) {
    throw new Error(`Failed to create project: ${error.message}`);
  }
};

/**
 * Get all projects
 * @returns {Promise<Array>} Array of project objects with client count
 */
const getAllProjects = async () => {
  try {
    return await projectRepository.findAllProjects();
  } catch (error) {
    throw new Error(`Failed to get projects: ${error.message}`);
  }
};

/**
 * Get project by ID with associated phases and clients
 * @param {number} projectId - The ID of the project to find
 * @returns {Promise<Object>} The project object with phases and clients arrays
 * @throws {Error} If project not found
 */
const getProjectById = async (projectId) => {
  try {
    // Get the main project data
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Get all phases associated with the project
    const phases = await phaseRepository.findPhasesByProjectId(projectId);
    
    // Get all clients associated with the project
    const clients = await clientRepository.findClientsByProjectId(projectId);
    
    // Assemble and return the complete project object
    return {
      ...project,
      phases: phases,
      clients: clients
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Update a project
 * @param {number} projectId - The ID of the project to update
 * @param {Object} projectData - The updated project data
 * @param {string} projectData.name - The updated name
 * @param {string} projectData.description - The updated description
 * @param {string} projectData.status - The updated status
 * @returns {Promise<Object>} The updated project object
 * @throws {Error} If project not found
 */
const updateProject = async (projectId, projectData) => {
  try {
    // First, ensure the project exists
    const existingProject = await projectRepository.findProjectById(projectId);
    if (!existingProject) {
      throw new Error('Project not found');
    }
    
    // Then update the project
    return await projectRepository.updateProject(projectId, projectData);
  } catch (error) {
    throw error;
  }
};

/**
 * Delete a project
 * @param {number} projectId - The ID of the project to delete
 * @returns {Promise<boolean>} True if the project was deleted successfully
 * @throws {Error} If project not found
 */
const deleteProject = async (projectId) => {
  try {
    // First, ensure the project exists
    const existingProject = await projectRepository.findProjectById(projectId);
    if (!existingProject) {
      throw new Error('Project not found');
    }
    
    // Then delete the project
    return await projectRepository.deleteProject(projectId);
  } catch (error) {
    throw error;
  }
};

module.exports = {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject
};
