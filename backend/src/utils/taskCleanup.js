import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { deleteFromCloduinary } from "./deleteFromCloudinary.js";


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
        if (task.document?.publicId) {
            await deleteFromCloduinary(task.document.publicId)
        }
        const user = await User.findById(creatorId);
        user.taskCount = Math.max(0, user.taskCount - 1)
        await user.save({ validateBeforeSave: false })
    }
}

export { cleanupCompletedTask }