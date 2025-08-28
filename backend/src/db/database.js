/**
 * Database Connection Module
 * Creates and exports a single SQLite database connection for reuse
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database connection
const dbPath = path.join(__dirname, '../../database.db');
console.log(`Attempting to connect to SQLite database at: ${dbPath}`);

// Check if file exists
const fs = require('fs');
if (!fs.existsSync(dbPath)) {
  console.error(`Database file does not exist at path: ${dbPath}`);
  // Don't exit, let it create the file
}

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error connecting to database:', err.message);
    console.error('Database path:', dbPath);
    process.exit(1);
  }
  
  console.log('Successfully connected to the SQLite database.');

  db.exec('PRAGMA foreign_keys = ON;', (err) => {
    if (err) {
      console.error("Failed to enable foreign key enforcement:", err);
    } else {
      console.log("Foreign key enforcement is ON.");
    }
  });


});

// Export the database connection
module.exports = db;
