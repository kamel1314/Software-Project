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

// Helper: check admin (simulate via ?role=admin or header)
function isAdmin(req) {
  return req.query.role === 'admin' || req.headers['x-role'] === 'admin';
}

// Helper: check student (simulate via ?role=student or header)
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

  return {
    value: {
      title,
      date,
      location,
      description,
      capacity,
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

  eventStore.get(req.params.id, (err, event) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    if (!event) return res.status(404).json({ error: 'Event not found' });

    const capNum = Number(event.capacity);
    const capacity = Number.isInteger(capNum) && capNum > 0 ? capNum : Infinity;

    eventStore.getRegistrationCount(req.params.id, (errCount, count) => {
      if (errCount) return res.status(500).json({ error: 'Database error' });
      if (count >= capacity) {
        return res.status(400).json({ error: 'Event is full' });
      }

      eventStore.registerStudent(req.params.id, studentId, studentName.trim(), (regErr) => {
        if (regErr) {
          if (regErr.message && regErr.message.includes('UNIQUE')) {
            return res.status(400).json({ error: 'Already registered' });
          }
          return res.status(500).json({ error: 'Database error: ' + regErr.message });
        }
        res.status(201).json({ message: 'Registered successfully' });
      });
    });
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
    const capacity = Number.isInteger(capNum) && capNum > 0 ? capNum : 0;

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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
