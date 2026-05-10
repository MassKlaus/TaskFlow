import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { verifyProjectOwnership } from "../middleware/ownerMiddleware.js";
import { getUserByEmail } from "../services/user.js";
import { addMember } from "../services/project.js";

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

        res.json(updatedProject);
    } catch (err) {
        console.error("Error adding member:", err);

        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid project ID" });
        }

        res.status(500).json({ error: "Internal server error" });
    }
})

export default router;