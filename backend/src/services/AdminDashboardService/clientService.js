/**
 * Client Service
 * Provides business logic for client operations
 */

const clientRepository = require('../../db/repo/AdminDashboardRepo/clientRepository');
const projectRepository = require('../../db/repo/AdminDashboardRepo/projectRepository');
const emailService = require('../../utils/emailService');

/**
 * Assign a client to a project
 * @param {number} projectId - The ID of the project
 * @param {string} email - The email of the client
 * @returns {Promise<boolean>} True if the client was successfully assigned
 */
const assignClient = async (projectId, email) => {
  try {
    // First, try to find the client by email
    let client = await clientRepository.findClientByEmail(email);
    
    // If the client doesn't exist, create a new one
    if (!client) {
      client = await clientRepository.createClient(email);
    }

    // Now assign the client to the project
    const assigned = await clientRepository.assignClientToProject(projectId, client.id);
    
    if (assigned) {
      // Get project details to include in the email
      const project = await projectRepository.findProjectById(projectId);
      
      // Send email notification
      await emailService.sendProjectAssignmentNotification(email, project.name);
    }
    
    return assigned;
  } catch (error) {
    throw new Error(`Failed to assign client to project: ${error.message}`);
  }
};

/**
 * Remove a client from a project
 * @param {number} projectId - The ID of the project
 * @param {string} clientId - The ID of the client
 * @returns {Promise<boolean>} True if the client was successfully removed
 */
const removeClient = async (projectId, clientId) => {
  try {
    // Remove client directly without checking if it exists first
    return await clientRepository.removeClientFromProject(projectId, clientId);
  } catch (error) {
    throw new Error(`Failed to remove client from project: ${error.message}`);
  }
};

module.exports = {
  assignClient,
  removeClient
};
