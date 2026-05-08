import { Activity } from "../models/Activity.js";
import { Notification } from "../models/Notification.js";

export async function logActivity(projectId, userId, action, details = "") {
  try {
    await Activity.create({ project: projectId, user: userId, action, details });
  } catch (err) {
    console.error("Failed to log activity:", err);
  }
}

export async function createNotification(userId, message, link = "") {
  try {
    await Notification.create({ user: userId, message, link });
  } catch (err) {
    console.error("Failed to create notification:", err);
  }
}
