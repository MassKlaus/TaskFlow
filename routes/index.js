import express from "express";
import jwt from "jsonwebtoken";
import { checkUserPasswordByEmail, createUser, getUserByEmail } from "../services/user.js";
import { getTasksByUser } from "../services/task.js";
import { protect } from "../middleware/authMiddleware.js";
import authRouter from "./auth.js"
import dashboardRoutes from "./dashboard.js"
import projectRoutes from "./project.js"

const router = express.Router();

router.use("/auth", authRouter)
server.use("/dashboard", dashboardRoutes);
server.use("/projects", projectRoutes)

// this is a bit messy but i will leave this in here for now. we can restructure this later to be cleaner
router.get("/my-tasks", protect, async (req, res) => {
    try {
        const tasks = await getTasksByUser(req.user.userId);
        res.json(tasks);
    } catch (err) {
        console.error("Error fetching user tasks:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// router.use("/projects", projectRoutes);

export default router;