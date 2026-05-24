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
            <div style="background:#f9fafb; border:1px solid #e2e8f0; border-radius:8px; padding:16px; margin-bottom:12px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <strong style="font-size:1.1rem;">${p.title}</strong>
                    <span style="font-size:0.8rem; padding:2px 8px; border-radius:4px; background:${p.status === "active" ? "#dbeafe" : p.status === "paused" ? "#fef3c7" : "#e5e7eb"}; color:${p.status === "active" ? "#1e40af" : p.status === "paused" ? "#92400e" : "#4b5563"};">${p.status}</span>
                </div>
                <p style="margin:8px 0 0; color:#6b7280; font-size:0.9rem;">${p.description || "No description"}</p>
                <a href="/project-detail.html?id=${p._id}" style="display:inline-block; margin-top:10px; font-size:0.9rem;">View / Manage &rarr;</a>
            </div>
        `).join("");
    } catch (err) {
        container.innerHTML = "<p>Error loading projects</p>";
    }
}

loadProjects();
