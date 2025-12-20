async function loadNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  const path = window.location.pathname.includes("/pages/")
    ? "../components/navbar.html"
    : "components/navbar.html";

  const res = await fetch(path);
  navbar.innerHTML = await res.text();

  updateNavbarUI();
}

function updateNavbarUI() {
  const role = localStorage.getItem("role");
  const userArea = document.getElementById("user-area");
  if (!userArea) return;

  if (role) {
    userArea.innerHTML = `
      <span class="fw-bold me-3">Hi ${role}</span>
      <button class="btn btn-sm btn-danger" onclick="logout()">Logout</button>
    `;
  } else {
    userArea.innerHTML = `
      <a href="pages/role.html" class="btn btn-sm btn-outline-primary">Login</a>
    `;
  }
}

function logout() {
  localStorage.clear();
  sessionStorage.clear();
  location.href = "/frontend/index.html";
}

document.addEventListener("DOMContentLoaded", loadNavbar);

