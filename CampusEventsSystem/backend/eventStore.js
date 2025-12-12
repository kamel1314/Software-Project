const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'events.db');
const db = new sqlite3.Database(dbPath);

// Helper to add missing columns safely (guards against duplicate ALTER errors)
function ensureColumn(table, column, definition) {
  db.get(`PRAGMA table_info(${table})`, (err) => {
    if (err) return; // best effort
    db.all(`PRAGMA table_info(${table})`, (err2, rows) => {
      if (err2) return;
      const exists = (rows || []).some((r) => r.name === column);
      if (!exists) {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, () => {});
      }
    });
  });
}

// Initialize database tables
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      date TEXT NOT NULL,
      location TEXT NOT NULL,
      description TEXT NOT NULL,
      capacity INTEGER NOT NULL DEFAULT 100,
      status TEXT NOT NULL DEFAULT 'upcoming'
    )
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS registrations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      event_id INTEGER NOT NULL,
      student_id TEXT NOT NULL,
      student_name TEXT,
      registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
      UNIQUE(event_id, student_id)
    )
  `);

  // Backfill columns for older databases (best effort)
  ensureColumn('events', 'capacity', 'INTEGER NOT NULL DEFAULT 100');
  ensureColumn('events', 'status', "TEXT NOT NULL DEFAULT 'upcoming'");
  ensureColumn('registrations', 'student_name', 'TEXT');
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
      'INSERT INTO events (title, date, location, description, capacity, status) VALUES (?, ?, ?, ?, ?, ?)',
      [event.title, event.date, event.location, event.description, event.capacity, event.status || 'upcoming'],
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

  update: (id, event, callback) => {
    db.run(
      'UPDATE events SET title = ?, date = ?, location = ?, description = ?, capacity = ?, status = ? WHERE id = ?',
      [event.title, event.date, event.location, event.description, event.capacity, event.status || 'upcoming', id],
      function(err) {
        callback(err);
      }
    );
  },

  // Registration functions
  registerStudent: (eventId, studentId, studentName, callback) => {
    db.run(
      'INSERT INTO registrations (event_id, student_id, student_name) VALUES (?, ?, ?)',
      [eventId, studentId, studentName],
      function(err) {
        callback(err);
      }
    );
  },

  // Atomic registration with capacity/status enforcement and status auto-update
  registerStudentAtomic: (eventId, studentId, studentName, callback) => {
    const rollback = (cb) => db.run('ROLLBACK', () => cb && cb());

    db.serialize(() => {
      db.run('BEGIN IMMEDIATE TRANSACTION', (beginErr) => {
        if (beginErr) return callback(beginErr);

        db.get('SELECT * FROM events WHERE id = ?', [eventId], (eventErr, event) => {
          if (eventErr) return rollback(() => callback(eventErr));
          if (!event) {
            const err = new Error('Event not found');
            err.code = 'EVENT_NOT_FOUND';
            return rollback(() => callback(err));
          }

          const cap = Number(event.capacity);
          if (!Number.isInteger(cap) || cap < 1) {
            const err = new Error('Invalid capacity on event');
            err.code = 'INVALID_CAPACITY';
            return rollback(() => callback(err));
          }

          if (event.status === 'cancelled') {
            const err = new Error('Event is cancelled');
            err.code = 'EVENT_CANCELLED';
            return rollback(() => callback(err));
          }
          if (event.status === 'completed') {
            const err = new Error('Event is completed');
            err.code = 'EVENT_COMPLETED';
            return rollback(() => callback(err));
          }
          if (event.status === 'full') {
            const err = new Error('Event is full');
            err.code = 'EVENT_FULL';
            return rollback(() => callback(err));
          }

          db.get('SELECT COUNT(*) as count FROM registrations WHERE event_id = ?', [eventId], (countErr, row) => {
            if (countErr) return rollback(() => callback(countErr));
            const count = row ? row.count : 0;
            if (count >= cap) {
              const err = new Error('Event is full');
              err.code = 'EVENT_FULL';
              return rollback(() => callback(err));
            }

            db.run(
              'INSERT INTO registrations (event_id, student_id, student_name) VALUES (?, ?, ?)',
              [eventId, studentId, studentName],
              function(regErr) {
                if (regErr) {
                  const isUnique = regErr.message && regErr.message.includes('UNIQUE');
                  if (isUnique) {
                    const err = new Error('Already registered');
                    err.code = 'ALREADY_REGISTERED';
                    return rollback(() => callback(err));
                  }
                  return rollback(() => callback(regErr));
                }

                const newCount = count + 1;
                const spotsLeft = Math.max(0, cap - newCount);
                const shouldMarkFull = newCount >= cap && event.status !== 'full';

                const finalize = () => {
                  db.run('COMMIT', (commitErr) => {
                    if (commitErr) return callback(commitErr);
                    callback(null, { status: shouldMarkFull ? 'full' : event.status, spotsLeft });
                  });
                };

                if (shouldMarkFull) {
                  db.run(
                    'UPDATE events SET status = ? WHERE id = ?',
                    ['full', eventId],
                    (updateErr) => {
                      if (updateErr) return rollback(() => callback(updateErr));
                      finalize();
                    }
                  );
                } else {
                  finalize();
                }
              }
            );
          });
        });
      });
    });
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
      'SELECT student_id, student_name, registered_at FROM registrations WHERE event_id = ? ORDER BY registered_at ASC',
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

  // Analytics helpers
  getTotals: (callback) => {
    db.get('SELECT COUNT(*) AS totalEvents, IFNULL(SUM(capacity), 0) AS totalCapacity FROM events', (errEvents, eventsRow) => {
      if (errEvents) return callback(errEvents);
      db.get('SELECT COUNT(*) AS totalRegistrations FROM registrations', (errRegs, regsRow) => {
        if (errRegs) return callback(errRegs);
        callback(null, {
          totalEvents: eventsRow ? eventsRow.totalEvents : 0,
          totalCapacity: eventsRow ? eventsRow.totalCapacity : 0,
          totalRegistrations: regsRow ? regsRow.totalRegistrations : 0,
        });
      });
    });
  },

  getEventStats: (callback) => {
    db.all(
      `SELECT e.id, e.title, e.date, e.capacity,
              IFNULL(COUNT(r.id), 0) AS registrations
       FROM events e
       LEFT JOIN registrations r ON r.event_id = e.id
       GROUP BY e.id
       ORDER BY e.date ASC, e.id ASC`,
      (err, rows) => {
        if (err) return callback(err);
        const stats = (rows || []).map((row) => ({
          id: row.id,
          title: row.title,
          date: row.date,
          capacity: row.capacity,
          registrations: row.registrations,
          spotsLeft: Math.max(0, (row.capacity || 0) - (row.registrations || 0)),
        }));
        callback(null, stats);
      }
    );
  },
};
