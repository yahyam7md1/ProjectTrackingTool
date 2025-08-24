/**
 * Phase Service
 * Provides business logic for phase operations
 */

const phaseRepository = require('../db/repo/phaseRepository');

/**
 * Add a new phase to a project
 * @param {Object} phaseData - The phase data
 * @param {number} phaseData.projectId - The ID of the project
 * @param {string} phaseData.name - The name of the phase
 * @param {string} phaseData.description - The description of the phase
 * @returns {Promise<Object>} The newly created phase object
 */
const addPhaseToProject = async (phaseData) => {
  try {
    // First, find the maximum order for the project
    const maxOrder = await phaseRepository.findMaxPhaseOrder(phaseData.projectId);
    
    // Create the phase with the next order number
    const phaseWithOrder = {
      ...phaseData,
      order: maxOrder + 1 // Ensure the new phase is placed after existing phases
    };
    
    // Create and return the new phase
    return await phaseRepository.createPhase(phaseWithOrder);
  } catch (error) {
    throw new Error(`Failed to add phase to project: ${error.message}`);
  }
};

/**
 * Set a specific phase as active and mark previous phases as completed
 * @param {number} projectId - The ID of the project
 * @param {number} phaseId - The ID of the phase to set as active
 * @returns {Promise<boolean>} True if the operation was successful
 * @throws {Error} If phase not found
 */
const setActivePhase = async (projectId, phaseId) => {
  try {
    // First, get the phase to ensure it exists and to retrieve its order
    const phase = await phaseRepository.findPhaseById(phaseId);
    
    if (!phase) {
      throw new Error('Phase not found');
    }
    
    // Ensure the phase belongs to the specified project
    if (phase.project_id !== projectId) {
      throw new Error('Phase does not belong to the specified project');
    }
    
    // Set the phase as active and update previous phases
    return await phaseRepository.setActivePhase(projectId, phaseId, phase.phase_order);
  } catch (error) {
    throw new Error(`Failed to set active phase: ${error.message}`);
  }
};

/**
 * Reorder phases for a project
 * @param {Array<number>} orderedPhaseIds - Array of phase IDs in the desired new order
 * @returns {Promise<boolean>} True if the operation was successful
 * @throws {Error} If validation fails
 */
const reorderPhases = async (orderedPhaseIds) => {
  try {
    // Validate input
    if (!Array.isArray(orderedPhaseIds)) {
      throw new Error('orderedPhaseIds must be an array');
    }
    
    if (orderedPhaseIds.length === 0) {
      throw new Error('orderedPhaseIds cannot be empty');
    }
    
    // Validate that all items are numbers
    const areAllNumbers = orderedPhaseIds.every(id => typeof id === 'number' || (typeof id === 'string' && !isNaN(id)));
    if (!areAllNumbers) {
      throw new Error('All phase IDs must be numbers');
    }
    
    // Convert any string numbers to integers
    const normalizedIds = orderedPhaseIds.map(id => parseInt(id));
    
    // Check for duplicate IDs
    const uniqueIds = new Set(normalizedIds);
    if (uniqueIds.size !== normalizedIds.length) {
      throw new Error('Duplicate phase IDs are not allowed');
    }
    
    // Execute the reordering in the repository
    return await phaseRepository.updatePhaseOrder(normalizedIds);
  } catch (error) {
    throw new Error(`Failed to reorder phases: ${error.message}`);
  }
};

module.exports = {
  addPhaseToProject,
  setActivePhase,
  reorderPhases
};
