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
      return res.status(400).json({ 
        success: false,
        error: 'Project ID is required' 
      });
    }
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        error: 'Client email is required' 
      });
    }
    
    const result = await clientService.assignClient(projectId, email);
    
    // Check if client was assigned but email failed
    if (result.success && !result.emailSent) {
      return res.status(207).json({
        success: true,
        partialSuccess: true,
        emailSent: false,
        message: `Client with email ${email} assigned to project but notification email failed to send`,
        emailError: result.emailError || 'Unknown email error'
      });
    }
    
    return res.status(201).json({ 
      success: true,
      emailSent: true,
      message: `Client with email ${email} successfully assigned to project`
    });
  } catch (error) {
    console.error('Error assigning client to project:', error);
    
    // Check if it's an email validation error
    if (error.message && error.message.includes('Invalid email address')) {
      return res.status(400).json({
        success: false,
        error: error.message,
        validationError: true
      });
    }
    
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to assign client to project' 
    });
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
    let clientId = req.params.clientId;
    
    // Ensure clientId is properly converted to number
    clientId = parseInt(clientId);
    
    // Debug logging
    console.log(`Removing client ${clientId} from project ${projectId}`);
    
    // Validate required fields
    if (isNaN(projectId) || !projectId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Project ID is required and must be a valid number' 
      });
    }
    
    if (isNaN(clientId) || !clientId) {
      return res.status(400).json({ 
        success: false, 
        error: 'Client ID is required and must be a valid number' 
      });
    }
    
    const result = await clientService.removeClient(projectId, clientId);
    console.log(`Client removal result: ${result}`);
    
    // Return 204 No Content as specified
    return res.status(204).end();
  } catch (error) {
    console.error('Error removing client from project:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to remove client from project' 
    });
  }
};

module.exports = {
  assignClientToProject,
  removeClientFromProject
};
