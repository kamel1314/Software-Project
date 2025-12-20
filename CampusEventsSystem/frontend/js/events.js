document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("events-container");
  if (!container) return;

  const events = await fetchEvents();

  container.innerHTML = "";

  events.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card mb-3 shadow-sm";
    card.innerHTML = `
      <div class="card-body">
        <h5>${ev.title}</h5>
        <p>${ev.description}</p>
        <small>${ev.date} - ${ev.location}</small>
      </div>
    `;
    container.appendChild(card);
  });
});

