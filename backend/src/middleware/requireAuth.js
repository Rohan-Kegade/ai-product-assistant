import * as authService from "../services/auth.service.js";

// Rejects the request with 401 unless it carries a valid session cookie for
// an existing user; otherwise sets `req.user`.
export async function requireAuth(req, res, next) {
  try {
    const userId = authService.verifyToken(
      req.cookies?.[authService.AUTH_COOKIE_NAME],
    );
    const user = userId ? await authService.findUserById(userId) : null;

    if (!user) {
      return res.status(401).json({ message: "Please log in to continue." });
    }

    req.user = user;
    return next();
  } catch (error) {
    console.error("Authentication check failed:", error);

    return res.status(500).json({ message: "Failed to check authentication" });
  }
}
