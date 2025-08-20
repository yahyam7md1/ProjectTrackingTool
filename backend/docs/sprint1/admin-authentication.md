# Documentation: Admin Authentication Backend (Sprint 1)

**Date Completed:** [20/08/2025]

## 1. Objective

The primary goal of this work was to implement a complete, secure, and testable backend system for administrator authentication. This system is the first locked door to the application's administrative areas, ensuring that only authorized users can proceed.

---

## 2. Architectural Plan & Workflow

We followed a layered architecture and a block-based implementation plan to ensure separation of concerns and a methodical workflow.

### The Five Blocks of Execution:

*   **Block 1: Scaffolding the Files**
    *   **Purpose:** To establish the architectural pattern.
    *   **Files Created:**
        *   `auth.routes.js`: The "front door." Defines the URL endpoints.
        *   `authController.js`: The "manager." Handles the raw HTTP request/response.
        *   `authService.js`: The "expert." Contains the core business logic.

*   **Block 2: Seeding the First Admin**
    *   **Purpose:** To create the first valid user in the database for testing.
    *   **Process:** A standalone script (`seed.js`) was created to connect to the database, hash a predefined password using `bcrypt`, and insert the new admin record. This ensures we never store plain-text passwords.

*   **Block 3: Implementing Core Login Logic**
    *   **Purpose:** To write the "brains" of the authentication check.
    *   **Process:** The `authService` was built to:
        1.  Find a user by their email in the database.
        2.  If found, use `bcrypt.compare()` to securely check if the provided password matches the stored hash.
        3.  Throw an error for invalid credentials, which the controller will catch.

*   **Block 4: Integrating JWT Generation**
    *   **Purpose:** To issue a secure "session key" (JWT) upon successful login.
    *   **Process:** The `jsonwebtoken` library was used. After a successful password check, the `authService` generates a signed token containing the admin's ID. This token is configured to expire after 8 hours for security. The `authController` was updated to return this token in the final JSON response.

*   **Block 5: Wiring Up the Routes**
    *   **Purpose:** To make the authentication endpoint live and accessible.
    *   **Process:** The main `server.js` file was modified to `app.use('/api/v1/auth', authRoutes)`. This connects our auth feature to the main application, directing all relevant traffic to our new logic.

---

## 3. Debugging Log: The Docker Database Issue

During testing, we encountered a critical issue where the login was failing with a generic error.

*   **Symptoms:** Postman returned a 500 Internal Server Error, and the seeded admin user seemed to disappear between server restarts.

*   **Root Cause Analysis:** The problem was twofold, both related to Docker:
    1.  **`.dockerignore` Exclusion:** The `database.db` file was listed in the `.dockerignore` file. This meant that when Docker built the image, it intentionally ignored and excluded our database file. The application inside the container had no database to connect to.
    2.  **Lack of Persistence:** Even if the file were included, data wouldn't persist across container rebuilds without a Docker Volume.

*   **Solution Implemented:**
    1.  The `database.db` line was commented out in the `.dockerignore` file, ensuring the seeded database is copied into the image during the build process.
    2.  Improved, more detailed error logging was added to the `try...catch` blocks in the controller and service. This was crucial for moving past the generic "error occurred" message to see the real underlying error.

**Key Takeaway:** The environment in which code runs is just as important as the code itself. A `.dockerignore` file can prevent critical files from being included in the final container, and robust error logging is essential for effective debugging.