import express from "express";
import { getActivitiesByProject } from "../services/activity.js";

const router = express.Router({ mergeParams: true });

router.get("/", async (req, res) => {
    try {
        const activities = await getActivitiesByProject(req.params.projectId);
        res.json(activities);
    } catch (err) {
        console.error("Error fetching activities:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
