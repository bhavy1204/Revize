import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
    question: {
        type: String,
        required: true
    },
    options: {
        type: [String], required: true
    },
    correctIndex: {
        type: Number, required: true
    },
    used: {
        type: Boolean, default: false
    }
}, { _id: true });

const revisionSchema = new mongoose.Schema({
    scheduledAt: {
        type: Date,
        required: true
    },
    completedAt: {
        type: Date,
        default: null
    },
    quiz: {
        questionIds: [{
            type: mongoose.Schema.Types.ObjectId
        }],
        answers: [{
            questionId: mongoose.Schema.Types.ObjectId,
            selectedIndex: Number, isCorrect: Boolean
        }],
        score: {
            type: Number,
            default: null
        },
        passed: {
            type: Boolean,
            default: null
        }
    }
}, { _id: false });

const taskSchema = new mongoose.Schema({
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    type:{
        type:String,
        enum:['regular','leetcode']
    },
    heading: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    link: {
        type: String
    },
    document: {
        url: String,
        publicId: String
    },
    revisions: {
        type: [revisionSchema],
        required: true
    },
    questionBank: {
        type: [questionSchema],
        default: []
    },
    questionBankGenerated: {
        type: Boolean,
        default: false
    }
}, { timestamps: true })

taskSchema.index({
    creator: 1,
    "revisions.scheduledAt": 1,
    "revisions.completedAt": 1
})

export const Task = mongoose.model("Task", taskSchema);
