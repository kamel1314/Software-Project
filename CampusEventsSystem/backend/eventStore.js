// Simple in-memory event store
let events = [];

module.exports = {
  getAll: () => events,
  get: (id) => events[id],
  add: (event) => { events.push(event); },
  delete: (id) => { events.splice(id, 1); },
  set: (newEvents) => { events = newEvents; },
};
