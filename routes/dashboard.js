import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { getDashboard } from "../services/dashboard.js";

const router = express.Router();

router.get("/", protect, getDashboard);

export default router;
