const $id = (id) => document.getElementById(id);
const API_URL = "http://localhost:3000/api/dashboard";

async function fetchDashboard() {
  const response = await axios.get(API_URL);
  return response.data;
}

function updateStats(data) {
  $id("projects").innerText = `Active Projects: ${data.activeProjects}`;
  $id("assigned").innerText = `Assigned Tasks: ${data.assignedTasks}`;
  $id("completed").innerText = `Completed Tasks: ${data.completedTasks}`;
  $id("overdue").innerText = `Overdue Tasks: ${data.overdueTasks}`;
}

function renderTasks(tasks) {
  if (!tasks || tasks.length === 0) {
    tasksDiv.innerHTML = "<p>No tasks found</p>";
    return;
  }
  
  const tasksDiv = $id("tasks");
  tasksDiv.innerHTML = "";

  tasks.forEach((task) => {
    const taskCard = document.createElement("div");
    taskCard.className = "task-card";

    taskCard.innerHTML = `
          <h3>${task.title}</h3>
          <p><strong>Priority:</strong> ${task.priority}</p>
          <p><strong>Status:</strong> ${task.status}</p>
          <p><strong>Project:</strong> ${task.project?.title || "N/A"}</p>
        `;

    tasksDiv.appendChild(taskCard);
  });
}

async function loadDashboard() {
  try {
    $id("projects").innerText = "Loading...";
    const data = await fetchDashboard();
    updateStats(data);
    renderTasks(data.currentTasks);
  } catch (error) {
    console.error("Dashboard error:", error);
  }
}

loadDashboard();
