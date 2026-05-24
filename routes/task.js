import express from "express";
import {
  createTask, getTasksByProject, updateTaskStatus, updateTask, deleteTask,
  getFilteredTasks
} from "../services/task.js";
import { verifyProjectOwnership } from "../middleware/ownerMiddleware.js";
import { verifyProjectMember } from "../middleware/memberMiddleware.js";
import { verifyTaskAssignee } from "../middleware/assigneeMiddleware.js";
import { logActivity } from "../services/activity.js";
import { createNotification } from "../services/notification.js";
import { getProjectById } from "../services/project.js";

const router = express.Router({ mergeParams: true });
// member and owner
router.use(verifyProjectMember)

router.get("/", async (req, res) => {
    try {
        const tasks = await getTasksByProject(req.params.projectId);
        res.json(tasks);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid project ID" });
        }
        console.error("Error fetching tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get("/filter", getFilteredTasks);

router.patch("/:id/status", verifyTaskAssignee, async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !["to do", "in progress", "done"].includes(status)) {
            return res.status(400).json({ error: "Invalid or missing status" });
        }
        
        const project = req.params.projectId;
        const task = await updateTaskStatus(req.params.id, project, status);
        if (!task) return res.status(404).json({ error: "Task not found in this project" });
        await logActivity("task_status_changed", project, req.user.userId, {
            taskId: task._id, taskTitle: task.title, oldStatus: task.status, newStatus: status
        });

        if (task.assignee && task.assignee._id.toString() !== req.user.userId) {
            const projectData = await getProjectById(project);
            const message = `Task "${task.title}" status changed to "${status}" in project "${projectData.title}"`;
            await createNotification(task.assignee._id, "task_status_changed", message, project, task._id);
        }

        res.json(task);
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error updating task status:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// owner only
router.use(verifyProjectOwnership)

router.post("/", async (req, res) => {
    try {
        const { title, priority, status, assignee } = req.body;
        const project = req.params.projectId;
        const task = await createTask(title, priority, status, project, assignee);
        await logActivity("task_created", project, req.user.userId, { taskId: task._id, taskTitle: title });

        if (assignee) {
            const projectData = await getProjectById(project);
            const message = `You have been assigned to task "${title}" in project "${projectData.title}"`;
            await createNotification(assignee, "task_assigned", message, project, task._id);
        }

        res.status(201).json(task);
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ error: err.message });
        }  
        console.error("Error creating task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});




router.patch("/:id", async (req, res) => {
    try {
        const { title, priority, status, assignee, deadline } = req.body;
        const project = req.params.projectId;
        const oldTask = await getTasksByProject(project).then(tasks => tasks.find(t => t._id.toString() === req.params.id));
        const task = await updateTask(req.params.id, title, priority, status, project, assignee, deadline);
        if (!task) return res.status(404).json({ error: "Task not found in this project" });

        if (assignee && (!oldTask || !oldTask.assignee || oldTask.assignee._id.toString() !== assignee)) {
            const projectData = await getProjectById(project);
            const message = `You have been assigned to task "${task.title}" in project "${projectData.title}"`;
            await createNotification(assignee, "task_assigned", message, project, task._id);
        }

        res.json(task);
    } catch (err) {
        if (err.name === "ValidationError" || err.name === "CastError") {
            return res.status(400).json({ error: err.message });
        }
        console.error("Error updating task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});


// functionality  6 ---
// ---
router.delete("/:id", async (req, res) => {
    try {
        const project = req.params.projectId;
        const task = await deleteTask(req.params.id, project);
        if (!task) return res.status(404).json({ error: "Task not found in this project" });
        await logActivity("task_deleted", project, req.user.userId, { taskId: req.params.id, taskTitle: task.title });
        res.json({ message: "Task deleted" });
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid task ID" });
        }
        console.error("Error deleting task:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;