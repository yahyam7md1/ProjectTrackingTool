/**
 * Phase Repository
 * Contains functions for accessing and manipulating phase data in the database
 */

const db = require('../database');

/**
 * Create a new phase
 * @param {Object} phaseData - The phase data
 * @param {number} phaseData.projectId - The ID of the project
 * @param {string} phaseData.name - The name of the phase
 * @param {string} phaseData.description - The description of the phase
 * @param {number} phaseData.order - The order of the phase within the project
 * @returns {Promise<Object>} The newly created phase object
 */
const createPhase = (phaseData) => {
  const { projectId, name, description, order } = phaseData;
  
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO phases (project_id, name, description, phase_order, created_at, updated_at)
      VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(query, [projectId, name, description, order], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Get the newly created phase
      db.get(`SELECT * FROM phases WHERE id = ?`, [this.lastID], (err, phase) => {
        if (err) {
          return reject(err);
        }
        
        resolve(phase);
      });
    });
  });
};

/**
 * Find the maximum phase order for a given project
 * @param {number} projectId - The ID of the project
 * @returns {Promise<number>} The maximum phase order or 0 if no phases exist
 */
const findMaxPhaseOrder = (projectId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT MAX(phase_order) as maxOrder
      FROM phases
      WHERE project_id = ?
    `;
    
    db.get(query, [projectId], (err, result) => {
      if (err) {
        return reject(err);
      }
      
      // If no phases exist, result.maxOrder will be null
      resolve(result.maxOrder || 0);
    });
  });
};

/**
 * Find a phase by its ID
 * @param {number} phaseId - The ID of the phase to find
 * @returns {Promise<Object|undefined>} The phase object or undefined if not found
 */
const findPhaseById = (phaseId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM phases WHERE id = ?`;
    
    db.get(query, [phaseId], (err, phase) => {
      if (err) {
        return reject(err);
      }
      
      resolve(phase);
    });
  });
};

/**
 * Set a specific phase as active and mark previous phases as completed
 * @param {number} projectId - The ID of the project
 * @param {number} phaseId - The ID of the phase to set as active
 * @param {number} phaseOrder - The order of the phase to set as active
 * @returns {Promise<boolean>} True if the operation was successful
 */
const setActivePhase = (projectId, phaseId, phaseOrder) => {
  return new Promise((resolve, reject) => {
    // Start a transaction to ensure all updates are applied atomically
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          return reject(err);
        }
        
        try {
          // Step 1: Mark all previous phases as completed and not active
          db.run(
            `UPDATE phases 
             SET is_completed = 1, is_active = 0 
             WHERE project_id = ? AND phase_order < ?`,
            [projectId, phaseOrder],
            (err) => {
              if (err) throw err;
              
              // Step 2: Reset active status for all phases in the project
              db.run(
                `UPDATE phases 
                 SET is_active = 0 
                 WHERE project_id = ?`,
                [projectId],
                (err) => {
                  if (err) throw err;
                  
                  // Step 3: Set the target phase as active and not completed
                  db.run(
                    `UPDATE phases 
                     SET is_active = 1, is_completed = 0 
                     WHERE project_id = ? AND id = ?`,
                    [projectId, phaseId],
                    function(err) {
                      if (err) throw err;
                      
                      // Commit the transaction if all updates were successful
                      db.run('COMMIT', (err) => {
                        if (err) {
                          throw err;
                        }
                        resolve(true);
                      });
                    }
                  );
                }
              );
            }
          );
        } catch (error) {
          // If any error occurs, roll back the transaction
          db.run('ROLLBACK', () => {
            reject(error);
          });
        }
      });
    });
  });
};

/**
 * Update the order of phases for a project
 * @param {Array<number>} orderedPhaseIds - Array of phase IDs in the desired new order
 * @returns {Promise<boolean>} True if the operation was successful
 */
const updatePhaseOrder = (orderedPhaseIds) => {
  return new Promise((resolve, reject) => {
    // Start a transaction to ensure all updates are applied atomically
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          return reject(err);
        }
        
        try {
          // Loop through the orderedPhaseIds array and update each phase's order
          const updatePromises = orderedPhaseIds.map((phaseId, index) => {
            return new Promise((resolveUpdate, rejectUpdate) => {
              // The new order is index + 1 (to start from 1, not 0)
              const newOrder = index + 1;
              
              db.run(
                `UPDATE phases SET phase_order = ? WHERE id = ?`,
                [newOrder, phaseId],
                function(err) {
                  if (err) {
                    rejectUpdate(err);
                  } else {
                    resolveUpdate();
                  }
                }
              );
            });
          });
          
          // Wait for all updates to complete
          Promise.all(updatePromises)
            .then(() => {
              // Commit the transaction if all updates were successful
              db.run('COMMIT', (err) => {
                if (err) {
                  throw err;
                }
                resolve(true);
              });
            })
            .catch((error) => {
              throw error;
            });
            
        } catch (error) {
          // If any error occurs, roll back the transaction
          db.run('ROLLBACK', () => {
            reject(error);
          });
        }
      });
    });
  });
};

module.exports = {
  createPhase,
  findMaxPhaseOrder,
  findPhaseById,
  setActivePhase,
  updatePhaseOrder
};
