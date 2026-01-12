import { Task } from "../models/task.model.js";


const cleanupCompletedTask = async (taskId, creatorId) => {
    if (!taskId || !creatorId) return;

    const task = await Task.findOne({
        _id: taskId,
        creator: creatorId
    });

    if (!task) return;

    const allCompleted = task.revisions.every(
        (rev) => rev.completedAt !== null
    );

    if (allCompleted) {
        await Task.findByIdAndDelete(task._id);
    }
}

export { cleanupCompletedTask }