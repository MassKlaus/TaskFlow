const projectId = new URLSearchParams(location.search).get("id");

if (!projectId) {
    document.body.innerHTML = "<h1>Missing project ID</h1>";
}

async function loadProject() {
    const { data } = await axios.get(`/api/projects/${projectId}`);
    document.getElementById("project-title").textContent = data.title;
    document.getElementById("project-info").innerHTML = `
        <p><strong>Status:</strong> ${data.status}</p>
        <p><strong>Description:</strong> ${data.description || "N/A"}</p>
        <p><strong>Deadline:</strong> ${data.deadline ? new Date(data.deadline).toLocaleDateString() : "N/A"}</p>
        <p><strong>Owner:</strong> ${data.owner?.fullName || data.owner?.email || data.owner}</p>
    `;

    const membersList = document.getElementById("members-list");
    const ownerLi = document.createElement("li");
    ownerLi.textContent = `👑 ${data.owner?.fullName || data.owner?.email || data.owner} (owner)`;
    membersList.innerHTML = "";
    membersList.appendChild(ownerLi);

    data.members?.forEach(m => {
        const li = document.createElement("li");
        li.textContent = `${m.fullName || m.email || m._id} (${m.email || m._id}) `;
        li.setAttribute("data-id", m._id);
        const btn = document.createElement("button");
        btn.textContent = "Remove";
        btn.onclick = async () => {
            try {
                await axios.delete(`/api/projects/${projectId}/members/${m._id}`);
                loadProject();
            } catch (err) {
                alert("Error: " + (err.response?.data?.error || err.message));
            }
        };
        li.appendChild(btn);
        membersList.appendChild(li);
    });

    populateAssigneeSelects(data);
}

function populateAssigneeSelects(project) {
    const users = [project.owner, ...(project.members || [])].filter(Boolean);
    const options = users.map(u =>
        `<option value="${u._id}">${u.fullName || u.email}</option>`
    ).join("");
    document.querySelectorAll("#create-task-form [name=assignee], #filter-form [name=assignee]").forEach(sel => {
        const defaultVal = sel.options[0].value;
        sel.innerHTML = `<option value="${defaultVal}">${defaultVal === "" ? "Unassigned" : "All"}</option>` + options;
    });
}

document.getElementById("add-member-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    try {
        await axios.post(`/api/projects/${projectId}/members`, { email });
        e.target.reset();
        loadProject();
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
    }
});

let filterData = {};

document.getElementById("filter-form").addEventListener("submit", (e) => {
    e.preventDefault();
    filterData = Object.fromEntries(new FormData(e.target));
    Object.keys(filterData).forEach(k => { if (!filterData[k]) delete filterData[k]; });
    loadTasks();
});

document.getElementById("filter-form").addEventListener("reset", () => {
    filterData = {};
    loadTasks();
});

document.getElementById("create-task-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.target));
    try {
        await axios.post(`/api/projects/${projectId}/tasks`, data);
        e.target.reset();
        loadTasks();
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
    }
});

async function loadTasks() {
    const container = document.getElementById("task-list");
    container.style.cssText = "";
    try {
        const { data } = await axios.get(`/api/projects/${projectId}/tasks/filter`, { params: filterData });
        container.innerHTML = (data.data || data).map(t => `
            <div style="background:#f9fafb; border:1px solid #e2e8f0; border-radius:8px; padding:12px; margin-bottom:8px; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                <strong style="font-size:1.05rem;">${t.title}</strong>
                <br>Status: ${t.status} | Priority: ${t.priority}
                <br>Assignee: ${t.assignee?.fullName || t.assignee?.email || "Unassigned"}
                <br>
                <button onclick="updateStatus('${t._id}','to do')">To Do</button>
                <button onclick="updateStatus('${t._id}','in progress')">In Progress</button>
                <button onclick="updateStatus('${t._id}','done')">Done</button>
                <button onclick="deleteTask('${t._id}')">Delete</button>
            </div>
        `).join("");
    } catch (err) {
        container.innerHTML = "<p>Error loading tasks</p>";
    }
}

async function updateStatus(taskId, status) {
    try {
        await axios.patch(`/api/projects/${projectId}/tasks/${taskId}/status`, { status });
        loadTasks();
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
    }
}

async function deleteTask(taskId) {
    try {
        await axios.delete(`/api/projects/${projectId}/tasks/${taskId}`);
        loadTasks();
    } catch (err) {
        alert("Error: " + (err.response?.data?.error || err.message));
    }
}

function describeActivity(a) {
    const name = a.user?.fullName || a.user?.email || "Someone";
    const d = a.details || {};
    const time = new Date(a.createdAt).toLocaleString();
    switch (a.action) {
        case "task_created":
            return `${name} created task "${d.taskTitle}" - ${time}`;
        case "task_deleted":
            return `${name} deleted task "${d.taskTitle}" - ${time}`;
        case "task_status_changed":
            return `${name} changed status of "${d.taskTitle}" to "${d.newStatus}" - ${time}`;
        case "member_added":
            return `${name} added member ${d.memberEmail || d.memberId} - ${time}`;
        case "member_removed":
            return `${name} removed a member - ${time}`;
        case "project_updated":
            return `${name} updated the project - ${time}`;
        default:
            return `${name} performed ${a.action} - ${time}`;
    }
}

async function loadActivities() {
    const container = document.getElementById("activity-list");
    try {
        const { data } = await axios.get(`/api/projects/${projectId}/activities`);
        container.innerHTML = data.map(a => `
            <div style="border-bottom:1px solid #ddd; padding:6px 0;">
                ${describeActivity(a)}
            </div>
        `).join("");
    } catch (err) {
        container.innerHTML = "<p>Could not load activity feed</p>";
    }
}

loadProject();
loadTasks();
loadActivities();
