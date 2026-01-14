import mongoose from "mongoose";
import { Task } from "../models/task.model.js";
import { APIError } from "../utils/APIError.js";
import { APIResponse } from "../utils/APIResponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { cleanupCompletedTask } from "../utils/taskCleanup.js";
import { User } from "../models/user.model.js";
import { uploadToCloudinary } from "../utils/cloudinary.js"


const createTask = asyncHandler(async (req, res) => {

    const creator = req.user?._id;
    const { heading, link, startDate, description } = req.body

    if (!heading) {
        throw new APIError(400, "heading required")
    }

    if (!creator) {
        throw new APIError(400, "User ID required")
    }

    if (!startDate) {
        throw new APIError(400, "Start date required")
    }

    // images/pdf uploads
    const documentLocalFilePath = req.file?.path;

    let uploadedDocument = null;

    if (documentLocalFilePath) {
        uploadedDocument = await uploadToCloudinary(documentLocalFilePath);
    }

    const user = await User.findById(creator);

    if (user.taskCount >= 500) {
        throw new APIError(403, user.taskCount, "Free plan limit reached")
    }

    const revisionGaps = [1, 3, 7, 14, 30, 60];
    const baseDate = new Date(startDate);
    // console.log("Base Date from Frontend:", startDate, "Parsed as:", baseDate);

    const revisions = revisionGaps.map((gap) => {
        // reset base
        const scheduledAt = new Date(baseDate);

        // calc schedule date
        scheduledAt.setDate(scheduledAt.getDate() + gap);

        // update revision obj
        // console.log(`Revision for gap ${gap}:`, scheduledAt);
        return {
            scheduledAt,
            completedAt: null
        }

    })

    const task = await Task.create({
        creator,
        heading,
        link,
        document: uploadedDocument ? { url: uploadedDocument.url, publicId: uploadedDocument.public_id } : null,
        description,
        revisions
    })

    user.taskCount = user.taskCount + 1;
    await user.save({ validateBeforeSave: false });

    res.status(200).json(
        new APIResponse(200, task, "task created successfully")
    )
})

const getTodaysRevision = asyncHandler(async (req, res) => {

    const creator = req.user?._id

    if (!creator) {
        throw new APIError(400, "Creator ID required")
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todaysRevisions = await Task.find({
        creator: creator,
        revisions: {
            $elemMatch: {
                scheduledAt: {
                    $gte: startOfDay,
                    $lte: endOfDay
                },
                completedAt: null
            }
        }
    });

    if (todaysRevisions.length === 0) {
        return res.status(200).json(
            new APIResponse(200, [], "No revision scheduled today")
        )
    }

    return res.status(200).json(
        new APIResponse(200, todaysRevisions, "Todays revisions fetched successfully")
    )
})

const completeRevision = asyncHandler(async (req, res) => {

    const creator = req.user?._id
    const { taskId } = req.body

    if (!creator) {
        throw new APIError(400, "user ID required")
    }

    if (!taskId) {
        throw new APIError(400, "Task ID required")
    }

    const startofDay = new Date()
    startofDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999)

    const updated = await Task.findOneAndUpdate({
        _id: taskId,
        creator: creator,
        revisions: {
            $elemMatch: {
                scheduledAt: {
                    $lte: endOfDay
                },
                completedAt: null
            }
        }
    },
        {
            $set: {
                "revisions.$.completedAt": new Date()
            }
        },
        {
            new: true
        }
    )

    if (!updated) {
        throw new APIError(401, updated, "revision not scheduled for today")
    }

    await cleanupCompletedTask(taskId, creator);

    return res.status(200).json(
        new APIResponse(200, updated, "Revison completed successfully")
    )
})

const getAllPendingRevision = asyncHandler(async (req, res) => {
    const creator = req.user?._id

    if (!creator) {
        throw new APIError(400, "Creator ID required")
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const pendingRevisions = await Task.find({
        creator: creator,
        revisions: {
            $elemMatch: {
                scheduledAt: {
                    $lte: startOfDay
                },
                completedAt: null
            }
        }
    });

    if (pendingRevisions.length === 0) {
        return res.status(200).json(
            new APIResponse(200, [], "No Pending revisions")
        )
    }

    return res.status(200).json(
        new APIResponse(200, pendingRevisions, "All pending revisions fetched successfully")
    )
})

const getAllUpcomingRevision = asyncHandler(async (req, res) => {
    const creator = req.user?._id

    if (!creator) {
        throw new APIError(400, "Creator ID required")
    }

    const endOfDay = new Date()
    endOfDay.setHours(23, 59, 59, 999);

    const pendingRevisions = await Task.find({
        creator: creator,
        revisions: {
            $elemMatch: {
                scheduledAt: {
                    $gte: endOfDay
                },
                completedAt: null
            }
        }
    });

    if (pendingRevisions.length === 0) {
        return res.status(200).json(
            new APIResponse(200, [], "No Pending revisions")
        )
    }

    return res.status(200).json(
        new APIResponse(200, pendingRevisions, "All pending revisions fetched successfully")
    )
})

const deleteTask = asyncHandler(async (req, res) => {
    const creator = req.user?._id

    const { taskId } = req.body

    if (!creator) {
        throw new APIError(400, "Creator ID required")
    }

    if (!taskId) {
        throw new APIError(400, "task ID required")
    }

    const task = await Task.findById(taskId)

    if (!task) {
        throw new APIError(400, "No such task exists")
    }

    if (task.creator.toString() === creator.toString()) {
        const deletedTask = await Task.findByIdAndDelete(taskId)

        if (!deletedTask) {
            throw new APIError(500, "Some error while deleting task")
        }

        const user = await User.findById(creator);

        user.taskCount = Math.max(0, user.taskCount - 1);
        await user.save({ validateBeforeSave: false })

        return res.status(200).json(
            new APIResponse(200, "Task deleted successfully")
        )
    }

    return res.status(401).json(
        new APIResponse(401, "Unauthorised user, task not deleted")
    )
})


export {
    createTask,
    getTodaysRevision,
    getAllPendingRevision,
    getAllUpcomingRevision,
    completeRevision,
    deleteTask,

}




