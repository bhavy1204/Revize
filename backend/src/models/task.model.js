import mongoose from "mongoose";

const revisionSchema = new mongoose.Schema({
    scheduledAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    }
}, { _id: false });

const taskSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    heading: {
        type: String,
        required: true
    },
    link: {
        type: String
    },
    image: {
        type: String
    },
    revisions: {
        type: [revisionSchema],
        required: true
    }
}, { timestamps: true })

taskSchema.index({
    creator:1,
    "revisions.scheduledAt":1,
    "revisions.completedAt":1
})

export const Task = mongoose.model("Task", taskSchema);
