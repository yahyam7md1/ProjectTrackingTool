/**
 * Admin User Seeder
 * This script adds the first admin user to the database
 * Run this script manually from the command line using:
 * node src/db/seed.js
 */

const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const path = require('path');

// Admin credentials
const ADMIN_EMAIL = 'admin@phasetracker.com';
const ADMIN_PASSWORD = 'Admin@123'; // You should change this password
const SALT_ROUNDS = 10;

// Database connection
const dbPath = path.join(__dirname, '../../database.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    process.exit(1);
  }
  console.log('Connected to the SQLite database.');
});

// Seed admin user
async function seedAdminUser() {
  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, SALT_ROUNDS);
    
    // Check if admin already exists
    db.get('SELECT * FROM admins WHERE email = ?', [ADMIN_EMAIL], (err, admin) => {
      if (err) {
        console.error('Error checking for existing admin:', err.message);
        closeDbAndExit(1);
      }
      
      if (admin) {
        console.log(`Admin user with email ${ADMIN_EMAIL} already exists.`);
        closeDbAndExit(0);
      } else {
        // Insert admin user
        const sql = `
          INSERT INTO admins (email, password_hash, first_name, last_name, created_at, updated_at)
          VALUES (?, ?, ?, ?, datetime('now'), datetime('now'))
        `;
        
        db.run(sql, [ADMIN_EMAIL, hashedPassword, 'Admin', 'User'], function(err) {
          if (err) {
            console.error('Error creating admin user:', err.message);
            closeDbAndExit(1);
          }
          
          console.log(`Admin user created successfully with ID: ${this.lastID}`);
          console.log(`Email: ${ADMIN_EMAIL}`);
          console.log('Password: [HIDDEN] (check the script for the password)');
          closeDbAndExit(0);
        });
      }
    });
  } catch (error) {
    console.error('Error hashing password:', error.message);
    closeDbAndExit(1);
  }
}

// Helper function to close the database connection and exit
function closeDbAndExit(code) {
  db.close((err) => {
    if (err) {
      console.error('Error closing database connection:', err.message);
    } else {
      console.log('Database connection closed.');
    }
    process.exit(code);
  });
}

// Run the seeder
seedAdminUser();
