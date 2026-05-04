let token = localStorage.getItem("token");
let user = null;

if (!token) {
    setAuthLinks(false);
    redirectToLogin();
} else {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    getUser().then(user => {
        if (!user) {
            redirectToLogin();
        }

        setAuthLinks(true);
    }).catch(err => {
        console.error("Error fetching user:", err);
        redirectToLogin();
    });
}

function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login.html";
}

function redirectToLogin() {
    if (window.location.pathname === "/login.html" || window.location.pathname === "/register.html") {
        return;
    }

    localStorage.removeItem("token");
    // adding redirect
    window.location.href = "/login.html?redirect=" + encodeURIComponent(window.location.pathname);
}

function setAuthLinks(isAuthed) {
    const unauthedLinks = document.querySelector("#unauthed-links");
    const authedLinks = document.querySelector("#authed-links");

    if (unauthedLinks) unauthedLinks.hidden = isAuthed;
    if (authedLinks) authedLinks.hidden = !isAuthed;
}

async function fetchUser() {
    return await axios.get("/api/auth/me");
}

async function getUser() {
    if (user) return Promise.resolve(user);

    try {
        user = await fetchUser();
    } catch (err) {
        console.error("Error fetching user:", err);
        alert("Session expired. Please log in again: " + err);
        return null;
    }

    return user;

}

window.document.querySelector("#logout-link")?.addEventListener("click", function (event) {
    event.preventDefault();
    logout();
});
