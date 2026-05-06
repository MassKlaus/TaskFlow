import Task from "../db/task.js";

export const createTask = async (title, priority, status, project) => {
    const task = new Task({ title, priority, status, project });
    await task.save();
    return task;
};

export const getTasksByProject = async (projectId) => {
    return Task.find({ project: projectId });
};

export const updateTaskStatus = async (taskId, status) => {
    return Task.findByIdAndUpdate(
        taskId,
        { status, updatedAt: Date.now() },
        { new: true, runValidators: true, context: "query" }
    );
};

export const updateTask = async (taskId, title, priority, status, project) => {
    const data = { title, priority, status, project, updatedAt: Date.now() };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    return Task.findByIdAndUpdate(taskId, data, { new: true, runValidators: true, context: "query" });
};

export const deleteTask = async (taskId) => {
    return Task.findByIdAndDelete(taskId);
};