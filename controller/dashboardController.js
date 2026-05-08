// Needs Project/Task models from task 2&3
import Project from "../models/Project"
import Task from "../models/Task"

export const getDashboard = async (req, res) => {
  try {
    // ACTIVE PROJECTS
    const activeProjects = await Project.countDocuments({
      owner: req.user.id,
      status: "actif",
    });

    // TASK STATS USING AGGREGATION
    const stats = await Task.aggregate([
      {
        $match: {
          assignedTo: req.user._id,
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

      if (item._id === "terminé") {
        completedTasks = item.total;
      }
    });

    // OVERDUE TASKS
    const overdueTasks = await Task.countDocuments({
      assignedTo: req.user.id,
      deadline: {
        $lt: new Date(),
      },
      status: {
        $ne: "terminé",
      },
    });

    // CURRENT TASKS
    const currentTasks = await Task.find({
      assignedTo: req.user.id,
      status: "en cours",
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
