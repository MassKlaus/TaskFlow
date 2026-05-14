let currentPage = 1;

document.getElementById("project-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
        await axios.post("/api/projects", data);
        e.target.reset();
        loadProjects();
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
    }
});

document.getElementById("prev-page").addEventListener("click", () => {
    if (currentPage > 1) { currentPage--; loadProjects(); }
});

document.getElementById("next-page").addEventListener("click", () => {
    currentPage++;
    loadProjects();
});

async function loadProjects() {
    const container = document.getElementById("projects-container");
    const pageInfo = document.getElementById("page-info");
    try {
        const { data } = await axios.get("/api/projects", { params: { page: currentPage, limit: 10 } });
        pageInfo.textContent = `Page ${data.page}`;
        container.innerHTML = data.data.map(p => `
            <div style="border:1px solid #ccc; margin:8px; padding:8px;">
                <strong>${p.title}</strong> — ${p.status}
                <br><a href="/project-detail.html?id=${p._id}">View / Manage</a>
                <br><small>${p.description || "No description"}</small>
            </div>
        `).join("");
    } catch (err) {
        container.innerHTML = "<p>Error loading projects</p>";
    }
}

loadProjects();
