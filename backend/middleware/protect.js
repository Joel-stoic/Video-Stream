import jwt from "jsonwebtoken";
import logger from "../config/logger.js";
import User from "../models/User.model.js";

export const protect = async (req, res, next) => {
  try {
    let decoded;
    const accessToken = req.cookies?.accessToken;
    const refreshToken = req.cookies?.refreshToken;

    if (!accessToken) {
      logger.warn("Access token missing");
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      logger.info({ userId: decoded.id }, "Access token verified");
    } catch (err) {
      if (err.name !== "TokenExpiredError") {
        logger.warn("Invalid access token");
        return res.status(401).json({ message: "Invalid token" });
      }

      logger.info("Access token expired, trying refresh token");

      if (!refreshToken) {
        logger.warn("Refresh token missing");
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

      logger.info({ userId: refreshDecoded.id }, "New access token generated");

      decoded = { id: refreshDecoded.id };
    }

    const user = await User.findById(decoded.id)
      .select("_id email role isActive")
      .lean();

    if (!user || !user.isActive) {
      logger.warn({ userId: decoded.id }, "User not found or inactive");
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      role: user.role,
    };

    logger.info({ userId: user._id }, "User authenticated");

    next();
  } catch (error) {
    logger.error({ error }, "Protect middleware failed");
    return res.status(500).json({ message: "Internal server error" });
  }
};