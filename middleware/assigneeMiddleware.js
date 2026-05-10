import Task from "../db/task.js";
import { getProjectById } from "../services/project.js";

export const verifyTaskAssignee = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({ error: "Task not found" });
        }

        const project = await getProjectById(req.params.projectId);
        const isOwner = project.owner.toString() === req.user.userId;
        const isAssignee = task.assignee && task.assignee.toString() === req.user.userId;

        if (!isOwner && !isAssignee) {
            return res.status(403).json({ error: "Forbidden: Only the task assignee or project owner can change the status" });
        }

        next();
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid task or project ID" });
        }
        console.error("Error verifying task assignee:", err);
        res.status(500).json({ error: "Internal server error" });
    }
};
