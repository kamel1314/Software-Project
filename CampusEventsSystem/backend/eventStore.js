const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

// Initialize database table
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
};
