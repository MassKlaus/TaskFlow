import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getUserNotifications, markAsRead, getUnreadCount } from "../services/notification.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
    try {
        const notifications = await getUserNotifications(req.user.userId);
        const unreadCount = await getUnreadCount(req.user.userId);
        res.json({ notifications, unreadCount });
    } catch (err) {
        console.error("Error fetching notifications:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await markAsRead(req.params.id, req.user.userId);
        if (!notification) {
            return res.status(404).json({ error: "Notification not found" });
        }
        res.json(notification);
    } catch (err) {
        if (err.name === "CastError") {
            return res.status(400).json({ error: "Invalid notification ID" });
        }
        console.error("Error marking notification as read:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

export default router;
