import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, default: "" },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    deadline: { type: Date, default: null },
    status: { type: String, enum: ["active", "paused", "archived"], default: "active" },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

projectSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

projectSchema.pre(['findOneAndUpdate', 'updateOne', 'updateMany'], function(next) {
    const now = Date.now();
    const update = this.getUpdate() || {};
    const hasOperators = Object.keys(update).some((key) => key.startsWith('$'));

    if (hasOperators) {
        this.setUpdate({
            ...update,
            $set: {
                ...(update.$set || {}),
                updatedAt: now,
            },
        });
    } else {
        this.setUpdate({
            ...update,
            updatedAt: now,
        });
    }

    next();
});

projectSchema.pre('deleteOne', async function(next) {
    try {
        const Task = mongoose.model('Task');
        await Task.deleteMany({ project: this._id });
        next();
    } catch (error) {
        next(error);
    }
});

export default mongoose.model("Project", projectSchema);