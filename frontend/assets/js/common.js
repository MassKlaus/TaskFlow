axios.defaults.baseURL = "http://localhost:3000";

const token = localStorage.getItem("token");

// Redirect based on auth state
const publicPages = ["/login.html", "/register.html"];
const currentPath = window.location.pathname;

if (!token && !publicPages.includes(currentPath)) {
  window.location.href = "/login.html";
}

if (token && publicPages.includes(currentPath)) {
  window.location.href = "/index.html";
}

// Show/hide nav links based on auth status
const isAuthed = !!token;
document.querySelectorAll("#authed-links").forEach((el) => {
  el.style.display = isAuthed ? "" : "none";
});
document.querySelectorAll("#unauthed-links").forEach((el) => {
  el.style.display = isAuthed ? "none" : "";
});

// Attach token automatically to every request
axios.interceptors.request.use((config) => {
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

axios.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login.html";
    }
    return Promise.reject(err);
  }
);

document.getElementById("logout-link")?.addEventListener("click", (e) => {
  e.preventDefault();
  localStorage.removeItem("token");
  window.location.href = "/login.html";
});