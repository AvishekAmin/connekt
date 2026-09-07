import "dotenv/config";
import express from "express";
import { createServer } from "node:http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";

const app = express();
const server = createServer(app);
const io = new Server(server);

app.set("port", (process.env.PORT || 8080));

app.get("/home", (req, res) => {
    return res.json({"hello": "World"})
});

const start = async () => {
    const connectionDb = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MONGO connected DB Host: ${connectionDb.connection.host}`);

    server.listen(app.get("port"), () => {
        console.log(`Server is listening on port ${app.get("port")}`);
    });
}

start();