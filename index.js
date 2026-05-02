import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const port = process.env.PORT || 3000;

const server = express();

server.get("/health", (req, res) => {
  res.json({ status: "ok", service: "taskflow" });
});

server.listen(port, () => {
  console.log(`TaskFlow API listening on port ${port}`);
});
