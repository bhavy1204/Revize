import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";
import dotenv from "dotenv"

const app = express();

dotenv.config()

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

// Routes
import healthCheckRouter from "./src/routes/HealthCheck.route.js";
import taskRouter from "./src/routes/task.route.js"
import userRouter from "./src/routes/user.route.js"
import utilityRouter from "./src/routes/utility.route.js"
import notificationRouter from "./src/routes/notification.route.js"
import exetensionROuter from "./src/routes/extension.routes.js"

// Routes Declaration
app.use("/api/v1/healthCheck", healthCheckRouter);
app.use("/api/v1/auth", exetensionROuter)
app.use("/api/v1/task", taskRouter)
app.use("/api/v1/user", userRouter)
app.use("/api/v1/utility", utilityRouter)
app.use("/api/v1/notification", notificationRouter)

app.use(express.static("public"));

app.use((err, req, res, next) => {
    console.error(err);
    res.status(err.status || 500).json({ message: err.message || "Internal Server Error" });
});

export { app };


// I actually think your current approach (generate **30 upfront**) is the weakest of the three.

// Let's compare them.

// ## Option 1: Generate 30 once (current)

// **Pros**

// * No waiting during revisions.
// * Only one AI call.

// **Cons**

// * ❌ You pay for all 30 even if the user quits after Revision 1.
// * ❌ Topics get repetitive because many tasks don't have enough material for 30 good questions.
// * ❌ If the user comes back months later, they're seeing the exact same question pool.
// * ❌ You're storing a lot of unused data.

// ---

// ## Option 2: Generate 6 every revision

// **Pros**

// * Fresh questions every revision.
// * Questions can increase in difficulty.
// * You only pay for revisions the user actually reaches.

// **Cons**

// * More API calls.
// * User waits 2–5 seconds before every quiz.
// * More failure points if the AI API is down.

// This is good UX, but probably not the most cost-effective.

// ---

// ## Option 3: Generate 10 once, ask 6 randomly ⭐

// I think this is the sweet spot.

// For each task:

// * Generate **10** questions.
// * For Revision 1, randomly pick 6.
// * For Revision 2, pick another random 6.
// * Shuffle the options each time.

// Even if some questions repeat, the user won't remember every option, especially after a week.

// Your API cost drops by **66%** compared to generating 30.

// ---

// ## But here's what I'd build

// I'd make it **lazy**.

// When the task is created:

// ```
// Task
//  └── quizBank = []
// ```

// ### First revision

// User clicks "Take Quiz"

// ```
// quizBank.length == 0
//         ↓
// Generate 10 questions
//         ↓
// Store them
//         ↓
// Ask 6 random
// ```

// ### Second revision

// ```
// quizBank already exists
//         ↓
// Pick another random 6
// ```

// ### If the bank gets too small

// Suppose you've already shown almost everything.

// ```
// Unused questions < 4
//         ↓
// Generate 5 more
//         ↓
// Append to quizBank
// ```

// Now your bank grows only when necessary.

// ---

// ## Even smarter

// You don't even need to remember which questions were shown.

// Store:

// ```js
// quizBank: [
//   { question, options, answer },
//   ...
// ]
// ```

// Then on every revision:

// ```js
// const quiz = shuffle(quizBank).slice(0, 6);
// ```

// Because revisions are days apart, it's perfectly fine if one or two questions repeat. That's actually beneficial for spaced repetition.

// ---

// ## Another improvement

// Instead of asking the AI for:

// > "Generate 30 MCQs"

// Ask for:

// > "Generate the 10 most conceptually different MCQs covering the important ideas."

// The quality will be much higher than stretching to 30.

// ---

// ### My recommendation

// I'd go with this architecture:

// * ✅ Generate **10 questions only when the first quiz starts** (not at task creation).
// * ✅ Save them in MongoDB.
// * ✅ For each revision, randomly select **6**.
// * ✅ If the bank ever gets too small (or you later want more variety), generate **5–10 additional** questions and append them.

// That gives you:

// * Much lower API costs.
// * Better question quality.
// * Faster task creation.
// * Less wasted generation for abandoned tasks.
// * A simple implementation that you can evolve later without changing your data model.

// It's a nice balance between cost, user experience, and implementation complexity.

