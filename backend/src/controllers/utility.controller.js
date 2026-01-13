import { Task } from "../models/task.model.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { APIResponse } from "../utils/APIResponse.js";
import { APIError } from "../utils/APIError.js";
import PDFDocument from "pdfkit"

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

    // Create PDF
    const doc = new PDFDocument({
        margin: 40,
        size: "A4"
    });

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        'attachment; filename="revisions.pdf"'
    );

    // Pipe PDF → response
    doc.pipe(res);

    // Title
    doc
        .fontSize(24)
        .text("Pending Revisions", { align: "center" });

    doc.moveDown(1.5);

    // Body
    printableData.forEach((task, index) => {
        doc
            .fontSize(14)
            .text(`${index + 1}. ${task.heading}`, {
                underline: true
            });

        if (task.link) {
            doc
                .fontSize(11)
                .fillColor("blue")
                .text(task.link, {
                    link: task.link
                })
                .fillColor("black");
        }

        doc.moveDown(0.5);

        if (task.revisions.length === 0) {
            doc
                .fontSize(11)
                .text("No pending revisions 🎉");
        } else {
            task.revisions.forEach((rev, i) => {
                doc
                    .fontSize(11)
                    .text(
                        `• Revision ${i + 1}: ${new Date(
                            rev.scheduledAt
                        ).toLocaleString()}`
                    );
            });
        }

        doc.moveDown();
    });

    // Finish PDF
    doc.end();
});

export { exportPrintableRevisions }
