import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { checkUserPasswordByEmail, createUser, getUserByEmail } from "../services/user.js";
import jwt from "jsonwebtoken";
const router = express.Router();

// Authentication free routes
router.post("/login", async (req, res) => {
    // handle login and return JWT token
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
    }

    try {
        const user = await checkUserPasswordByEmail(email, password);

        if (!user) {
            return res.status(401).json({ error: "Invalid email or password" });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: "1h" }
        );

        return res.json({ token, user: { user: user._id, email: user.email, fullName: user.fullName } });
    } catch (err) {
        console.error("Login error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.post("/register", async (req, res) => {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
        return res.status(400).json({ error: "Email, password, and full name are required" });
    }

    try {
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: "Email already in use" });
        }

        const newUser = await createUser(email, password, fullName);
        return res.status(201).json({ message: "User registered successfully", user: { email: newUser.email, fullName: newUser.fullName } });
    } catch (err) {
        console.error("Registration error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

router.use(protect)

router.get("/me", async (req, res) => {
    try {
        const user = await getUserByEmail(req.user.email);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        return res.json({ email: user.email, fullName: user.fullName });
    } catch (err) {
        console.error("Profile retrieval error:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});


export default router;