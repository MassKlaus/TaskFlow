import mongoose from "mongoose";
import Project from "../db/project.js"
import Task from "../db/task.js"

export const getDashboard = async (req, res) => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user.userId);

    const [activeResult] = await Project.aggregate([
      { $match: { owner: userId, status: "active" } },
      { $count: "total" },
    ]);
    const activeProjects = activeResult?.total ?? 0;

    const taskStats = await Task.aggregate([
      { $match: { assignee: userId } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    let assignedTasks = 0;
    let completedTasks = 0;
    taskStats.forEach(({ _id, count }) => {
      assignedTasks += count;
      if (_id === "done") completedTasks = count;
    });

    const [overdueResult] = await Task.aggregate([
      { $match: { assignee: userId, deadline: { $lt: new Date() }, status: { $ne: "done" } } },
      { $count: "total" },
    ]);
    const overdueTasks = overdueResult?.total ?? 0;

    const currentTasks = await Task.find({
      assignee: req.user.userId,
      status: "in progress",
    })
      .populate("project", "title")
      .sort({ priority: -1, deadline: 1 });

    res.status(200).json({
      activeProjects,
      assignedTasks,
      completedTasks,
      overdueTasks,
      currentTasks,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
