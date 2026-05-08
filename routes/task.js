import express from "express";
import { createTask, getTasksByProject, updateTaskStatus, updateTask, deleteTask } from "../services/task.js";

const router = express.Router({ mergeParams: true });

router.post("/", async (req, res) => {
    try {
        const { title, priority, status, assignee } = req.body;
        const project = req.params.projectId; // get projectId from url param
        const task = await createTask(title, priority, status, project, assignee);
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.get("/", async (req, res) => {
    try {
        const tasks = await getTasksByProject(req.params.projectId);
        res.json(tasks);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.patch("/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const task = await updateTaskStatus(req.params.id, status);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const { title, priority, status, assignee } = req.body;
        const project = req.params.projectId;
        const task = await updateTask(req.params.id, title, priority, status, project, assignee);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});


router.delete("/:id", async (req, res) => {
    try {
        const task = await deleteTask(req.params.id);
        if (!task) return res.status(404).json({ error: "Task not found" });
        res.json({ message: "Task deleted" });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

export default router;