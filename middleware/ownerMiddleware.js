import { getProjectById } from "../services/project.js";

// Middleware to verify project ownership before allowing access to related tasks
export const verifyProjectOwnership = async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.projectId);
        
        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }
        
        if (project.owner.toString() !== req.user.userId) {
            return res.status(403).json({ error: "Forbidden: You do not own this project" });
        }

        next();
    } catch (err) {
        console.error("Error verifying project ownership:", err);

        if (err && err.name === "CastError" && (err.path === "_id" || err.path === "projectId")) {
            return res.status(400).json({ error: "Invalid project ID" });
        }

        return res.status(500).json({ error: "Internal server error" });
    }
};