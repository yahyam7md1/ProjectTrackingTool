# Documentation: Admin Authentication & Onboarding (Sprint 1)

**Date Completed:** [Your Date Here]

## 1. Objective

The primary goal of this work was to implement a complete, secure, and testable backend system for administrator onboarding and authentication. This system governs how administrators are created, verified, and granted access to the application's administrative areas.

---

## 2. Architectural Plan & Workflow

We followed a layered architecture and a block-based implementation plan to ensure separation of concerns and a methodical workflow.

### Initial File Scaffolding (The "Why")

Before adding logic, we created the core files to establish our architectural pattern.

*   **Routes File (`/src/api/v1/auth.routes.js`):** The "Front Door" of our API. Its only job is to look at the incoming URL (e.g., `/admin/login`) and direct the request to the correct controller function. This keeps our endpoints organized and versioned.

*   **Controller File (`/src/controllers/authController.js`):** The "Manager." It handles the raw web request and response. It unpacks the data from the request (`req.body`), calls the appropriate service to do the actual work, and then formats the final HTTP response to send back to the user. It contains no business logic itself.

*   **Service File (`/src/services/authService.js`):** The "Expert" or the "Brains." This file contains all the core business logic, such as finding users, comparing passwords, and generating tokens. Keeping logic here makes it reusable and easy to test in isolation from the web layer.

---

## 3. Implementation Blocks (Execution Order)

### Part 1: Initial Admin Login

*   **Block 1: Scaffolding the Files**
    *   **Purpose:** To establish the architectural pattern described above.

*   **Block 2: Seeding the First Admin**
    *   **Purpose:** To create the first valid, trusted user in the database for testing.
    *   **Process:** A standalone script (`seed.js`) was created to connect to the database, hash a predefined password using `bcrypt`, and insert the new admin record.

*   **Block 3: Implementing Core Login Logic**
    *   **Purpose:** To write the "brains" of the authentication check.
    *   **Process:** The `loginAdminService` was built to find a user by their email and use `bcrypt.compare()` to securely check if their password matches the stored hash.

*   **Block 4: Integrating JWT Generation**
    *   **Purpose:** To issue a secure "session key" (JWT) upon successful login.
    *   **Process:** The `jsonwebtoken` library was used. After a successful password check, the `authService` generates a signed token containing the admin's ID.

*   **Block 5: Wiring Up the Routes**
    *   **Purpose:** To make the authentication endpoint live and accessible.
    *   **Process:** The main `server.js` file was modified to `app.use('/api/v1/auth', authRoutes)` to connect the feature to the main application.

### Part 2: New Admin Sign-Up & Verification Flow

*   **Block A: Scaffolding the New Routes & Functions**
    *   **Purpose:** To define the new API endpoints for the two-step sign-up process.
    *   **Process:** The `auth.routes.js` file was updated with two new endpoints: `POST /admin/signup` and `POST /admin/verify-account`. Corresponding empty functions were added to the controller and service files.

*   **Block B: Implementing the Sign-Up & Code Dispatch Logic**
    *   **Purpose:** To build the service that creates an unverified admin and sends them a verification code.
    *   **Process:** The `signupAdminService` was built to:
        1.  Check for existing users to prevent duplicates.
        2.  Hash the new admin's password.
        3.  Create the admin in the database with `is_verified` set to `0`.
        4.  Generate, save, and email a 6-digit verification code to the new user.

*   **Block C: Implementing the Account Verification & Login Logic**
    *   **Purpose:** To build the service that validates a code, activates the account, and issues a JWT.
    *   **Process:** The `verifyAdminAccountService` was built to:
        1.  Validate the submitted email and code against the database, checking for expiration and previous use.
        2.  If valid, mark the code as used in `admin_codes`.
        3.  Update the user's record in the `admins` table by setting `is_verified` to `1`.
        4.  Generate and return the admin's first JWT.

*   **Block D: Patching the Admin Login Verification Check (Security Fix)**
    *   **Purpose:** To close a security vulnerability where unverified admins could log in.
    *   **Process:**
        1.  The original `loginAdminService` was modified.
        2.  An **additional check** was added after the password comparison to ensure that `admin.is_verified` is `1`.
        3.  If the admin is not verified, the service now throws an error, which the controller catches and returns as a `403 Forbidden` status.

---

## 4. Key Learnings & Debugging Log

*   **Database Migrations:** The need for a secure sign-up flow required modifying the database schema. An `ALTER TABLE` command was used to add an `is_verified` column to the `admins` table, and a new `admin_codes` table was created. The migration script was made idempotent to be safely re-runnable.
*   **File Path Robustness:** Solved issues related to relative vs. absolute file paths in database scripts by adopting `path.resolve` to ensure scripts always target the correct database file.
*   **Docker Volumes:** Confirmed the critical role of Docker Volumes for persisting the database (`database.db`) and enabling live code reloading (`/src`), which creates a seamless and efficient development loop.
*   **Debugging Log: The Docker Database Issue**
    *   **Symptoms:** Postman returned a 500 Internal Server Error, and the seeded admin user seemed to disappear.
    *   **Root Cause:** The `database.db` file was listed in the `.dockerignore` file, preventing it from being included in the Docker image.
    *   **Solution:** The `.dockerignore` entry was removed, and improved error logging was added to the controllers and services for easier debugging.
*   **Importance of Edge Case Testing:** The discovery of the login vulnerability highlighted that testing goes beyond the "happy path." Critical thinking about potential failure modes and security loopholes is essential for building robust software.