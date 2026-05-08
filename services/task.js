import Task from "../db/task.js";

export const createTask = async (title, priority, status, project, assignee) => {
    const task = new Task({ title, priority, status, project, assignee });
    await task.save();
    return task.populate("assignee", "fullName email");
};

export const getTasksByProject = async (projectId) => {
    return Task.find({ project: projectId }).populate("assignee", "fullName email");
};

export const getTasksByUser = async (userId) => {
    return Task.find({ assignee: userId }).populate("project", "title");
};

export const updateTaskStatus = async (taskId, projectId, status) => {
    return Task.findOneAndUpdate(
        { _id: taskId, project: projectId },
        { status, updatedAt: Date.now() },
        { new: true, runValidators: true, context: "query" }
    ).populate("assignee", "fullName email");
};

export const updateTask = async (taskId, title, priority, status, project, assignee) => {
    const data = { title, priority, status, project, assignee, updatedAt: Date.now() };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    return Task.findOneAndUpdate({ _id: taskId, project: project }, data, { new: true, runValidators: true, context: "query" }).populate("assignee", "fullName email");
};

export const deleteTask = async (taskId, projectId) => {
    return Task.findOneAndDelete({ _id: taskId, project: projectId });
};