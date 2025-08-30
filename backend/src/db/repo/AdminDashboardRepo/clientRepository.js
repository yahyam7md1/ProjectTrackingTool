/**
 * Client Repository
 * Contains functions for accessing and manipulating client data in the database
 */

const db = require('../../database');

/**
 * Find a client by email
 * @param {string} email - The email of the client to find
 * @returns {Promise<Object|undefined>} The client object or undefined if not found
 */
const findClientByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM clients WHERE email = ?`;
    
    db.get(query, [email], (err, client) => {
      if (err) {
        return reject(err);
      }
      
      resolve(client);
    });
  });
};

/**
 * Create a new client
 * @param {string} email - The email of the client
 * @returns {Promise<Object>} The newly created client object
 */
const createClient = (email) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO clients (email, created_at)
      VALUES (?, datetime('now'))
    `;
    
    db.run(query, [email], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Get the newly created client
      db.get(`SELECT * FROM clients WHERE id = ?`, [this.lastID], (err, client) => {
        if (err) {
          return reject(err);
        }
        
        resolve(client);
      });
    });
  });
};

/**
 * Assign a client to a project
 * @param {number} projectId - The ID of the project
 * @param {number} clientId - The ID of the client
 * @returns {Promise<boolean>} True if the assignment was successful
 */
const assignClientToProject = (projectId, clientId) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT OR IGNORE INTO project_clients (project_id, client_id)
      VALUES (?, ?)
    `;
    
    db.run(query, [projectId, clientId], function(err) {
      if (err) {
        return reject(err);
      }
      
      resolve(true);
    });
  });
};

/**
 * Remove a client from a project
 * @param {number} projectId - The ID of the project
 * @param {number} clientId - The ID of the client
 * @returns {Promise<boolean>} True if the removal was successful
 */
const removeClientFromProject = (projectId, clientId) => {
  return new Promise((resolve, reject) => {
    const query = `
      DELETE FROM project_clients
      WHERE project_id = ? AND client_id = ?
    `;
    
    db.run(query, [projectId, clientId], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Even if no rows were affected, we consider this successful
      // since the end state is what we want (client not assigned to project)
      resolve(true);
    });
  });
};

/**
 * Find all clients associated with a specific project
 * @param {number} projectId - The ID of the project
 * @returns {Promise<Array>} Array of client objects assigned to the project
 */
const findClientsByProjectId = (projectId) => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT c.* 
      FROM clients c 
      JOIN project_clients pc ON c.id = pc.client_id 
      WHERE pc.project_id = ?
    `;
    
    db.all(query, [projectId], (err, clients) => {
      if (err) {
        return reject(err);
      }
      
      resolve(clients || []);
    });
  });
};

module.exports = {
  findClientByEmail,
  createClient,
  assignClientToProject,
  removeClientFromProject,
  findClientsByProjectId
};
