const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(event_id, student_id)
    )
  `);
});

module.exports = {
  getAll: (callback) => {
    db.all('SELECT * FROM events', (err, rows) => {
      callback(err, rows || []);
    });
  },

  get: (id, callback) => {
    db.get('SELECT * FROM events WHERE id = ?', [id], (err, row) => {
      callback(err, row);
    });
  },

  add: (event, callback) => {
    db.run(
      'INSERT INTO events (title, date, location, description) VALUES (?, ?, ?, ?)',
      [event.title, event.date, event.location, event.description],
      function(err) {
        callback(err);
      }
    );
  },

  delete: (id, callback) => {
    db.run('DELETE FROM events WHERE id = ?', [id], (err) => {
      callback(err);
    });
  },

  // Registration functions
  registerStudent: (eventId, studentId, callback) => {
    db.run(
      'INSERT INTO registrations (event_id, student_id) VALUES (?, ?)',
      [eventId, studentId],
      function(err) {
        callback(err);
      }
    );
  },

  unregisterStudent: (eventId, studentId, callback) => {
    db.run(
      'DELETE FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId],
      (err) => {
        callback(err);
      }
    );
  },

  getRegistrations: (eventId, callback) => {
    db.all(
      'SELECT student_id, registered_at FROM registrations WHERE event_id = ? ORDER BY registered_at ASC',
      [eventId],
      (err, rows) => {
        callback(err, rows || []);
      }
    );
  },

  isStudentRegistered: (eventId, studentId, callback) => {
    db.get(
      'SELECT id FROM registrations WHERE event_id = ? AND student_id = ?',
      [eventId, studentId],
      (err, row) => {
        callback(err, !!row);
      }
    );
  },

  getRegistrationCount: (eventId, callback) => {
    db.get(
      'SELECT COUNT(*) as count FROM registrations WHERE event_id = ?',
      [eventId],
      (err, row) => {
        callback(err, row ? row.count : 0);
      }
    );
  },
};
