// Needs Project/Task models from task 2&3
import Project from "../db/project.js"
import Task from "../db/task.js"

export const getDashboard = async (req, res) => {
  try {
    // ACTIVE PROJECTS
    const activeProjects = await Project.countDocuments({
      owner: req.user.userId || req.user._id,
      status: "active",
    });

    // TASK STATS USING AGGREGATION
    const stats = await Task.aggregate([
      {
        $match: {
          assignee: req.user.userId,
        },
      },
      {
        $group: {
          _id: "$status",
          total: {
            $sum: 1,
          },
        },
      },
    ]);

    let assignedTasks = 0;
    let completedTasks = 0;

    stats.forEach((item) => {
      assignedTasks += item.total;

      if (item._id === "done") {
        completedTasks = item.total;
      }
    });

    // OVERDUE TASKS
    const overdueTasks = await Task.countDocuments({
      assignee: req.user.userId,
      deadline: {
        $lt: new Date(),
      },
      status: {
        $ne: "done",
      },
    });

    // CURRENT TASKS
    const currentTasks = await Task.find({
      assignee: req.user.userId,
      status: "in progress",
    })
      .populate("project", "title")
      .sort({
        priority: -1,
        deadline: 1,
      });

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
