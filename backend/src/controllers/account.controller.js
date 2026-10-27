import * as authService from "../services/auth.service.js";
import * as productService from "../services/product.service.js";
import { validateName, validatePassword } from "../utils/userValidation.js";

export const updateProfile = async (req, res) => {
  try {
    const { name } = req.body ?? {};
    const validationError = validateName(name);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const user = await authService.updateUserName(req.user.id, name);

    return res.status(200).json({ user: authService.toPublicUser(user) });
  } catch (error) {
    console.error("Failed to update profile:", error);

    return res.status(500).json({ message: "Failed to update profile" });
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body ?? {};

    if (typeof currentPassword !== "string" || !currentPassword) {
      return res
        .status(400)
        .json({ message: "Current password is required." });
    }

    const validationError = validatePassword(newPassword);

    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    if (!(await authService.passwordMatches(req.user, currentPassword))) {
      return res
        .status(400)
        .json({ message: "Current password is incorrect." });
    }

    if (await authService.passwordMatches(req.user, newPassword)) {
      return res.status(400).json({
        message: "New password must be different from the current one.",
      });
    }

    await authService.updateUserPassword(req.user.id, newPassword);

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to change password:", error);

    return res.status(500).json({ message: "Failed to change password" });
  }
};

export const listMyProducts = async (req, res) => {
  try {
    const products = await productService.listProductsForUser(req.user.id);

    return res.status(200).json({ products });
  } catch (error) {
    console.error("Failed to list products:", error);

    return res.status(500).json({ message: "Failed to list products" });
  }
};

export const removeMyProduct = async (req, res) => {
  try {
    const productId = Number(req.params.productId);

    if (!Number.isInteger(productId)) {
      return res.status(400).json({ message: "productId must be an integer" });
    }

    const removed = await productService.unlinkProductFromUser(
      req.user.id,
      productId,
    );

    if (removed === 0) {
      return res.status(404).json({ message: "Product not found" });
    }

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to remove product:", error);

    return res.status(500).json({ message: "Failed to remove product" });
  }
};

// Requires the password again, so an unattended logged-in browser can't be
// used to wipe the account.
export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body ?? {};

    if (
      typeof password !== "string" ||
      !(await authService.passwordMatches(req.user, password))
    ) {
      return res.status(400).json({ message: "Password is incorrect." });
    }

    await authService.deleteUser(req.user.id);
    authService.clearAuthCookie(res);

    return res.status(204).send();
  } catch (error) {
    console.error("Failed to delete account:", error);

    return res.status(500).json({ message: "Failed to delete account" });
  }
};
