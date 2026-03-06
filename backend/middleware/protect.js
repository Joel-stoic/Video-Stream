import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let decoded;
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        return res.status(401).json({ message: "Invalid token" });
      }

      if (!refreshToken) {
        return res.status(401).json({ message: "Session expired" });
      }

      const refreshDecoded = jwt.verify(
        refreshToken,
        process.env.JWT_REFRESH_SECRET
      );

      const newAccessToken = jwt.sign(
        { id: refreshDecoded.id },
        process.env.JWT_SECRET,
        { expiresIn: "15m" }
      );

      res.cookie("accessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 15 * 60 * 1000,
      });

      decoded = { id: refreshDecoded.id };
    }

    const user = await User.findById(decoded.id)
      .select("_id email role isActive")
      .lean();

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    logger.error({ error }, "Protect middleware failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};