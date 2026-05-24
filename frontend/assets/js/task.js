document.addEventListener("DOMContentLoaded", async () => {
  const form = document.getElementById("taskForm");
  if (!form) return;

  let projectId = "";
  let projectCache = {};

  const projectSelect = form.project;
  const assigneeSelect = form.assignee;

  async function loadProjects() {
    const { data } = await axios.get("/api/projects");
    projectSelect.innerHTML = '<option value="">-- Select Project --</option>';
    data.data.forEach(p => {
      projectCache[p._id] = p;
      const opt = document.createElement("option");
      opt.value = p._id;
      opt.textContent = `${p.title}`;
      projectSelect.appendChild(opt);
    });
  }

  async function loadAssignees() {
    assigneeSelect.innerHTML = '<option value="">-- Unassigned --</option>';
    if (!projectId) return;
    try {
      const { data: project } = await axios.get(`/api/projects/${projectId}`);
      const opt = document.createElement("option");
      opt.value = project.owner;
      opt.textContent = `Owner (${project.owner})`;
      assigneeSelect.appendChild(opt);
      (project.members || []).forEach(m => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = `Member (${m})`;
        assigneeSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load project members", err);
    }
  }

  function restoreDraft() {
    const key = getKey();
    if (!key) return;
    const saved = localStorage.getItem(key);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      form.title.value = data.title || "";
      form.priority.value = data.priority || "medium";
      form.status.value = data.status || "to do";
      form.assignee.value = data.assignee || "";
    } catch (err) {
      console.error("Failed to restore draft", err);
    }
  }

  function discardDraft() {
    const key = getKey();
    if (!key) return;
    localStorage.removeItem(key);
  }

  function promptRestore() {
    const key = getKey();
    if (!key) return;
    const saved = localStorage.getItem(key);
    if (!saved) return;
    if (confirm("A draft was found for this project. Do you want to restore it?")) {
      restoreDraft();
    } else {
      discardDraft();
    }
  }

  projectSelect.addEventListener("change", () => {
    projectId = projectSelect.value;
    loadAssignees();
    promptRestore();
  });

  const getKey = () => {
    try {
      if (!projectId || projectId.trim() === "") {
        throw new Error("Project ID is missing");
      }
      return `task-draft-${projectId}`;
    } catch (error) {
      console.error(error.message);
      return null;
    }
  };

  form.addEventListener("input", () => {
    const key = getKey();
    if (!key) return;
    const data = {
      title: form.title.value,
      priority: form.priority.value,
      status: form.status.value,
      assignee: form.assignee.value,
    };
    localStorage.setItem(key, JSON.stringify(data));
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const key = getKey();
    if (!key) {
      alert("Select a project first");
      return;
    }
    const payload = {
      title: form.title.value,
      priority: form.priority.value,
      status: form.status.value,
    };
    if (form.assignee.value.trim()) {
      payload.assignee = form.assignee.value;
    }
    try {
      await axios.post(`/api/projects/${projectId}/tasks`, payload);
      localStorage.removeItem(key);
      form.reset();
      alert("Task created");
    } catch (err) {
      console.error(err);
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  });

  await loadProjects();
});
