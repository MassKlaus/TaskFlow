import Notification from "../db/notification.js";

export const createNotification = async (recipientId, type, message, projectId, taskId) => {
    const notification = new Notification({
        recipient: recipientId,
        type,
        message,
        project: projectId,
        task: taskId || undefined
    });
    return notification.save();
};

export const getUserNotifications = async (userId) => {
    return Notification.find({ recipient: userId })
        .populate("project", "title")
        .populate("task", "title")
        .sort({ createdAt: -1 });
};

export const markAsRead = async (notificationId, userId) => {
    return Notification.findOneAndUpdate(
        { _id: notificationId, recipient: userId },
        { read: true },
        { new: true }
    );
};

export const getUnreadCount = async (userId) => {
    return Notification.countDocuments({ recipient: userId, read: false });
};
