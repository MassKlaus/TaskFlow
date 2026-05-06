import express from "express";
import { createProject, updateProject, getProjectsByOwner, getProjectById, deleteProject } from "../services/project.js";

const router = express.Router();

// GET all projects for the authenticated user
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        // req.user.userId is set by the JWT middleware in index.js
        const projects = await getProjectsByOwner(req.user.userId, page, limit);
        res.json({
            page,
            limit,
            data: projects
        });
    } catch (err) {
        console.error("Error fetching projects:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// POST to create a new project
router.post("/", async (req, res) => {
    const { title, description, deadline } = req.body;

    if (!title) {
        return res.status(400).json({ error: "Title is required" });
    }

    try {
        const project = await createProject(title, description, req.user.userId, deadline);
        res.status(201).json(project);
    } catch (err) {
        console.error("Error creating project:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// GET a specific project by ID
router.get("/:id", async (req, res) => {
    try {
        const project = await getProjectById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        // Ensure the project belongs to the authenticated user
        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden: You do not own this project" });
        }
        
        res.json(project);
    } catch (err) {
        console.error("Error fetching project:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// PUT to update a specific project by ID
router.put("/:id", async (req, res) => {
    const { title, description, deadline, status } = req.body;
    
    try {
        const project = await getProjectById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden: You do not own this project" });
        }
        
        const updatedProject = await updateProject(req.params.id, title, description, deadline, status);
        res.json(updatedProject);
    } catch (err) {
        if (err.message === "Project not found") {
            return res.status(404).json({ error: err.message });
        }
        console.error("Error updating project:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// DELETE a specific project by ID
router.delete("/:id", async (req, res) => {
    try {
        const project = await getProjectById(req.params.id);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden: You do not own this project" });
        }
        
        await deleteProject(req.params.id);
        res.status(204).send(); // Standard status for successful deletion with no content
    } catch (err) {
        console.error("Error deleting project:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;