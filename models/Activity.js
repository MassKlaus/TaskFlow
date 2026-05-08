import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true }, // e.g., "created task", "changed status"
  details: { type: String }, // e.g., "Task 'Login' moved to 'en cours'"
}, { timestamps: true });

export const Activity = mongoose.model("Activity", activitySchema);
