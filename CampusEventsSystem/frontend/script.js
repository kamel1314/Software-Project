console.log("✅ Script connected!");

// Hide Add Event button for students
document.addEventListener("DOMContentLoaded", function () {
  const role = localStorage.getItem("role");
  const addBtn = document.getElementById("addEventBtn");
  if (addBtn && role === "student") {
    addBtn.style.display = "none"; // hide Add button
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const form = document.querySelector("form");
  const container = document.getElementById("events-container");
  const detailsContainer = document.getElementById("event-details");

  // 🟢 ADD EVENT PAGE
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      const title = form.querySelector("input[placeholder='Event Title']").value;
      const date = form.querySelector("input[type='date']").value;
      const location = form.querySelector("input[placeholder='Event Location']").value;
      const description = form.querySelector("textarea").value;

      if (!title || !date || !location || !description) {
        alert("⚠️ Please fill all fields before submitting!");
        return;
      }

      const newEvent = { title, date, location, description };
      const events = JSON.parse(localStorage.getItem("events")) || [];
      events.push(newEvent);
      localStorage.setItem("events", JSON.stringify(events));

      alert("✅ Event added successfully!");
      window.location.href = "index.html";
    });
  }

  // 🟠 HOMEPAGE: List events as titles
  if (container) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    container.innerHTML = "";

    if (events.length === 0) {
      container.innerHTML = "<p>No events yet. Add one!</p>";
    } else {
      events.forEach((event, index) => {
        const div = document.createElement("div");
        div.classList.add("event-list-item");
        div.innerHTML = `
          <h3>${event.title}</h3>
          <p>${event.date}</p>
          <button onclick="viewEvent(${index})">View Details</button>
        `;
        container.appendChild(div);
      });
    }
  }

  // 🧩 EVENT DETAILS PAGE
  if (detailsContainer) {
    const events = JSON.parse(localStorage.getItem("events")) || [];
    const params = new URLSearchParams(window.location.search);
    const index = params.get("id");
    const event = events[index];
    const role = localStorage.getItem("role");

    if (event) {
      let buttonHTML = "";

      // 🧾 Register for Students (Phase 1 visual only)
      if (role === "student") {
        buttonHTML = `<button>📝 Register</button>`;
      }

      // 🗑️ Delete for Admins
      if (role === "admin") {
        buttonHTML = `<button onclick="deleteEvent(${index})">🗑️ Delete Event</button>`;
      }

      detailsContainer.innerHTML = `
        <h2>${event.title}</h2>
        <p><b>Date:</b> ${event.date}</p>
        <p><b>Location:</b> ${event.location}</p>
        <p>${event.description}</p>
        ${buttonHTML}
        <br><br>
        <a href="index.html">← Back to Events</a>
      `;
    } else {
      detailsContainer.innerHTML = "<p>Event not found.</p>";
    }
  }
});

// 🔗 Go to details page
function viewEvent(index) {
  window.location.href = `event.html?id=${index}`;
}

// 🗑️ Delete an event
function deleteEvent(index) {
  const events = JSON.parse(localStorage.getItem("events")) || [];
  events.splice(index, 1);
  localStorage.setItem("events", JSON.stringify(events));
  alert("🗑️ Event deleted successfully!");
  window.location.href = "index.html";
}
