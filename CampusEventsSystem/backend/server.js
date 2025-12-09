const express = require('express');
const cors = require('cors');
const eventStore = require('./eventStore');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Helper: check admin (simulate via ?role=admin or header)
function isAdmin(req) {
  return req.query.role === 'admin' || req.headers['x-role'] === 'admin';
}

// Helper: check student (simulate via ?role=student or header)
function isStudent(req) {
  return req.query.role === 'student' || req.headers['x-role'] === 'student';
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
  const { title, date, location, description } = req.body;
  if (!title || !date || !location || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  eventStore.add({ title, date, location, description }, (err) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.status(201).json({ message: 'Event added' });
  });
});

// Update event (admin only)
app.put('/events/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  const { title, date, location, description } = req.body;
  if (!title || !date || !location || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  eventStore.update(req.params.id, { title, date, location, description }, (err) => {
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
  const { studentId } = req.body;
  if (!studentId) return res.status(400).json({ error: 'Missing studentId' });

  eventStore.registerStudent(req.params.id, studentId, (err) => {
    if (err) {
      if (err.message && err.message.includes('UNIQUE')) {
        return res.status(400).json({ error: 'Already registered' });
      }
      return res.status(500).json({ error: 'Database error: ' + err.message });
    }
    res.status(201).json({ message: 'Registered successfully' });
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

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
