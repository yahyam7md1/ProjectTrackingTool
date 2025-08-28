/**
 * Phase Controller
 * Handles HTTP requests related to project phases
 */

const phaseService = require('../services/phaseService');
const phaseRepository = require('../db/repo/phaseRepository');

/**
 * Add a new phase to a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const addPhaseToProject = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { name, description } = req.body;
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Phase name is required' });
    }
    
    const phaseData = {
      projectId,
      name,
      description
    };
    
    const newPhase = await phaseService.addPhaseToProject(phaseData);
    
    return res.status(201).json(newPhase);
  } catch (error) {
    console.error('Error adding phase to project:', error);
    return res.status(500).json({ error: error.message || 'Failed to add phase to project' });
  }
};

/**
 * Set a specific phase as active and mark only the currently active phase as completed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setActivePhase = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const phaseId = parseInt(req.params.phaseId);
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!phaseId) {
      return res.status(400).json({ error: 'Phase ID is required' });
    }
    
    await phaseService.setActivePhase(projectId, phaseId);
    
    return res.status(200).json({
      success: true,
      message: 'Phase set as active and phase statuses updated successfully'
    });
  } catch (error) {
    console.error('Error setting active phase:', error);
    
    // Specific error handling for common cases
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('does not belong')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to set active phase' 
    });
  }
};

/**
 * Reorder phases for a project
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reorderPhases = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const { orderedPhaseIds } = req.body;
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!orderedPhaseIds || !Array.isArray(orderedPhaseIds)) {
      return res.status(400).json({ error: 'orderedPhaseIds array is required' });
    }
    
    if (orderedPhaseIds.length === 0) {
      return res.status(400).json({ error: 'orderedPhaseIds array cannot be empty' });
    }
    
    // TODO: In a real implementation, we should verify that all phases
    // belong to the specified project. This would require additional
    // repository methods to fetch and validate phase ownership.
    
    await phaseService.reorderPhases(orderedPhaseIds);
    
    return res.status(200).json({
      success: true,
      message: 'Phases reordered successfully'
    });
  } catch (error) {
    console.error('Error reordering phases:', error);
    
    // Handle validation errors with a 400 status code
    if (error.message.includes('must be an array') || 
        error.message.includes('cannot be empty') ||
        error.message.includes('must be numbers') ||
        error.message.includes('Duplicate')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to reorder phases' 
    });
  }
};

/**
 * Update a phase
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updatePhase = async (req, res) => {
  try {
    const phaseId = parseInt(req.params.phaseId);
    const projectId = parseInt(req.params.projectId); // for validation purposes
    const { name, description, estimated_completion_at } = req.body;
    
    // Validate required fields
    if (!phaseId) {
      return res.status(400).json({ error: 'Phase ID is required' });
    }
    
    if (!name) {
      return res.status(400).json({ error: 'Phase name is required' });
    }
    
    const updateData = { name, description };
    
    // Always include estimated_completion_at if it's provided in the request body, even if null
    // This allows clearing the date when null is explicitly passed
    if (estimated_completion_at !== undefined) {
      updateData.estimated_completion_at = estimated_completion_at;
    }
    
    const updatedPhase = await phaseService.updatePhase(phaseId, updateData);
    
    // Verify that the phase belongs to the specified project
    if (updatedPhase.project_id !== projectId) {
      return res.status(400).json({ 
        error: 'Phase does not belong to the specified project' 
      });
    }
    
    return res.status(200).json(updatedPhase);
  } catch (error) {
    console.error('Error updating phase:', error);
    
    // Specific error handling for common cases
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message || 'Failed to update phase' });
  }
};

/**
 * Delete a phase
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deletePhase = async (req, res) => {
  try {
    const phaseId = parseInt(req.params.phaseId);
    
    // Validate required fields
    if (!phaseId) {
      return res.status(400).json({ error: 'Phase ID is required' });
    }
    
    // Before deleting, check if the phase belongs to the specified project
    const phase = await phaseRepository.findPhaseById(phaseId);
    
    if (!phase) {
      return res.status(404).json({ error: 'Phase not found' });
    }
    
    const projectId = parseInt(req.params.projectId);
    if (phase.project_id !== projectId) {
      return res.status(400).json({ 
        error: 'Phase does not belong to the specified project' 
      });
    }
    
    await phaseService.deletePhase(phaseId);
    
    // Return 204 No Content for successful deletion without response body
    return res.status(204).send();
  } catch (error) {
    console.error('Error deleting phase:', error);
    
    // Specific error handling for common cases
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    return res.status(500).json({ error: error.message || 'Failed to delete phase' });
  }
};

/**
 * Set a specific phase as completed
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const setPhaseComplete = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const phaseId = parseInt(req.params.phaseId);
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!phaseId) {
      return res.status(400).json({ error: 'Phase ID is required' });
    }
    
    await phaseService.setPhaseComplete(projectId, phaseId);
    
    return res.status(200).json({
      success: true,
      message: 'Phase marked as completed successfully'
    });
  } catch (error) {
    console.error('Error marking phase as completed:', error);
    
    // Specific error handling for common cases
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('does not belong')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to mark phase as complete' 
    });
  }
};

/**
 * Reopen a completed phase
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reopenPhase = async (req, res) => {
  try {
    const projectId = parseInt(req.params.projectId);
    const phaseId = parseInt(req.params.phaseId);
    
    // Validate required fields
    if (!projectId) {
      return res.status(400).json({ error: 'Project ID is required' });
    }
    
    if (!phaseId) {
      return res.status(400).json({ error: 'Phase ID is required' });
    }
    
    await phaseService.reopenPhase(projectId, phaseId);
    
    return res.status(200).json({
      success: true,
      message: 'Phase reopened successfully'
    });
  } catch (error) {
    console.error('Error reopening phase:', error);
    
    // Specific error handling for common cases
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('does not belong')) {
      return res.status(400).json({ error: error.message });
    }
    
    return res.status(500).json({ 
      error: error.message || 'Failed to reopen phase' 
    });
  }
};

module.exports = {
  addPhaseToProject,
  setActivePhase,
  reorderPhases,
  updatePhase,
  deletePhase,
  setPhaseComplete,
  reopenPhase
};
