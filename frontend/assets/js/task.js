document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("taskForm");
  if (!form) return;

  let projectId = "";

  // LOCK PROJECT ID ONCE USER ENTERS IT
  form.project.addEventListener("change", () => {
    projectId = form.project.value.trim();
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

  // AUTO SAVE
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

  // RESTORE BUTTON
  const btn = document.createElement("button");
  btn.type = "button";
  btn.textContent = "Restore Draft";

  btn.addEventListener("click", () => {
    const key = getKey();

    if (!key) {
      alert("Enter project ID first");
      return;
    }

    const saved = localStorage.getItem(key);

    if (!saved) {
      alert("No draft found");
      return;
    }

    const data = JSON.parse(saved);

    form.title.value = data.title || "";
    form.priority.value = data.priority || "medium";
    form.status.value = data.status || "to do";
    form.assignee.value = data.assignee || "";
  });

  form.appendChild(btn);

  // SUBMIT
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const key = getKey();

    if (!key) {
      alert("Enter project ID first");
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
      alert("Error");
    }
  });
});
