# Documentation: Client Authentication Backend (Sprint 1)

**Date Completed:** [Your Date Here]

## 1. Objective

The goal of this work was to implement a secure, passwordless authentication system for external clients. This flow is designed to be both user-friendly and highly secure, relying on one-time verification codes sent via email. This completes the core authentication features for the application.

---

## 2. Architectural Plan & Workflow

We extended our existing layered architecture to accommodate the new client-facing endpoints. The implementation was broken down into logical blocks to manage complexity, especially with the introduction of an external email service.

### The Four Blocks of Execution:

*   **Block 6: Scaffolding & Nodemailer Setup**
    *   **Purpose:** To prepare the file structure for the new feature and configure the email sending utility.
    *   **Process:**
        1.  The `auth.routes.js` file was updated with two new endpoints: `POST /client/request-code` and `POST /client/verify-code`.
        2.  The `authController.js` and `authService.js` files were updated with corresponding empty function stubs (`requestClientCode`, `verifyClientCode`, etc.).
        3.  A new utility file, `utils/emailService.js`, was created. It was configured with `Nodemailer` to use a generic SMTP transport, pulling credentials securely from `.env` variables (`EMAIL_USER`, `EMAIL_PASSWORD`). This utility encapsulates all email-sending logic.

*   **Block 7: Implementing the "Request Code" Logic**
    *   **Purpose:** To build the complete workflow for a client requesting a login code.
    *   **Process:** This is a multi-step service (`requestClientCodeService`):
        1.  **Find Client:** It first checks the `clients` table using `findClientByEmail` to see if the user exists.
        2.  **Security Measure:** If no client is found, the function returns silently. This prevents "email enumeration," where an attacker could otherwise guess valid client emails by watching for error responses.
        3.  **Code Generation:** A cryptographically insecure but sufficient 6-digit random code is generated.
        4.  **Database Persistence:** The new code, along with the associated `client_id` and a calculated 10-minute expiration timestamp, is saved to the `client_codes` table.
        5.  **Email Dispatch:** The `emailService` is called to send the generated code to the client's email address.
    *   **Controller Logic:** The `requestClientCode` controller was designed to **always** return a generic `200 OK` success message, further enhancing the security against email enumeration.

*   **Block 8: Implementing the "Verify Code" Logic**
    *   **Purpose:** To build the core validation engine for checking a submitted code.
    *   **Process:** The `verifyClientCodeService` acts as a security checkpoint with a chain of validation rules:
        1.  It verifies the client exists based on the provided email.
        2.  It checks the `client_codes` table for a record matching both the `client_id` and the `code`.
        3.  It checks if the code has already been used by inspecting the `used_at` column.
        4.  It checks if the code has expired by comparing the `expires_at` timestamp to the current time.
    *   **Failure Condition:** If any of these checks fail, the service throws a specific error (e.g., "Invalid verification code." or "Verification code has expired.").

*   **Block 9: Finalizing with JWT Generation & Invalidation**
    *   **Purpose:** To complete the login flow by issuing a JWT and preventing code reuse.
    *   **Process:**
        1.  A new data access function, `markCodeAsUsed(codeId)`, was created to `UPDATE` a code record and set its `used_at` timestamp.
        2.  The "success path" of the `verifyClientCodeService` was updated. After all checks pass, it first calls `markCodeAsUsed` to invalidate the code.
        3.  It then generates a client-specific JWT with a payload of `{ clientId: client.id }`.
        4.  Finally, the service returns the token, which the controller sends back to the user in a `200 OK` response.

---

## 3. Key Architectural Decisions & Outcomes

*   **Passwordless Flow:** Provides a seamless user experience for clients, who don't need to remember a password, while maintaining high security through time-sensitive, single-use codes.

*   **Decoupled Email Service:** By creating a dedicated `emailService.js`, the core application logic is not tightly coupled to Nodemailer. If we ever decide to switch from SMTP to an API-based email service (like SendGrid), we only need to update this one file, and the rest of the application remains unchanged.

*   **Robust Validation:** The verification service performs multiple, sequential checks. This ensures that only a valid, unexpired, and unused code can result in a successful login, closing potential security loopholes.

*   **Thorough Testing:** The feature was validated with a comprehensive test plan covering the "happy path" (successful login), as well as critical failure cases like reused codes and incorrect codes. This confirms the system is both functional and secure.

This completes the backend implementation for Sprint 1. The application now has a fully functional and secure authentication system for both administrators and clients.