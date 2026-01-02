import express, { urlencoded } from "express";
import cors from "cors"
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
    methods:['GET','POST','PUT','DELETE','PATCH','OPTIONS'],
    allowedHeaders:['Content-Type', 'Authorization']
}))

app.use(express.json({ limit: '5mb' }));

app.use(express.urlencoded({extended:true}));

app.use(express.static("public"));

app.use(cookieParser());

// Routes


// Routes Declaration



export {app};

