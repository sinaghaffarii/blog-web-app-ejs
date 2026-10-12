import express from "express";
import { loginUserController, registerUserController } from "../controller/auth.controller.js";
import { forgetPasswordController } from "../controller/forget-password.controller.js";
import { resetPasswordController } from "../controller/reset-password.controller.js";

const router = express.Router();

// ============================================ LOGIN
router.get("/login", (req, res) => {
  res.render("login", {
    title: "login",
    error: null,
  });
});
router.post("/login", loginUserController);

// ============================================ REGISTER
router.get("/register", (req, res) => {
  res.render("register", {
    title: "register",
    error: null,
  });
});
router.post("/register", registerUserController);

// ============================================ RESET PASSWORD
router.get("/reset-password", (req, res) => {
  res.render("reset-password", {
    title: "reset-password",
    error: null,
  });
});
router.post("/reset-password", forgetPasswordController);

// ============================================ NEW PASSWORD
router.get("/new-password/:token", (req, res) => {
  const { token } = req.params;

  res.render("new-password", {
    token,
    error: null,
    message: null,
  });
});
router.post("/new-password/:token", resetPasswordController);

export default router;
