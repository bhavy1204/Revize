import dotenv from "dotenv"
dotenv.config({ path: "./env" });

import connectDB from "./src/db/index.js";
import { app } from "./app.js";

connectDB()
    .then(() => {
        app.on("error", (err) => {
            console.error("Express Error => ", err);
        });
        app.listen(process.env.PORT || 3000, () => {
            console.log("Server Up and running at port ", (process.env.PORT || 3000));
        })
    }).catch((err) => {
        console.error("Connection error > ", err);
    })


