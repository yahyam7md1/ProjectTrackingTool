/**
 * Client Service
 * Provides business logic for client operations
 */

const clientRepository = require('../db/repo/clientRepository');

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
    return await clientRepository.assignClientToProject(projectId, client.id);
  } catch (error) {
    throw new Error(`Failed to assign client to project: ${error.message}`);
  }
};

/**
 * Remove a client from a project
 * @param {number} projectId - The ID of the project
 * @param {string} email - The email of the client
 * @returns {Promise<boolean>} True if the client was successfully removed
 */
const removeClient = async (projectId, email) => {
  try {
    // First, find the client by email
    const client = await clientRepository.findClientByEmail(email);
    
    // If the client exists, remove them from the project
    if (client) {
      return await clientRepository.removeClientFromProject(projectId, client.id);
    }
    
    // If client doesn't exist, there's nothing to remove (success by default)
    return true;
  } catch (error) {
    throw new Error(`Failed to remove client from project: ${error.message}`);
  }
};

module.exports = {
  assignClient,
  removeClient
};
