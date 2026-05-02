import express from "express";
import jwt from "jsonwebtoken";

const router = express.Router();

// Authentication free routes

// setup middleware to get JWT Bearer token from Authorization header
router.use((req, res, next) => {
    const authHeader = req.headers["authorization"];

    // if not auth header, we error 401
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Invalid token" });
    }

    const token = authHeader.substring(7);

    // read JWT and extract user info and verify signature
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) {
            console.error("JWT verification failed:", err);
            return res.status(401).json({ error: "Invalid token" });
        }
        // attach user info to request object
        req.user = decoded;
        return next();
    });
});

// Authenticated routes

export default router;