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

    // Colors
    const COLORS = {
        heading: "#18181b",      // neutral-900
        subtext: "#71717a",      // neutral-500
        accent: "#7c3aed",       // violet-600
        border: "#e4e4e7",       // neutral-200
        link: "#2563eb",         // blue-600
        badgeBg: "#ede9fe",      // violet-100
        badgeText: "#6d28d9",    // violet-700
        emptyText: "#16a34a"     // green-600
    };

    // Create PDF
    const doc = new PDFDocument({
        margin: 50,
        size: "A4",
        bufferPages: true
    });

    // Headers
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
        "Content-Disposition",
        'attachment; filename="revisions.pdf"'
    );

    doc.pipe(res);

    const pageWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;

    // ---------- Title block ----------
    doc
        .fontSize(22)
        .fillColor(COLORS.heading)
        .font("Helvetica-Bold")
        .text("Pending Revisions", { align: "left" });

    doc
        .fontSize(10)
        .fillColor(COLORS.subtext)
        .font("Helvetica")
        .text(
            `Generated on ${new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
            })}  •  ${printableData.length} task${printableData.length === 1 ? "" : "s"}`,
            { align: "left" }
        );

    doc.moveDown(0.6);

    // divider under title
    doc
        .moveTo(doc.page.margins.left, doc.y)
        .lineTo(doc.page.margins.left + pageWidth, doc.y)
        .lineWidth(1.5)
        .strokeColor(COLORS.accent)
        .stroke();

    doc.moveDown(1.2);

    // ---------- Body ----------
    printableData.forEach((task, index) => {
        // Keep a task's block together where possible
        const estimatedHeight = 60 + task.revisions.length * 16;
        if (doc.y + estimatedHeight > doc.page.height - doc.page.margins.bottom) {
            doc.addPage();
        }

        // Task heading row
        doc
            .fontSize(13)
            .fillColor(COLORS.heading)
            .font("Helvetica-Bold")
            .text(`${index + 1}.  ${task.heading}`, { continued: false });

        // Link (if any)
        if (task.link) {
            doc
                .fontSize(9.5)
                .font("Helvetica")
                .fillColor(COLORS.link)
                .text(task.link, {
                    link: task.link,
                    underline: true
                });
        }

        doc.moveDown(0.4);

        // Revisions
        if (task.revisions.length === 0) {
            doc
                .fontSize(10.5)
                .font("Helvetica-Oblique")
                .fillColor(COLORS.emptyText)
                .text("No pending revisions 🎉");
        } else {
            task.revisions.forEach((rev, i) => {
                const dateStr = new Date(rev.scheduledAt).toLocaleString("en-US", {
                    dateStyle: "medium",
                    timeStyle: "short"
                });

                const startX = doc.page.margins.left + 12;
                const y = doc.y;

                // small violet dot bullet
                doc
                    .circle(startX, y + 5, 2)
                    .fillColor(COLORS.accent)
                    .fill();

                doc
                    .fontSize(10.5)
                    .font("Helvetica")
                    .fillColor(COLORS.heading)
                    .text(`Revision ${i + 1}`, startX + 12, y, { continued: true })
                    .font("Helvetica")
                    .fillColor(COLORS.subtext)
                    .text(`   —   ${dateStr}`);
            });
        }

        doc.moveDown(0.6);

        // light divider between tasks (skip after last)
        if (index !== printableData.length - 1) {
            doc
                .moveTo(doc.page.margins.left, doc.y)
                .lineTo(doc.page.margins.left + pageWidth, doc.y)
                .lineWidth(0.75)
                .strokeColor(COLORS.border)
                .stroke();
            doc.moveDown(0.8);
        }
    });

    // ---------- Footer with page numbers ----------
    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i);

        // Temporarily zero the bottom margin — writing inside the margin
        // area otherwise makes PDFKit think the content overflows and it
        // silently adds a new page.
        const originalBottomMargin = doc.page.margins.bottom;
        doc.page.margins.bottom = 0;

        doc
            .fontSize(8.5)
            .fillColor(COLORS.subtext)
            .font("Helvetica")
            .text(
                `Revize  •  Page ${i + 1} of ${range.count}`,
                doc.page.margins.left,
                doc.page.height - originalBottomMargin + 10,
                { align: "center", width: pageWidth }
            );

        doc.page.margins.bottom = originalBottomMargin;
    }

    doc.end();
});

export { exportPrintableRevisions }
