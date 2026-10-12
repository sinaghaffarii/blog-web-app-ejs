import express from "express";
import { profileController, getUserListController } from "../controller/user.controller.js";

const router = express.Router();

router.get("/list", getUserListController);

router.get("/profile", profileController);

export default router;
