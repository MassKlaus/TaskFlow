import Task from "../db/task.js";

export const createTask = async (title, priority, status, project, assignee, deadline) => {
    const task = new Task({ title, priority, status, project, assignee, deadline });
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

export const updateTask = async (taskId, title, priority, status, project, assignee, deadline) => {
    const data = { title, priority, status, project, assignee, deadline, updatedAt: Date.now() };
    Object.keys(data).forEach(key => data[key] === undefined && delete data[key]);
    return Task.findOneAndUpdate({ _id: taskId, project: project }, data, { new: true, runValidators: true, context: "query" }).populate("assignee", "fullName email");
};

export const deleteTask = async (taskId, projectId) => {
    return Task.findOneAndDelete({ _id: taskId, project: projectId });
};

// Task 6 ---
export const getFilteredTasks = async (req, res) => {
  try {
    const projectId = req.params.projectId;

    const {
      page = 1,
      limit = 10,
      status,
      priority,
      assignee,
      search,
    } = req.query;

    let filter = { project: projectId };

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignee) filter.assignee = assignee;

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const pageNum = Number(page);
    const limitNum = Number(limit)
    const skip = (pageNum - 1) * limitNum;

    const data = await Task.find(filter)
      .populate("assignee", "fullName email")
      .skip(skip)
      .limit(Number(limit));

    const total = await Task.countDocuments(filter);

    res.json({
      data,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};