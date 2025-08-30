# Sprint 2 Backend Implementation Documentation

This document provides a comprehensive overview of the backend implementation completed during Sprint 2 of the Phase Tracker project. It covers the development of project and phase management features, including the API routes, controllers, repositories, and services that were created to support these features.

## Table of Contents
1. [Overview](#overview)
2. [Admin Routes](#admin-routes)
3. [Project Management](#project-management)
   - [Project Controller](#project-controller)
   - [Project Repository](#project-repository)
   - [Project Service](#project-service)
4. [Phase Management](#phase-management)
   - [Phase Controller](#phase-controller)
   - [Phase Repository](#phase-repository)
   - [Phase Service](#phase-service)
5. [Database Schema](#database-schema)
6. [Key Features Implemented](#key-features-implemented)
7. [Conclusion](#conclusion)

## Overview

During Sprint 2, we focused on implementing the core project and phase management functionality, which includes:

- Creating and managing projects
- Adding, updating, and managing phases within projects
- Ordering and reordering phases
- Tracking phase status (active, completed, pending)
- Assigning and removing clients from projects

These features are critical for the main functionality of the Phase Tracker application, allowing administrators to create and manage project phases effectively.

## Admin Routes

A new admin routes file (`admin.routes.js`) was created to handle all protected admin operations. This file defines endpoints for managing projects, phases, and clients.

### Key Admin Routes:

#### Project Routes
- `GET /api/admin/projects` - Get all projects
- `POST /api/admin/projects` - Create a new project
- `GET /api/admin/projects/:projectId` - Get a single project by ID
- `PUT /api/admin/projects/:projectId` - Update a project
- `DELETE /api/admin/projects/:projectId` - Delete a project

#### Phase Management Routes
- `POST /api/admin/projects/:projectId/phases` - Add a new phase to a project
- `POST /api/admin/projects/:projectId/phases/:phaseId/set-active` - Set a phase as active
- `POST /api/admin/projects/:projectId/phases/:phaseId/set-complete` - Mark a phase as complete
- `POST /api/admin/projects/:projectId/phases/:phaseId/reopen` - Reopen a completed phase
- `PUT /api/admin/projects/:projectId/phases/reorder` - Reorder phases for a project
- `PUT /api/admin/projects/:projectId/phases/:phaseId` - Update a specific phase
- `DELETE /api/admin/projects/:projectId/phases/:phaseId` - Delete a specific phase

#### Client Management Routes
- `POST /api/admin/projects/:projectId/clients` - Assign a client to a project
- `DELETE /api/admin/projects/:projectId/clients/:clientId` - Remove a client from a project

All routes in this file use the `verifyAdminJWT` middleware to ensure that only authenticated admins can access these endpoints.

## Project Management

### Project Controller

The Project Controller (`projectController.js`) handles the HTTP request/response cycle for project operations. It includes the following key functions:

#### `createProject(req, res)`
- Creates a new project with the provided name and description
- Extracts the admin ID from the authentication token to associate the project with the admin
- Contains a fallback mechanism to create a default project in case of issues
- Returns the newly created project

```javascript
const createProject = async (req, res) => {
  try {
    // Extract admin ID from auth token
    const adminId = req.admin?.adminId;
    if (!adminId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication failed: Admin ID is missing from token'
      });
    }
    
    // Check if body is empty or missing name
    if (!req.body.name) {
      // Instead of failing, use our emergency fallback to create a default project
      try {
        const project = await createDefaultProject(adminId);
        
        return res.status(201).json({
          success: true,
          message: 'Project created using emergency fallback mechanism',
          project
        });
      } catch (fallbackError) {
        console.error('Fallback project creation failed:', fallbackError);
        return res.status(500).json({
          success: false,
          message: 'Project creation failed, even with fallback mechanism'
        });
      }
    }

    // Extract project data from request body
    const name = req.body.name;
    const description = req.body.description || '';
    
    // Call service to create project
    const project = await projectService.createProject({ name, description, adminId });
    
    // Return success response with the created project
    return res.status(201).json({
      success: true,
      message: 'Project created successfully',
      project
    });
  } catch (error) {
    // Handle errors
    console.error('Error creating project:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create project',
      error: error.message
    });
  }
};
```

#### `getAllProjects(req, res)`
- Retrieves all projects from the database
- Returns an array of project objects with their associated counts (phases, completed phases, clients)

#### `getProjectById(req, res)`
- Retrieves a single project by its ID
- Returns a detailed project object that includes its associated phases and clients
- Returns a 404 error if the project is not found

#### `updateProject(req, res)`
- Updates a project with the provided name, description, and/or status
- Validates that at least one field to update is provided
- Returns the updated project object
- Returns a 404 error if the project is not found

#### `deleteProject(req, res)`
- Deletes a project by its ID
- Returns a 204 (No Content) status code on successful deletion
- Returns a 404 error if the project is not found

### Project Repository

The Project Repository (`projectRepository.js`) contains functions for accessing and manipulating project data in the database. Key functions include:

#### `createProject(projectData)`
- Creates a new project in the database
- Takes name, description, and adminId as parameters
- Returns the newly created project object

```javascript
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
```

#### `findAllProjects()`
- Retrieves all projects from the database with additional counts:
  - Number of clients assigned to each project
  - Total number of phases in each project
  - Number of completed phases in each project
- Uses a complex SQL query with joins and aggregations to retrieve this information in a single database call
- Orders projects by creation date (newest first)

```javascript
const findAllProjects = () => {
  return new Promise((resolve, reject) => {
    const query = `
      SELECT 
        p.*,
        COUNT(DISTINCT pc.client_id) as clientCount,
        COUNT(DISTINCT ph.id) as phasesCount,
        SUM(CASE WHEN ph.is_completed = 1 THEN 1 ELSE 0 END) as phasesCompletedCount
      FROM 
        projects p
      LEFT JOIN 
        project_clients pc ON p.id = pc.project_id
      LEFT JOIN
        phases ph ON p.id = ph.project_id
      GROUP BY 
        p.id
      ORDER BY 
        p.created_at DESC
    `;
    
    db.all(query, [], (err, projects) => {
      if (err) {
        return reject(err);
      }
      
      // Convert NULL to 0 for counts to ensure we don't have null values
      projects.forEach(project => {
        project.phasesCount = project.phasesCount || 0;
        project.phasesCompletedCount = project.phasesCompletedCount || 0;
        project.clientCount = project.clientCount || 0;
      });
      
      resolve(projects);
    });
  });
};
```

#### `findProjectById(projectId)`
- Retrieves a single project by its ID
- Returns the project object or undefined if not found

#### `updateProject(projectId, projectData)`
- Updates a project's name, description, and status
- Returns the updated project object
- Throws an error if the project is not found

#### `deleteProject(projectId)`
- Deletes a project by its ID
- Returns true if the project was deleted successfully
- Throws an error if the project is not found

### Project Service

The Project Service (`projectService.js`) provides business logic for project operations, acting as an intermediary between the controller and repository layers. It includes:

#### `createProject(projectData)`
- Delegates to the repository to create a new project
- Handles any errors that occur during project creation

#### `getAllProjects()`
- Delegates to the repository to retrieve all projects
- Handles any errors that occur during retrieval

#### `getProjectById(projectId)`
- Gets the project data from the repository
- Enriches the project data with its associated phases and clients
- Returns a complete project object with phases and clients arrays
- Throws an error if the project is not found

```javascript
const getProjectById = async (projectId) => {
  try {
    // Get the main project data
    const project = await projectRepository.findProjectById(projectId);
    if (!project) {
      throw new Error('Project not found');
    }
    
    // Get all phases associated with the project
    const phases = await phaseRepository.findPhasesByProjectId(projectId);
    
    // Get all clients associated with the project
    const clients = await clientRepository.findClientsByProjectId(projectId);
    
    // Assemble and return the complete project object
    return {
      ...project,
      phases: phases,
      clients: clients
    };
  } catch (error) {
    throw error;
  }
};
```

#### `updateProject(projectId, projectData)`
- First checks if the project exists
- If it exists, delegates to the repository to update the project
- Throws an error if the project is not found

#### `deleteProject(projectId)`
- First checks if the project exists
- If it exists, delegates to the repository to delete the project
- Throws an error if the project is not found

## Phase Management

### Phase Controller

The Phase Controller (`phaseController.js`) handles HTTP requests related to project phases. It includes the following key functions:

#### `addPhaseToProject(req, res)`
- Adds a new phase to a project with the provided name and description
- Validates that required fields are provided
- Returns the newly created phase

```javascript
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
```

#### `setActivePhase(req, res)`
- Sets a specific phase as active
- Marks the currently active phase as completed
- Validates that required fields are provided
- Returns a success message on successful operation

#### `reorderPhases(req, res)`
- Reorders phases for a project based on the provided orderedPhaseIds array
- Validates that the orderedPhaseIds array is valid
- Returns a success message on successful operation

#### `updatePhase(req, res)`
- Updates a phase with the provided name, description, and/or estimated completion date
- Validates that required fields are provided
- Returns the updated phase
- Verifies that the phase belongs to the specified project

#### `deletePhase(req, res)`
- Deletes a phase by its ID
- Verifies that the phase belongs to the specified project before deletion
- Returns a 204 (No Content) status code on successful deletion
- Returns a 404 error if the phase is not found

#### `setPhaseComplete(req, res)`
- Marks a specific phase as completed
- Validates that required fields are provided
- Returns a success message on successful operation

#### `reopenPhase(req, res)`
- Reopens a completed phase, setting it back to pending status
- Validates that required fields are provided
- Returns a success message on successful operation

### Phase Repository

The Phase Repository (`phaseRepository.js`) contains functions for accessing and manipulating phase data in the database. Key functions include:

#### `createPhase(phaseData)`
- Creates a new phase in the database
- Takes projectId, name, description, and order as parameters
- Returns the newly created phase object

```javascript
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
```

#### `findMaxPhaseOrder(projectId)`
- Retrieves the maximum phase order for a given project
- Returns the maximum order or 0 if no phases exist
- Used to determine the order for new phases

#### `findPhaseById(phaseId)`
- Retrieves a phase by its ID
- Returns the phase object or undefined if not found

#### `findPhasesByProjectId(projectId)`
- Retrieves all phases for a specific project
- Orders phases by their phase_order field
- Returns an array of phase objects

#### `setActivePhase(projectId, phaseId, phaseOrder)`
- Sets a specific phase as active
- Marks the currently active phase as completed
- Uses a transaction to ensure atomicity of the operations
- Implements a three-step process within a transaction:
  1. Mark the currently active phase as completed
  2. Reset active status for all phases in the project
  3. Set the target phase as active and not completed

```javascript
const setActivePhase = (projectId, phaseId, phaseOrder) => {
  return new Promise((resolve, reject) => {
    // Start a transaction to ensure all updates are applied atomically
    db.serialize(() => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) {
          return reject(err);
        }
        
        try {
          // Step 1: Mark only the currently active phase as completed
          db.run(
            `UPDATE phases 
             SET is_completed = 1, is_active = 0 
             WHERE project_id = ? AND is_active = 1`,
            [projectId],
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
```

#### `updatePhaseOrder(orderedPhaseIds)`
- Updates the order of phases for a project
- Uses a transaction to ensure atomicity
- Processes each phase ID in the provided order and updates its phase_order field

#### `updatePhase(phaseId, data)`
- Updates a phase's name, description, and estimated completion date
- Handles the case where estimated_completion_at can be null to clear the date
- Returns the updated phase object
- Throws an error if the phase is not found

#### `deletePhase(phaseId)`
- Deletes a phase by its ID
- Returns true if the phase was deleted successfully
- Throws an error if the phase is not found

#### `setPhaseComplete(phaseId)`
- Marks a phase as completed
- Sets is_completed to 1 and is_active to 0
- Returns true if the phase was marked as completed
- Throws an error if the phase is not found

#### `reopenPhase(phaseId)`
- Reopens a completed phase
- Sets is_completed to 0 while keeping is_active as 0
- Returns true if the phase was reopened
- Throws an error if the phase is not found

### Phase Service

The Phase Service (`phaseService.js`) provides business logic for phase operations. It includes:

#### `addPhaseToProject(phaseData)`
- Finds the maximum order for the project
- Creates the phase with the next order number
- Returns the newly created phase

```javascript
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
```

#### `setActivePhase(projectId, phaseId)`
- Verifies that the phase exists
- Ensures that the phase belongs to the specified project
- Delegates to the repository to set the phase as active
- Throws appropriate errors if validation fails

#### `reorderPhases(orderedPhaseIds)`
- Validates the orderedPhaseIds array:
  - Ensures it's an array
  - Ensures it's not empty
  - Ensures all items are numbers
  - Ensures there are no duplicate IDs
- Normalizes the IDs to integers
- Delegates to the repository to update the phase order

```javascript
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
```

#### `updatePhase(phaseId, data)`
- Validates that required fields are provided
- Delegates to the repository to update the phase
- Returns the updated phase object

#### `deletePhase(phaseId)`
- Delegates to the repository to delete the phase
- Returns true if the phase was deleted successfully

#### `setPhaseComplete(projectId, phaseId)`
- Verifies that the phase exists
- Ensures that the phase belongs to the specified project
- Delegates to the repository to mark the phase as complete
- Throws appropriate errors if validation fails

#### `reopenPhase(projectId, phaseId)`
- Verifies that the phase exists
- Ensures that the phase belongs to the specified project
- Delegates to the repository to reopen the phase
- Throws appropriate errors if validation fails

## Database Schema

Although not directly visible in the code provided, we can infer the database schema from the repository functions:

### Projects Table
- `id`: Integer (Primary Key)
- `name`: Text
- `description`: Text
- `status`: Text
- `created_by_admin_id`: Integer (Foreign Key to admins table)
- `created_at`: Datetime
- `updated_at`: Datetime

### Phases Table
- `id`: Integer (Primary Key)
- `project_id`: Integer (Foreign Key to projects table)
- `name`: Text
- `description`: Text
- `phase_order`: Integer
- `is_active`: Boolean (0 or 1)
- `is_completed`: Boolean (0 or 1)
- `estimated_completion_at`: Datetime
- `created_at`: Datetime
- `updated_at`: Datetime

### Project_Clients Table (Junction Table)
- `project_id`: Integer (Foreign Key to projects table)
- `client_id`: Integer (Foreign Key to clients table)

## Key Features Implemented

1. **Project Management**
   - Create, read, update, and delete projects
   - Associate projects with admins who created them
   - Get detailed project information including phases and clients

2. **Phase Management**
   - Add phases to projects with automatic ordering
   - Set phases as active or complete
   - Reorder phases within a project
   - Update phase information including name, description, and estimated completion date
   - Delete phases

3. **Phase Status Tracking**
   - Track which phase is currently active
   - Mark phases as completed
   - Reopen completed phases
   - Transition phase status (active → completed, completed → pending)

4. **Client Project Association**
   - Assign clients to projects
   - Remove clients from projects
   - List all clients associated with a project

## Conclusion

Sprint 2 focused on implementing the core project and phase management functionality of the Phase Tracker application. The backend now has a robust structure with well-defined routes, controllers, repositories, and services to handle all the necessary operations.

The implementation follows a clean architecture approach:
- **Routes** define the API endpoints and validate request parameters
- **Controllers** handle HTTP request/response logic
- **Services** implement business logic
- **Repositories** handle database operations

This architecture ensures separation of concerns and makes the code more maintainable and testable. The code includes proper error handling, transaction management for critical operations, and input validation to ensure data integrity.

The next sprint can build upon this foundation to add more features such as notifications, reporting, and enhanced client interactions.
