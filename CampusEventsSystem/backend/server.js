const express = require('express');
const cors = require('cors');
const eventStore = require('./eventStore');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Validate date: format YYYY-MM-DD, real calendar date, today or future
function isValidDate(dateStr) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  // Check real date (no overflow like 2023-02-30)
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(Date.UTC(y, m - 1, d));
  return cmp >= today;
}

// Helper: check admin (demo-friendly: query/header role)
function isAdmin(req) {
  return req.query.role === 'admin' || req.headers['x-role'] === 'admin';
}

// Helper: check student (demo-friendly: query/header role)
function isStudent(req) {
  return req.query.role === 'student' || req.headers['x-role'] === 'student';
}

function sanitizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function parseCapacity(value) {
  const n = Number(value);
  return Number.isInteger(n) ? n : NaN;
}

function validateEventPayload(body) {
  const title = sanitizeString(body.title);
  const date = sanitizeString(body.date);
  const location = sanitizeString(body.location);
  const description = sanitizeString(body.description);
  const capacity = parseCapacity(body.capacity);
  const status = sanitizeString(body.status) || 'upcoming';
  const validStatuses = ['upcoming', 'full', 'cancelled', 'completed'];

  if (!title || !date || !location || !description) {
    return { error: 'Missing fields' };
  }

  if (title.length > 200) return { error: 'Title too long (max 200 chars)' };
  if (location.length > 200) return { error: 'Location too long (max 200 chars)' };
  if (description.length > 1000) return { error: 'Description too long (max 1000 chars)' };

  if (!isValidDate(date)) {
    return { error: 'Invalid date. Use YYYY-MM-DD, real date, today or future.' };
  }

  if (!Number.isInteger(capacity) || capacity < 1 || capacity > 100000) {
    return { error: 'Capacity must be a positive integer (1-100000).' };
  }

  if (!validStatuses.includes(status)) {
    return { error: 'Invalid status. Must be: upcoming, full, cancelled, or completed.' };
  }

  return {
    value: {
      title,
      date,
      location,
      description,
      capacity,
      status,
    }
  };
}

// Get all events
app.get('/events', (req, res) => {
  eventStore.getAll((err, events) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(events);
  });
});

// Get event by id
app.get('/events/:id', (req, res) => {
  eventStore.get(req.params.id, (err, event) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    res.json(event);
  });
});

// Add event (admin only)
app.post('/events', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  const validated = validateEventPayload(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });

  eventStore.add(validated.value, (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Event added' });
  });
});

// Update event (admin only)
app.put('/events/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  const validated = validateEventPayload(req.body);
  if (validated.error) return res.status(400).json({ error: validated.error });

  eventStore.update(req.params.id, validated.value, (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Event updated' });
  });
});

// Delete event (admin only)
app.delete('/events/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  eventStore.get(req.params.id, (err, event) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!event) return res.status(404).json({ error: 'Event not found' });
    
    eventStore.delete(req.params.id, (err) => {
      if (err) return res.status(500).json({ error: 'Database error' });
      res.json({ message: 'Event deleted' });
    });
  });
});

// Register student for event
app.post('/events/:id/register', (req, res) => {
  if (!isStudent(req)) return res.status(403).json({ error: 'Student only' });
  const { studentId, studentName } = req.body;
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });
  if (!studentName || !studentName.trim()) return res.status(400).json({ error: 'Missing studentName' });

  eventStore.registerStudentAtomic(req.params.id, studentId, studentName.trim(), (err, result) => {
    if (err) {
      if (err.code === 'EVENT_NOT_FOUND') return res.status(404).json({ error: 'Event not found' });
      if (err.code === 'EVENT_CANCELLED') return res.status(400).json({ error: 'Event is cancelled' });
      if (err.code === 'EVENT_COMPLETED') return res.status(400).json({ error: 'Event is completed' });
      if (err.code === 'EVENT_FULL') return res.status(400).json({ error: 'Event is full' });
      if (err.code === 'ALREADY_REGISTERED') return res.status(400).json({ error: 'Already registered' });
      if (err.code === 'INVALID_CAPACITY') return res.status(500).json({ error: 'Invalid capacity on event' });
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }

    return res.status(201).json({ message: 'Registered successfully', status: result.status, spotsLeft: result.spotsLeft });
  });
});

// Unregister student from event
app.delete('/events/:id/register', (req, res) => {
  if (!isStudent(req)) return res.status(403).json({ error: 'Student only' });
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });

  eventStore.unregisterStudent(req.params.id, studentId, (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ message: 'Unregistered successfully' });
  });
});

// Check if student is registered
app.get('/events/:id/registered/:studentId', (req, res) => {
  eventStore.isStudentRegistered(req.params.id, req.params.studentId, (err, isRegistered) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ registered: isRegistered });
  });
});

// Get event registrations (admin only)
app.get('/events/:id/registrations', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  eventStore.getRegistrations(req.params.id, (err, registrations) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ registrations, count: registrations.length });
  });
});

// Capacity info (open)
app.get('/events/:id/capacity', (req, res) => {
  eventStore.get(req.params.id, (err, event) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const capNum = Number(event.capacity);
    if (!Number.isInteger(capNum) || capNum < 1) {
      return res.status(500).json({ error: 'Invalid capacity on event' });
    }
    const capacity = capNum;

    eventStore.getRegistrationCount(req.params.id, (errCount, count) => {
      if (errCount) return res.status(500).json({ error: 'Database error' });
      res.json({ capacity, registered: count, spotsLeft: Math.max(0, capacity - count) });
    });
  });
});

// Analytics: summary (admin only)
app.get('/analytics/summary', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  eventStore.getTotals((err, totals) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(totals);
  });
});

// Analytics: per-event stats (admin only)
app.get('/analytics/events', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  eventStore.getEventStats((err, stats) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json({ events: stats });
  });
});

// Verify admin ID
app.post('/auth/verify-admin', (req, res) => {
  const { adminId } = req.body;
  if (!adminId || !adminId.trim()) {
    return res.status(400).json({ error: 'Admin ID required' });
  }

  eventStore.isAdminIdValid(adminId.trim(), (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (result.valid) {
      res.json({ valid: true, name: result.name, message: 'Admin verified' });
    } else {
      res.status(401).json({ valid: false, error: 'Unknown user — access denied' });
    }
  });
});

// Add new admin (requires verification from existing admin)
app.post('/auth/add-admin', (req, res) => {
  const { verifyAdminId, newAdminId, newAdminName } = req.body;

  // Validate inputs
  if (!verifyAdminId || !verifyAdminId.trim()) {
    return res.status(400).json({ error: 'Verification admin ID required' });
  }
  if (!newAdminId || !newAdminId.trim()) {
    return res.status(400).json({ error: 'New admin ID required' });
  }
  if (!newAdminName || !newAdminName.trim()) {
    return res.status(400).json({ error: 'New admin name required' });
  }

  // Verify the requester is a valid admin
  eventStore.isAdminIdValid(verifyAdminId.trim(), (err, result) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!result.valid) {
      return res.status(403).json({ error: 'You are not authorized to add admins' });
    }

    // Check if new admin ID already exists
    eventStore.isAdminIdValid(newAdminId.trim(), (checkErr, checkResult) => {
      if (checkErr) return res.status(500).json({ error: 'Database error' });
      if (checkResult.valid) {
        return res.status(400).json({ error: 'This admin ID already exists' });
      }

      // Add the new admin
      eventStore.addAdmin(newAdminId.trim(), newAdminName.trim(), (addErr) => {
        if (addErr) {
          if (addErr.message && addErr.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'This admin ID already exists' });
          }
          return res.status(500).json({ error: 'Database error' });
        }
        res.status(201).json({ valid: true, message: `Admin ${newAdminName} added successfully` });
      });
    });
  });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
