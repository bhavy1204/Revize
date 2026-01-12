import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";

const exportPrintableRevisions = asyncHandler(async (req, res) => {
    const creator = req.user?._id;

    if (!creator) {
        throw new APIError(400, "Creator ID required");
    }

    const tasks = await Task.find({
        creator,
        revisions: {
            $elemMatch: {
                completedAt: null
            }
        }
    }).select("heading link revisions");

    const printableData = tasks.map((task) => {
        const pendingRevisions = task.revisions
            .filter((rev) => rev.completedAt === null)
            .map((rev) => ({
                scheduledAt: rev.scheduledAt
            }));

        return {
            heading: task.heading,
            link: task.link || null,
            revisions: pendingRevisions
        };
    });

    return res.status(200).json(
        new APIResponse(200, printableData, "Printable revision list generated")
    );
});

export {exportPrintableRevisions}
