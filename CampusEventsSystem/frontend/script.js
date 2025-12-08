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

// Helper: Register student for event
async function registerForEvent(eventId, studentId) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}/register?role=${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error registering:", error);
    return false;
  }
}

// Helper: Unregister student from event
async function unregisterFromEvent(eventId, studentId) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}/register?role=${role}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId }),
    });
    return response.ok;
  } catch (error) {
    console.error("Error unregistering:", error);
    return false;
  }
}

// Helper: Check if student is registered
async function checkRegistration(eventId, studentId) {
  try {
    const response = await fetch(API_URL + `/${eventId}/registered/${studentId}`);
    const data = await response.json();
    return data.registered;
  } catch (error) {
    console.error("Error checking registration:", error);
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
    const role = getRole();
    const studentId = role === "student" ? localStorage.getItem("studentId") : null;
    
    fetchEvents().then((events) => {
      const event = events.find(e => e.id == eventId);

      if (event) {
        let buttonHTML = "";

        // 🧾 Register for Students
        if (role === "student" && studentId) {
          checkRegistration(eventId, studentId).then((isRegistered) => {
            if (isRegistered) {
              buttonHTML = `<button onclick="handleUnregister(${eventId}, '${studentId}')">✅ Registered - Click to Unregister</button>`;
            } else {
              buttonHTML = `<button onclick="handleRegister(${eventId}, '${studentId}')">📝 Register</button>`;
            }
            updateEventDetails(event, buttonHTML);
          });
        } else if (role === "admin") {
          // 🗑️ Delete for Admins
          buttonHTML = `<button onclick="deleteEvent(${event.id})">🗑️ Delete Event</button>`;
          updateEventDetails(event, buttonHTML);
        }

        function updateEventDetails(event, buttonHTML) {
          let content = `
            <h2>${event.title}</h2>
            <p><b>Date:</b> ${event.date}</p>
            <p><b>Location:</b> ${event.location}</p>
            <p>${event.description}</p>
            ${buttonHTML}
          `;

          // Show registrations for admin
          if (role === "admin") {
            content += `<br><br><div id="registrations-section" style="margin-top: 20px; padding: 10px; background: #f0f0f0; border-radius: 5px;">
              <h3>📋 Registrations</h3>
              <div id="registrations-list">Loading...</div>
            </div>`;
          }

          content += `<br><br><a href="index.html">← Back to Events</a>`;
          detailsContainer.innerHTML = content;

          // Load registrations for admin
          if (role === "admin") {
            loadRegistrations(eventId);
          }
        }
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

// 📝 Register for event
async function handleRegister(eventId, studentId) {
  if (!studentId) {
    alert("❌ Student ID not found. Please log in again.");
    return;
  }
  
  const success = await registerForEvent(eventId, studentId);
  if (success) {
    alert("✅ Registered successfully!");
    location.reload();
  } else {
    alert("❌ Failed to register. Please try again or check your internet connection.");
  }
}

// 📝 Unregister from event
async function handleUnregister(eventId, studentId) {
  const confirmed = confirm("Are you sure you want to unregister?");
  if (confirmed) {
    const success = await unregisterFromEvent(eventId, studentId);
    if (success) {
      alert("✅ Unregistered successfully!");
      location.reload();
    } else {
      alert("❌ Failed to unregister.");
    }
  }
}

// 📋 Load registrations for admin
async function loadRegistrations(eventId) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}/registrations?role=${role}`);
    const data = await response.json();
    const registrationsList = document.getElementById("registrations-list");

    if (data.registrations.length === 0) {
      registrationsList.innerHTML = "<p>No registrations yet.</p>";
    } else {
      let html = `<p><b>Total Registrations: ${data.count}</b></p><ul>`;
      data.registrations.forEach((reg) => {
        const date = new Date(reg.registered_at).toLocaleDateString();
        html += `<li>${reg.student_id} - Registered on ${date}</li>`;
      });
      html += "</ul>";
      registrationsList.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading registrations:", error);
    document.getElementById("registrations-list").innerHTML = "<p>Error loading registrations.</p>";
  }
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
