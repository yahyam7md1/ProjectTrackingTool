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

module.exports = {
  findAdminByEmail
};
