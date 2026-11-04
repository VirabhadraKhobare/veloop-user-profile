const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authCookieName = "veloop_token";

function getTokenFromRequest(req) {
  return req.cookies?.[authCookieName];
}

async function requireAuth(req, res, next) {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub);

    if (!user || user.status !== "active") {
      return res.status(401).json({
        success: false,
        message: "Account is unavailable",
      });
    }

    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired authentication token",
    });
  }
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ success: false, message: "Administrator access required" });
  }
  return next();
}

function signToken(userId) {
  return jwt.sign({ sub: userId.toString() }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

function setAuthCookie(res, token) {
  res.cookie(authCookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

module.exports = {
  authCookieName,
  requireAuth,
  requireAdmin,
  setAuthCookie,
  signToken,
};
