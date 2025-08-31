/**
 * Client Controller
 * Handles HTTP requests related to project client assignments
 */

const clientService = require('../../services/AdminDashboardService/clientService');

/**
 * Assign a client to a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const assignClientToProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { email } = req.body;
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!email) {
      return res.status(400).json({ error: 'Client email is required' });
    }
    
    await clientService.assignClient(projectId, email);
    
    return res.status(201).json({ 
      success: true,
      message: `Client with email ${email} successfully assigned to project`
    });
  } catch (error) {
    console.error('Error assigning client to project:', error);
    return res.status(500).json({ error: error.message || 'Failed to assign client to project' });
  }
};

/**
 * Remove a client from a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const removeClientFromProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const clientId = parseInt(req.params.clientId);

    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!clientId) {
      return res.status(400).json({ error: 'Client ID is required' });
    }
    
    await clientService.removeClient(projectId, clientId);
    
    // Return 204 No Content as specified
    return res.status(204).end();
  } catch (error) {
    console.error('Error removing client from project:', error);
    return res.status(500).json({ error: error.message || 'Failed to remove client from project' });
  }
};

module.exports = {
  assignClientToProject,
  removeClientFromProject
};
