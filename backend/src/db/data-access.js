/**
 * Database Data Access Helper Functions
 * Contains functions for accessing and manipulating database data
 */

const db = require('./database');

/**
 * Find an admin user by email
 * @param {string} email - The email of the admin to find
 * @returns {Promise<Object|null>} The admin user object or null if not found
 */
const findAdminByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM admins WHERE email = ?`;
    
    db.get(query, [email], (err, admin) => {
      if (err) {
        return reject(err);
      }
      
      // If no admin is found, admin will be undefined
      resolve(admin || null);
    });
  });
};

/**
 * Find a client by email
 * @param {string} email - The email of the client to find
 * @returns {Promise<Object|null>} The client user object or null if not found
 */
const findClientByEmail = (email) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM clients WHERE email = ?`;
    
    db.get(query, [email], (err, client) => {
      if (err) {
        return reject(err);
      }
      
      // If no client is found, client will be undefined
      resolve(client || null);
    });
  });
};

/**
 * Create a verification code for a client
 * @param {number} clientId - The ID of the client
 * @param {string} code - The verification code
 * @param {Date} expiresAt - The expiration date for the code
 * @returns {Promise<void>}
 */
const createClientVerificationCode = (clientId, code, expiresAt) => {
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO client_codes (client_id, code, expires_at) 
      VALUES (?, ?, ?)
    `;
    
    db.run(query, [clientId, code, expiresAt.toISOString()], function(err) {
      if (err) {
        return reject(err);
      }
      
      resolve();
    });
  });
};

/**
 * Find a verification code for a client
 * @param {number} clientId - The ID of the client
 * @param {string} code - The verification code to find
 * @returns {Promise<Object|null>} The code object or null if not found
 */
const findVerificationCode = (clientId, code) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM client_codes WHERE client_id = ? AND code = ?`;
    
    db.get(query, [clientId, code], (err, codeRecord) => {
      if (err) {
        return reject(err);
      }
      
      // If no code is found, codeRecord will be undefined
      resolve(codeRecord || null);
    });
  });
};

/**
 * Mark a verification code as used
 * @param {number} codeId - The ID of the code to mark as used
 * @returns {Promise<void>}
 */
const markCodeAsUsed = (codeId) => {
  return new Promise((resolve, reject) => {
    const query = `UPDATE client_codes SET used_at = datetime('now') WHERE id = ?`;
    
    db.run(query, [codeId], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Check if any row was affected
      if (this.changes === 0) {
        return reject(new Error(`No code found with ID: ${codeId}`));
      }
      
      resolve();
    });
  });
};

module.exports = {
  findAdminByEmail,
  findClientByEmail,
  createClientVerificationCode,
  findVerificationCode,
  markCodeAsUsed
};
