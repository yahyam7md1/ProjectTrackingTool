/**
 * Project Repository
 * Contains functions for accessing and manipulating project data in the database
 */

const db = require('../database');

/**
 * Create a new project
 * @param {Object} projectData - The project data
 * @param {string} projectData.name - The name of the project
 * @param {string} projectData.description - The description of the project
 * @param {number} projectData.adminId - The ID of the admin creating the project
 * @returns {Promise<Object>} The newly created project object
 */
const createProject = (projectData) => {
  const { name, description, adminId } = projectData;
  
  return new Promise((resolve, reject) => {
    const query = `
      INSERT INTO projects (name, description, created_by_admin_id, created_at, updated_at)
      VALUES (?, ?, ?, datetime('now'), datetime('now'))
    `;
    
    db.run(query, [name, description, adminId], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Get the newly created project
      db.get(`SELECT * FROM projects WHERE id = ?`, [this.lastID], (err, project) => {
        if (err) {
          return reject(err);
        }
        
        resolve(project);
      });
    });
  });
};

/**
 * Find all projects with client count
 * @returns {Promise<Array>} Array of project objects with client count
 */
const findAllProjects = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.*,
        COUNT(pc.client_id) as clientCount
      FROM 
        projects p
      LEFT JOIN 
        project_clients pc ON p.id = pc.project_id
      GROUP BY 
        p.id
      ORDER BY 
        p.created_at DESC
    `;
    
    db.all(query, [], (err, projects) => {
      if (err) {
        return reject(err);
      }
      
      resolve(projects);
    });
  });
};

/**
 * Find a project by ID
 * @param {number} projectId - The ID of the project to find
 * @returns {Promise<Object|undefined>} The project object or undefined if not found
 */
const findProjectById = (projectId) => {
  return new Promise((resolve, reject) => {
    const query = `SELECT * FROM projects WHERE id = ?`;
    
    db.get(query, [projectId], (err, project) => {
      if (err) {
        return reject(err);
      }
      
      resolve(project);
    });
  });
};

/**
 * Update a project
 * @param {number} projectId - The ID of the project to update
 * @param {Object} projectData - The updated project data
 * @param {string} projectData.name - The updated name
 * @param {string} projectData.description - The updated description
 * @param {string} projectData.status - The updated status
 * @returns {Promise<Object>} The updated project object
 */
const updateProject = (projectId, projectData) => {
  const { name, description, status } = projectData;
  
  return new Promise((resolve, reject) => {
    const query = `
      UPDATE projects 
      SET name = ?, description = ?, status = ?, updated_at = datetime('now')
      WHERE id = ?
    `;
    
    db.run(query, [name, description, status, projectId], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Check if any row was affected
      if (this.changes === 0) {
        return reject(new Error(`No project found with ID: ${projectId}`));
      }
      
      // Get the updated project
      findProjectById(projectId)
        .then(project => resolve(project))
        .catch(err => reject(err));
    });
  });
};

/**
 * Delete a project
 * @param {number} projectId - The ID of the project to delete
 * @returns {Promise<boolean>} True if the project was deleted successfully
 */
const deleteProject = (projectId) => {
  return new Promise((resolve, reject) => {
    const query = `DELETE FROM projects WHERE id = ?`;
    
    db.run(query, [projectId], function(err) {
      if (err) {
        return reject(err);
      }
      
      // Check if any row was affected
      if (this.changes === 0) {
        return reject(new Error(`No project found with ID: ${projectId}`));
      }
      
      resolve(true);
    });
  });
};

module.exports = {
  createProject,
  findAllProjects,
  findProjectById,
  updateProject,
  deleteProject
};
