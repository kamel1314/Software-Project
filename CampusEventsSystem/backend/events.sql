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

-- ============ EVENTS DATA ============
INSERT INTO events VALUES(2, 'python', '2025-12-13', 'room22', 'bring laptop', 100, 'upcoming');
INSERT INTO events VALUES(3, 'IEEE', '2026-01-13', 'room 26', 'bring your laptop', 25, 'upcoming');

-- ============ REGISTRATIONS DATA ============
INSERT INTO registrations VALUES(5, 2, '231002424', '2025-12-09 01:26:07', NULL);
INSERT INTO registrations VALUES(7, 2, '231002427', '2025-12-09 21:05:35', 'kamel walid');
INSERT INTO registrations VALUES(8, 3, '231000245', '2025-12-10 08:19:12', 'kamel walid');
INSERT INTO registrations VALUES(9, 2, '231000245', '2025-12-10 08:19:26', 'kamel walid');
INSERT INTO registrations VALUES(10, 2, '123456789', '2025-12-10 09:09:29', '345678');
