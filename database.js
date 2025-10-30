const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'bookings.db');
const db = new sqlite3.Database(dbPath);

// Datenbank initialisieren
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verein_name TEXT NOT NULL,
      contact_person TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      event_description TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = db;
