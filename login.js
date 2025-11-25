const loginBtn = document.getElementById("show-login");
const signupBtn = document.getElementById("show-signup");
const loginForm = document.getElementById("login-form");
const signupForm = document.getElementById("signup-form");

loginBtn.addEventListener("click", () => {
  loginBtn.classList.add("active");
  signupBtn.classList.remove("active");
  loginForm.classList.add("active");
  signupForm.classList.remove("active");
});

signupBtn.addEventListener("click", () => {
  signupBtn.classList.add("active");
  loginBtn.classList.remove("active");
  signupForm.classList.add("active");
  loginForm.classList.remove("active");
});

function togglePassword(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

signupForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("signup-email").value.trim();
  const password = document.getElementById("signup-password").value;
  const confirmPassword = document.getElementById("confirm-password").value;

  if (password !== confirmPassword) {
    alert("Passwords do not match!");
    return;
  }

  const users = JSON.parse(localStorage.getItem("users")) || {};
  if (users[email]) {
    alert("User already exists. Please log in.");
    return;
  }

  users[email] = { name, password };
  localStorage.setItem("users", JSON.stringify(users));
  alert(`Welcome, ${name}! Your account has been created.`);
  signupForm.reset();
});

loginForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  const rememberMe = document.querySelector(
    ".remember-me input[type='checkbox']"
  ).checked;

  const users = JSON.parse(localStorage.getItem("users")) || {};

  if (!users[email]) {
    alert("User not found. Please sign up first.");
    return;
  } else if (users[email].password !== password) {
    alert("Incorrect password. Please try again.");
    return;
  }

  const authData = {
    email: email,
    name: users[email].name,
    isAuthenticated: true,
    timestamp: new Date().getTime(),
  };

  if (rememberMe) {
    localStorage.setItem("authState", JSON.stringify(authData));
  } else {
    sessionStorage.setItem("authState", JSON.stringify(authData));
  }

  window.location.href = "dashboard.html";
});
