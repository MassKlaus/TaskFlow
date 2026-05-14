import Activity from "../db/activity.js";

export const logActivity = async (action, projectId, userId, details = {}) => {
    const activity = new Activity({ action, project: projectId, user: userId, details });
    return activity.save();
};

export const getActivitiesByProject = async (projectId) => {
    return Activity.find({ project: projectId })
        .populate("user", "fullName email")
        .sort({ createdAt: -1 });
};
