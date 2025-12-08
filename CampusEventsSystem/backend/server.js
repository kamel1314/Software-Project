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

// Get all events
app.get('/events', (req, res) => {
  res.json(eventStore.getAll());
});

// Get event by id
app.get('/events/:id', (req, res) => {
  const event = eventStore.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  res.json(event);
});

// Add event (admin only)
app.post('/events', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  const { title, date, location, description } = req.body;
  if (!title || !date || !location || !description) {
    return res.status(400).json({ error: 'Missing fields' });
  }
  eventStore.add({ title, date, location, description });
  res.status(201).json({ message: 'Event added' });
});

// Delete event (admin only)
app.delete('/events/:id', (req, res) => {
  if (!isAdmin(req)) return res.status(403).json({ error: 'Admin only' });
  const event = eventStore.get(req.params.id);
  if (!event) return res.status(404).json({ error: 'Event not found' });
  eventStore.delete(req.params.id);
  res.json({ message: 'Event deleted' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
