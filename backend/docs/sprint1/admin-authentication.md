# Documentation: Admin Authentication & Onboarding (Sprint 1)

**Date Completed:** [Your Date Here]

## 1. Objective

The primary goal of this work was to implement a complete, secure, and testable backend system for administrator onboarding and authentication. This system governs how administrators are created, verified, and granted access to the application, ensuring a high level of security and user integrity from the very first interaction.

---

## 2. System Architecture & Flow

The final system consists of three core API endpoints that manage the entire admin lifecycle:

1.  **Sign-Up (`POST /admin/signup`):** A new user provides their details. The system creates an **unverified** account for them and dispatches a verification code via email.
2.  **Account Verification (`POST /admin/verify-account`):** The user provides their email and the code they received. The system validates the code, **activates their account**, and issues their first session token (JWT).
3.  **Login (`POST /admin/login`):** A returning, **verified** user provides their credentials to receive a new session token (JWT).

This two-step sign-up process is a deliberate security measure to validate email ownership and prevent spam or unauthorized account creation.

---

## 3. Implementation Details & Workflow

We followed a layered architecture and a block-based implementation plan.

### Part 1: Initial Login Functionality

*   **Objective:** To allow a pre-existing, trusted admin to log in.
*   **Process:**
    *   **Scaffolding:** The initial `auth.routes.js`, `authController.js`, and `authService.js` files were created.
    *   **Seeding:** A standalone script (`seed.js`) was created to insert the first trusted admin into the database, ensuring their password was securely hashed with `bcrypt`.
    *   **Core Logic:** The `loginAdminService` was built to find a user by email and use `bcrypt.compare()` to validate their password.
    *   **JWT Integration:** Upon successful validation, the service generates a signed JSON Web Token (JWT) with an 8-hour expiration, which the controller returns to the user.

### Part 2: Admin Sign-Up & Verification Flow (Enhancement)

*   **Objective:** To allow new administrators to self-register in a secure, two-step manner.
*   **Database Migration:**
    *   The schema was modified to support this new flow. An `ALTER TABLE` command was used to add an `is_verified BOOLEAN DEFAULT 0` column to the `admins` table.
    *   A new `admin_codes` table (mirroring `client_codes`) was created to store one-time verification codes for admins.
*   **Sign-Up Logic (`signupAdminService`):**
    1.  Checks if an account with the provided email already exists to prevent duplicates (`409 Conflict`).
    2.  Hashes the password and creates a new record in the `admins` table with `is_verified` set to `0`.
    3.  Generates a 6-digit code, saves it to `admin_codes` with a 10-minute expiration, and emails it to the user.
*   **Verification Logic (`verifyAdminAccountService`):**
    1.  Validates the submitted code against the `admin_codes` table, checking that it exists, has not been used, and has not expired.
    2.  If the code is valid, it marks the code as used, updates the corresponding admin's `is_verified` status to `1`, and then issues a JWT.

### Part 3: Login Security Patch (Critical Fix)

*   **Objective:** To close a security loophole identified during testing.
*   **The Vulnerability:** The original `loginAdminService` did not check the `is_verified` flag, allowing an unverified user with a correct password to log in.
*   **The Solution:**
    1.  The `loginAdminService` was updated. After successfully comparing the password, it now performs an **additional check** on the `admin.is_verified` flag.
    2.  If the user is not verified (`is_verified == 0`), the service throws a specific error.
    3.  The `authController` was updated to catch this new error and return a `403 Forbidden` status, correctly indicating that the user is authenticated but not authorized to access the system.

---

## 4. Key Learnings & Debugging Log

*   **Database Migrations:** Learned the importance of using `ALTER TABLE` to modify an existing database schema without data loss, and how to make migration scripts idempotent (re-runnable without causing errors).
*   **File Path Robustness:** Encountered and solved issues related to relative file paths (`./`) versus absolute paths (`path.resolve`). All database scripts were updated to use absolute paths to ensure they work correctly regardless of where they are executed from.
*   **Docker Volumes:** Confirmed the critical role of Docker Volumes for persisting data (`database.db`) and enabling live code reloading (`/src/`). This creates a seamless and efficient development loop.
*   **Importance of Edge Case Testing:** The discovery of the login vulnerability highlighted that testing goes beyond the "happy path." Critical thinking about potential failure modes and security loopholes is essential for building robust software.