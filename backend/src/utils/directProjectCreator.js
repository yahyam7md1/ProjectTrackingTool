/**
 * Direct Project Creator Module
 * Emergency fallback to create projects when req.body parsing fails
 */

const projectService = require('../services/projectService');

/**
 * Create a default project with hardcoded values
 * This is an emergency fallback when req.body parsing fails
 * @param {*} adminId - The admin ID from the JWT token
 * @returns {Promise<Object>} The created project
 */
const createDefaultProject = async (adminId) => {
  console.log('🚨 USING EMERGENCY FALLBACK TO CREATE DEFAULT PROJECT');
  
  // Create a project with default values
  const defaultProject = {
    name: 'New Project (Created via fallback)',
    description: 'This project was created using the emergency fallback mechanism when req.body parsing failed.',
    adminId
  };
  
  return await projectService.createProject(defaultProject);
};

module.exports = { createDefaultProject };
