console.log("✅ Script connected!");

const API_URL = "http://localhost:3001/events";

// Helper: Get role from localStorage
function getRole() {
  return localStorage.getItem("role");
}

// Helper: Fetch all events from backend
async function fetchEvents() {
  try {
    const response = await fetch(API_URL);
    return await response.json();
  } catch (error) {
    console.error("Error fetching events:", error);
    return [];
  }
}

// Helper: Add event to backend
async function addEvent(event) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `?role=${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return response.ok;
  } catch (error) {
    console.error("Error adding event:", error);
    return false;
  }
}

// Helper: Delete event from backend
async function deleteEventAPI(eventId) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}?role=${role}`, {
      method: "DELETE",
    });
    return response.ok;
  } catch (error) {
    console.error("Error deleting event:", error);
    return false;
  }
}

// Hide Add Event button for students
document.addEventListener("DOMContentLoaded", function () {
  const role = getRole();
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
    form.addEventListener("submit", async function (e) {
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
      const success = await addEvent(newEvent);

      if (success) {
        alert("✅ Event added successfully!");
        window.location.href = "index.html";
      } else {
        alert("❌ Failed to add event. Make sure you're logged in as admin.");
      }
    });
  }

  // 🟠 HOMEPAGE: List events as titles
  if (container) {
    fetchEvents().then((events) => {
      container.innerHTML = "";

      if (events.length === 0) {
        container.innerHTML = "<p>No events yet. Add one!</p>";
      } else {
        events.forEach((event) => {
          const div = document.createElement("div");
          div.classList.add("event-list-item");
          div.innerHTML = `
            <h3>${event.title}</h3>
            <p>${event.date}</p>
            <button onclick="viewEvent(${event.id})">View Details</button>
          `;
          container.appendChild(div);
        });
      }
    });
  }

  // 🧩 EVENT DETAILS PAGE
  if (detailsContainer) {
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get("id");
    
    fetchEvents().then((events) => {
      const event = events.find(e => e.id == eventId);
      const role = getRole();

      if (event) {
        let buttonHTML = "";

        // 🧾 Register for Students (Phase 1 visual only)
        if (role === "student") {
          buttonHTML = `<button>📝 Register</button>`;
        }

        // 🗑️ Delete for Admins
        if (role === "admin") {
          buttonHTML = `<button onclick="deleteEvent(${event.id})">🗑️ Delete Event</button>`;
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
    });
  }
});

// 🔗 Go to details page
function viewEvent(eventId) {
  window.location.href = `event.html?id=${eventId}`;
}

// 🗑️ Delete an event
async function deleteEvent(eventId) {
  const success = await deleteEventAPI(eventId);
  if (success) {
    alert("🗑️ Event deleted successfully!");
    window.location.href = "index.html";
  } else {
    alert("❌ Failed to delete event. Make sure you're logged in as admin.");
  }
}
