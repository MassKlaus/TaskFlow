import jwt from "jsonwebtoken";
import User from "../db/user.js";

export const protect = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // fix: changed decoded.userId in auth middleware instead of decoded.id
    const user = await User.findById(decoded.userId).select("-passwordHash");

    if (!user) {
      return res
        .status(401)
        .json({ message: "Not authorized, user not found" });
    }

    // fix: resolve userId mismatch in auth middleware causing project ownership and lookup issues
    req.user = {
      userId: user._id.toString(),
      email: user.email
    };
    next();
  } catch (error) {
    console.error("Token verification error:", error);
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};
