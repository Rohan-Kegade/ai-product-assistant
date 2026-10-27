import * as authService from "../services/auth.service.js";
import { validateName, validatePassword } from "../utils/userValidation.js";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LENGTH = 255;

function validateSignup({ name, email, password }) {
  const nameError = validateName(name);
  if (nameError) return nameError;

  if (
    typeof email !== "string" ||
    email.trim().length > MAX_EMAIL_LENGTH ||
    !EMAIL_PATTERN.test(email.trim())
  ) {
    return "Enter a valid email.";
  }

  return validatePassword(password);
}

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body ?? {};
    const validationError = validateSignup({ name, email, password });

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (await authService.findUserByEmail(email)) {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    const user = await authService.createUser({ name, email, password });
    authService.setAuthCookie(res, user.id);

    return res.status(201).json({ user: authService.toPublicUser(user) });
  } catch (error) {
    // Two signups for the same email raced past the lookup above.
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ message: "An account with this email already exists." });
    }

    console.error("Signup failed:", error);

    return res.status(500).json({ message: "Failed to create account" });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body ?? {};

    if (typeof email !== "string" || typeof password !== "string") {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await authService.verifyCredentials(email, password);

    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    authService.setAuthCookie(res, user.id);

    return res.status(200).json({ user: authService.toPublicUser(user) });
  } catch (error) {
    console.error("Login failed:", error);

    return res.status(500).json({ message: "Failed to log in" });
  }
};

export const logout = (req, res) => {
  authService.clearAuthCookie(res);

  return res.status(204).send();
};

export const getCurrentUser = (req, res) =>
  res.status(200).json({ user: authService.toPublicUser(req.user) });
