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

    // THIS IS A PLACEHOLDER FOR ACTUAL PDF GENERATION
    // You would typically use a library like 'pdfkit' or 'html-pdf' here
    // For now, we'll send a dummy PDF response to resolve the frontend error
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="revisions.pdf"');
    // Send some dummy binary data that represents a PDF
    res.status(200).send(Buffer.from("%PDF-1.1\n1 0 obj<</Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 0>>endobj%%EOF"));
});

export {exportPrintableRevisions}
