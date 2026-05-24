import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import routes from "./routes/index.js";



dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const port = process.env.PORT || 3000;

const server = express();
server.use(express.json());

server.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "taskflow" });
});

server.use(express.static("frontend"));
server.use("/api", routes);



server.listen(port, () => {
  console.log(`TaskFlow API listening on port ${port}`);
});
