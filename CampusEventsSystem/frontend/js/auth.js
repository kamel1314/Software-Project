const API_BASE_URL = "http://localhost:3001/api";

// =======================
// SIGN UP
// =======================
async function signup() {
  const name = document.getElementById("su-name").value.trim();
  const password = document.getElementById("su-password").value.trim();
  const role = document.getElementById("su-role").value;

  if (!name || !password) {
    alert("Please fill all fields");
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password, role })
    });

    if (res.ok) {
      alert("✅ Account created successfully");
      window.location.href = "../index.html";
    } else {
      const data = await res.json();
      alert(data.error || "Signup failed");
    }
  } catch (err) {
    console.error(err);
    alert("Server error");
  }
}
