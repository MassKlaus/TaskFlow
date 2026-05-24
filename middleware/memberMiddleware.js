import { getProjectById } from "../services/project.js";

export const verifyProjectMember = async (req, res, next) => {
    try {
        const project = await getProjectById(req.params.projectId);

        if (!project) {
            return res.status(404).json({ error: "Project not found" });
        }

        const isOwner = project.owner.toString() === req.user.userId;
        const isMember = project.members.some(m => m.toString() === req.user.userId);

        if (!isOwner && !isMember) {
            return res.status(403).json({ error: "Forbidden: You are not a member of this project" });
        }

        next();
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid project ID" });
        }
        console.error("Error verifying project membership:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
