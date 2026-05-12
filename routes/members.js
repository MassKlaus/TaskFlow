import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyProjectOwnership } from "../middleware/ownerMiddleware.js";
import { getUserByEmail } from "../services/user.js";
import { addMember, removeMember } from "../services/project.js";

const router = express.Router();

router.use(verifyProjectOwnership);

router.post("/", async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }

        const user = await getUserByEmail(email);

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        const updatedProject = await addMember(req.params.projectId, user._id);

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json(updatedProject);
    } catch (err) {
        console.error("Error adding member:", err);

        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid project ID" });
        }

        res.status(500).json({ error: "Internal server error" });
    }
})

router.delete("/:userId", async (req, res) => {
    try {
        const project = await getProjectById(req.params.projectId);
        
        if (req.params.userId === project.owner.toString()) {
            return res.status(400).json({ error: "Cannot remove the project owner" });
        }

        const updatedProject = await removeMember(req.params.projectId, req.params.userId);

        if (!updatedProject) {
            return res.status(404).json({ error: "Project not found" });
        }

        res.json(updatedProject);
    } catch (err) {
        console.error("Error removing member:", err);

        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid project ID or user ID" });
        }

        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;