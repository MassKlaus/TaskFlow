import projectSchema from "../db/project.js";


export async function createProject(title, description, ownerId, deadline) {
    const newProject = new projectSchema({ title, description, owner: ownerId, deadline });
    return await newProject.save();
}

export async function updateProject(projectId, title, description, deadline, status) {
    const existingProject = await projectSchema.findById(projectId);

    if (!existingProject) {
        throw new Error("Project not found");
    }
    
    existingProject.title = title || existingProject.title;
    existingProject.description = description || existingProject.description;
    existingProject.deadline = deadline || existingProject.deadline;
    existingProject.status = status || existingProject.status;
    existingProject.updatedAt = Date.now();


    return await existingProject.save();
}

export async function getProjectsByOwner(ownerId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return await projectSchema.find({ owner: ownerId })
        .skip(skip)
        .limit(limit);
}

export async function getProjectById(projectId) {
    return await projectSchema.findById(projectId);
}

export async function deleteProject(projectId) {
    return await projectSchema.findByIdAndDelete(projectId);
    // later i should add a check to ensure only the owner can delete the project
    // also i should delete all associated tasks when a project is deleted
}
