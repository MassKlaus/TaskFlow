import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
    action: {
        type: String,
        enum: [
            "task_created",
            "task_deleted",
            "task_status_changed",
            "task_updated",
            "member_added",
            "member_removed",
            "project_updated"
        ],
        required: true
    },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    details: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Activity", activitySchema);
