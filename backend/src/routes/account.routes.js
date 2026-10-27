import express from "express";
import {
  changePassword,
  deleteAccount,
  listMyProducts,
  removeMyProduct,
  updateProfile,
} from "../controllers/account.controller.js";

const router = express.Router();

router.patch("/profile", updateProfile);
router.put("/password", changePassword);
router.get("/products", listMyProducts);
router.delete("/products/:productId", removeMyProduct);
router.delete("/", deleteAccount);

export default router;
