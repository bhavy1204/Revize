import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.use(cookieParser());

// Routes
import healthCheckRouter from "./src/routes/HealthCheck.route.js";
import taskRouter from "./src/routes/task.route.js"
import userRouter from "./src/routes/user.route.js"
import utilityRouter from "./src/routes/utility.route.js"

// Routes Declaration
app.use("api/v1/healthCheck", healthCheckRouter);
app.use("api/v1/task", taskRouter)
app.use("api/v1/user", userRouter)
app.use("api/v1/utility", utilityRouter)

export { app };

