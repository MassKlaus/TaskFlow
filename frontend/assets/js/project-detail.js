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
        <p><strong>Owner:</strong> ${data.owner}</p>
    `;

    const membersList = document.getElementById("members-list");
    const ownerLi = document.createElement("li");
    ownerLi.textContent = `👑 ${data.owner} (owner)`;
    membersList.innerHTML = "";
    membersList.appendChild(ownerLi);

    data.members?.forEach(id => {
        const li = document.createElement("li");
        li.textContent = `${id} `;
        const btn = document.createElement("button");
        btn.textContent = "Remove";
        btn.onclick = async () => {
            try {
                await axios.delete(`/api/projects/${projectId}/members/${id}`);
                loadProject();
            } catch (err) {
                alert("Error: " + (err.response?.data?.error || err.message));
            }
        };
        li.appendChild(btn);
        membersList.appendChild(li);
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
    try {
        const { data } = await axios.get(`/api/projects/${projectId}/tasks/filter`, { params: filterData });
        container.innerHTML = (data.data || data).map(t => `
            <div style="border:1px solid #ccc; margin:8px; padding:8px;">
                <strong>${t.title}</strong>
                <br>Status: ${t.status} | Priority: ${t.priority}
                <br>Assignee: ${t.assignee?.fullName || t.assignee || "Unassigned"}
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

loadProject();
loadTasks();
