-- Campus Events System Database Dump
-- Generated: 2025-12-17

-- ============ SCHEMA ============
CREATE TABLE events (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 100,
  status TEXT NOT NULL DEFAULT 'upcoming'
);

CREATE TABLE registrations (
  id INTEGER PRIMARY KEY,
  event_id INTEGER NOT NULL,
  student_id TEXT NOT NULL,
  registered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  student_name TEXT
);

CREATE TABLE admins (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id TEXT NOT NULL UNIQUE,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ============ ADMINS DATA ============
INSERT INTO admins (admin_id, name) VALUES('231002427', 'kamel');
INSERT INTO admins (admin_id, name) VALUES('231000669', 'shahd');
INSERT INTO admins (admin_id, name) VALUES('231000132', 'Abdelrahman');
