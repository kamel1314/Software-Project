console.log("✅ Script connected!");

const API_URL = "http://localhost:3001/events";

// Helper: Get role from localStorage
function getRole() {
  return localStorage.getItem("role");
}

// Helper: get student info (prompt when missing). Uses sessionStorage so it is not permanent.
async function getStudentInfo() {
  let studentName = sessionStorage.getItem("studentName");
  let studentId = sessionStorage.getItem("studentId");

  if (!studentName) {
    studentName = prompt("Enter your full name:");
    if (!studentName) return null;
    studentName = studentName.trim();
    if (!studentName) return null;
  }

  if (!studentId) {
    studentId = prompt("Enter your 9-digit student ID:");
    if (!studentId) return null;
    studentId = studentId.trim();
    if (studentId.length !== 9 || isNaN(studentId)) {
      alert("Student ID must be exactly 9 digits.");
      return null;
    }
  }

  // cache for this session only
  sessionStorage.setItem("studentName", studentName);
  sessionStorage.setItem("studentId", studentId);
  return { studentName, studentId };
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

// Helper: Update event in backend
async function updateEvent(eventId, event) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}?role=${role}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });
    return response.ok;
  } catch (error) {
    console.error("Error updating event:", error);
    return false;
  }
}

// Helper: fetch capacity info
async function fetchCapacity(eventId) {
  const response = await fetch(API_URL + `/${eventId}/capacity`);
  if (!response.ok) return null;
  return await response.json();
}

// Helper: Register student for event
async function registerForEvent(eventId, studentId, studentName) {
  try {
    const role = getRole();
    const response = await fetch(API_URL + `/${eventId}/register?role=${role}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, studentName }),
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
      const capacityInput = form.querySelector("input[type='number']");
      const description = form.querySelector("textarea").value;

      if (!title || !date || !location || !description) {
        alert("⚠️ Please fill all fields before submitting!");
        return;
      }

      if (!isValidDateClient(date)) {
        alert("Invalid date. Use YYYY-MM-DD, real date, today or future.");
        return;
      }

      const capacity = capacityInput ? parseInt(capacityInput.value, 10) : NaN;
      if (!Number.isInteger(capacity) || capacity < 1) {
        alert("Capacity must be a positive integer.");
        return;
      }

      if (!isValidLengths(title, location, description)) return;

      const newEvent = { title, date, location, description, capacity };
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
  
    fetchEvents().then((events) => {
      const event = events.find(e => e.id == eventId);

      if (event) {
        let buttonHTML = "";

        if (role === "student") {
          const cachedId = sessionStorage.getItem("studentId");

          // render initial button state
          const renderStudentButtons = (isRegistered, idForButton, spotsLeft) => {
            if (isRegistered) {
              buttonHTML = `<button onclick="handleUnregister(${eventId}, '${idForButton}')">✅ Registered - Click to Unregister</button>`;
            } else {
              if (typeof spotsLeft === 'number' && spotsLeft <= 0) {
                buttonHTML = `<button disabled>Event is full</button>`;
              } else {
                buttonHTML = `<button onclick="handleRegister(${eventId})">📝 Register</button>`;
              }
            }
            updateEventDetails(event, buttonHTML);
          };

          fetchCapacity(eventId).then((capInfo) => {
            const spotsLeft = capInfo ? capInfo.spotsLeft : undefined;
            if (cachedId) {
              checkRegistration(eventId, cachedId).then((isRegistered) => {
                renderStudentButtons(isRegistered, cachedId, spotsLeft);
                renderCapacityInfo(capInfo);
              }).catch(() => {
                renderStudentButtons(false, cachedId, spotsLeft);
                renderCapacityInfo(capInfo);
              });
            } else {
              renderStudentButtons(false, "", spotsLeft);
              renderCapacityInfo(capInfo);
            }
          }).catch(() => {
            const localCapInfo = event.capacity ? { capacity: event.capacity, registered: undefined, spotsLeft: undefined } : null;
            if (cachedId) {
              checkRegistration(eventId, cachedId).then((isRegistered) => {
                renderStudentButtons(isRegistered, cachedId);
                renderCapacityInfo(localCapInfo);
              }).catch(() => {
                renderStudentButtons(false, cachedId);
                renderCapacityInfo(localCapInfo);
              });
            } else {
              renderStudentButtons(false, "");
              renderCapacityInfo(localCapInfo);
            }
          });
        } else if (role === "admin") {
          // 🗑️ Delete and Edit for Admins
          buttonHTML = `
            <button onclick="editEvent(${event.id})">✏️ Edit Event</button>
            <button onclick="deleteEvent(${event.id})">🗑️ Delete Event</button>
          `;
          updateEventDetails(event, buttonHTML);
          const localCapInfoAdmin = event.capacity ? { capacity: event.capacity, registered: undefined, spotsLeft: undefined } : null;
          renderCapacityInfo(localCapInfoAdmin);
          fetchCapacity(eventId).then((capInfo) => renderCapacityInfo(capInfo || localCapInfoAdmin)).catch(() => renderCapacityInfo(localCapInfoAdmin));
        }

        function updateEventDetails(event, buttonHTML) {
          let content = `
            <h2>${event.title}</h2>
            <p><b>Date:</b> ${event.date}</p>
            <p><b>Location:</b> ${event.location}</p>
            <p id="capacity-info"></p>
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

// Client date validation: format YYYY-MM-DD, real date, today or future
function isValidDateClient(dateStr) {
  if (!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(dateStr)) return false;
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const cmp = new Date(Date.UTC(y, m - 1, d));
  return cmp >= today;
}

function isValidLengths(title, location, description) {
  if (!title.trim() || !location.trim() || !description.trim()) {
    alert("All fields are required.");
    return false;
  }
  if (title.trim().length > 200) {
    alert("Title too long (max 200 chars).");
    return false;
  }
  if (location.trim().length > 200) {
    alert("Location too long (max 200 chars).");
    return false;
  }
  if (description.trim().length > 1000) {
    alert("Description too long (max 1000 chars).");
    return false;
  }
  return true;
}

// 🔗 Go to details page
function viewEvent(eventId) {
  window.location.href = `event.html?id=${eventId}`;
}

function renderCapacityInfo(capInfo) {
  const el = document.getElementById("capacity-info");
  if (!el) return;
  if (!capInfo || !capInfo.capacity) {
    el.innerText = "";
    return;
  }
  const registered = typeof capInfo.registered === 'number' ? capInfo.registered : '...';
  const spotsLeft = typeof capInfo.spotsLeft === 'number' ? capInfo.spotsLeft : '...';
  el.innerHTML = `<b>Capacity:</b> ${capInfo.capacity} | <b>Registered:</b> ${registered} | <b>Spots left:</b> ${spotsLeft}`;
}

// 📝 Register for event
async function handleRegister(eventId) {
  if (getRole() !== "student") {
    alert("Only students can register.");
    return;
  }

  const info = await getStudentInfo();
  if (!info) return; // user cancelled or invalid

  const success = await registerForEvent(eventId, info.studentId, info.studentName);
  if (success) {
    alert("✅ Registered successfully!");
    location.reload();
  } else {
    alert("❌ Failed to register. Please try again or check your internet connection.");
  }
}

// 📝 Unregister from event
async function handleUnregister(eventId, studentId) {
  const idToUse = studentId || sessionStorage.getItem("studentId");
  if (!idToUse) {
    alert("Student ID not found. Please register again to cache your ID.");
    return;
  }
  const confirmed = confirm("Are you sure you want to unregister?");
  if (confirmed) {
    const success = await unregisterFromEvent(eventId, idToUse);
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
        const name = reg.student_name ? `${reg.student_name} (${reg.student_id})` : reg.student_id;
        html += `<li>${name} - Registered on ${date}</li>`;
      });
      html += "</ul>";
      registrationsList.innerHTML = html;
    }
  } catch (error) {
    console.error("Error loading registrations:", error);
    document.getElementById("registrations-list").innerHTML = "<p>Error loading registrations.</p>";
  }
}

// ✏️ Edit an event
async function editEvent(eventId) {
  const events = await fetchEvents();
  const event = events.find(e => e.id == eventId);
  if (!event) {
    alert("Event not found.");
    return;
  }

  const newTitle = prompt("Edit Title:", event.title);
  if (newTitle === null) return;

  const newDate = prompt("Edit Date (YYYY-MM-DD):", event.date);
  if (newDate === null) return;

  if (!isValidDateClient(newDate.trim())) {
    alert("Invalid date. Use YYYY-MM-DD, real date, today or future.");
    return;
  }

  const newLocation = prompt("Edit Location:", event.location);
  if (newLocation === null) return;

  const newDescription = prompt("Edit Description:", event.description);
  if (newDescription === null) return;

  const newCapacityStr = prompt("Edit Capacity (number):", event.capacity || 100);
  if (newCapacityStr === null) return;
  const newCapacity = parseInt(newCapacityStr, 10);
  if (!Number.isInteger(newCapacity) || newCapacity < 1) {
    alert("Capacity must be a positive integer.");
    return;
  }

  if (!isValidLengths(newTitle, newLocation, newDescription)) return;

  const success = await updateEvent(eventId, {
    title: newTitle.trim(),
    date: newDate.trim(),
    location: newLocation.trim(),
    description: newDescription.trim(),
    capacity: newCapacity
  });

  if (success) {
    alert("✅ Event updated successfully!");
    location.reload();
  } else {
    alert("❌ Failed to update event. Make sure you're logged in as admin.");
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
