import mongoose from "mongoose";
import dotenv from "dotenv"

const connectDB = async () =>{
    try {
        dotenv.config()
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}`);
        console.log("MongoDB connected successfully > ", connectionInstance.connection.host);
    } catch (error) {
        console.error("Mongo Connection error > ", error);
        process.exit(1);
    }
}

export default connectDB;