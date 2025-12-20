async function fetchEvents() {
  const res = await fetch(EVENTS_URL);
  return res.json();
}

async function addEvent(event) {
  const role = localStorage.getItem("role");
  const res = await fetch(`${EVENTS_URL}?role=${role}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(event),
  });
  return res.ok;
}

async function deleteEvent(id) {
  const role = localStorage.getItem("role");
  const res = await fetch(`${EVENTS_URL}/${id}?role=${role}`, {
    method: "DELETE",
  });
  return res.ok;
}
