import express from "express";
import {
  createTask, getTasksByProject, updateTaskStatus, updateTask, deleteTask,
  getFilteredTasks
} from "../services/task.js";
import { verifyProjectOwnership } from "../middleware/ownerMiddleware.js";
import { verifyProjectMember } from "../middleware/memberMiddleware.js";

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

// only owner or members may access this
router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status || !["to do", "in progress", "done"].includes(status)) {
            return res.status(400).json({ error: "Invalid or missing status" });
        }
        
        const project = req.params.projectId;
        const task = await updateTaskStatus(req.params.id, project, status);
        if (!task) return res.status(404).json({ error: "Task not found in this project" });
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
        const project = req.params.projectId; // get projectId from url param
        const task = await createTask(title, priority, status, project, assignee);
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
        const { title, priority, status, assignee } = req.body;
        const project = req.params.projectId;
        const task = await updateTask(req.params.id, title, priority, status, project, assignee);
        if (!task) return res.status(404).json({ error: "Task not found in this project" });
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