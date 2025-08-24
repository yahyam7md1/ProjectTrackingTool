const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// --- CORRECTED PATH ---
// This creates a reliable, absolute path to the database file in your project's root directory.
// It works no matter where you run the script from.
const dbPath = path.resolve(__dirname, '..', '..', 'database.db');

// Helper function to run a single query with a Promise
function runQuery(db, query, params = []) {
    return new Promise((resolve, reject) => {
        db.run(query, params, function(err) {
            if (err) {
                // We will specifically ignore "duplicate column" errors to make the script re-runnable
                if (err.message.includes('duplicate column name')) {
                    console.log(`Column already exists, skipping.`);
                    resolve();
                } else {
                    reject(err);
                }
            } else {
                resolve();
            }
        });
    });
}

// Main migration function
async function migrate() {
    // Open the database connection using the corrected, absolute path
    const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
            return console.error("Error opening database:", err.message);
        }
        console.log('Connected to the SQLite database for migration.');
    });

    try {
        // Use db.exec for the initial table creation
        await new Promise((resolve, reject) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS admins (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    email TEXT NOT NULL UNIQUE,
                    password_hash TEXT NOT NULL,
                    first_name TEXT NOT NULL,
                    last_name TEXT NOT NULL,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
                );
                CREATE TABLE IF NOT EXISTS clients ( id INTEGER PRIMARY KEY AUTOINCREMENT, email TEXT NOT NULL UNIQUE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP );
                CREATE TABLE IF NOT EXISTS projects ( id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, description TEXT, status TEXT NOT NULL DEFAULT 'Active', created_by_admin_id INTEGER, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (created_by_admin_id) REFERENCES admins (id) ON DELETE SET NULL );
                CREATE TABLE IF NOT EXISTS phases ( id INTEGER PRIMARY KEY AUTOINCREMENT, project_id INTEGER NOT NULL, name TEXT NOT NULL, description TEXT, phase_order INTEGER NOT NULL, is_active BOOLEAN DEFAULT 0, is_completed BOOLEAN NOT NULL DEFAULT 0, estimated_completion_at DATE, created_at DATETIME DEFAULT CURRENT_TIMESTAMP, updated_at DATETIME DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE );
                CREATE TABLE IF NOT EXISTS project_clients ( project_id INTEGER NOT NULL, client_id INTEGER NOT NULL, PRIMARY KEY (project_id, client_id), FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE, FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE );
                CREATE TABLE IF NOT EXISTS client_codes ( id INTEGER PRIMARY KEY AUTOINCREMENT, client_id INTEGER NOT NULL, code TEXT NOT NULL, expires_at DATETIME NOT NULL, used_at DATETIME, FOREIGN KEY (client_id) REFERENCES clients (id) ON DELETE CASCADE );
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log("Initial tables verified/created successfully.");

        // --- NEW MIGRATION LOGIC ---

        // 1. Add the is_verified column to the admins table
        console.log("Applying migration: Add 'is_verified' to admins table...");
        await runQuery(db, `ALTER TABLE admins ADD COLUMN is_verified BOOLEAN DEFAULT 0`);
        console.log("Migration 'is_verified' applied successfully.");
        
        // Let's also set our existing admin to be verified so our old login still works
        console.log("Updating existing admins to be verified...");
        await runQuery(db, `UPDATE admins SET is_verified = 1 WHERE is_verified = 0`);
        console.log("Existing admins updated.");


        // 2. Create the new admin_codes table
        console.log("Applying migration: Create 'admin_codes' table...");
        await new Promise((resolve, reject) => {
            db.exec(`
                CREATE TABLE IF NOT EXISTS admin_codes (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    admin_id INTEGER NOT NULL,
                    code TEXT NOT NULL,
                    expires_at DATETIME NOT NULL,
                    used_at DATETIME,
                    FOREIGN KEY (admin_id) REFERENCES admins (id) ON DELETE CASCADE
                );
            `, (err) => {
                if (err) reject(err);
                else resolve();
            });
        });
        console.log("Migration 'admin_codes' table applied successfully.");

        console.log("All database migrations completed successfully.");

    } catch (err) {
        console.error("Error running migration:", err.message);
    } finally {
        // Always close the database connection
        db.close((err) => {
            if (err) {
                console.error("Error closing database:", err.message);
            }
            console.log('Closed the database connection.');
        });
    }
}

// Run the migration
migrate();