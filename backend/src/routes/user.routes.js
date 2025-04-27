import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  getAllUsers,
  registerNewAdmin,
} from "../controllers/user.controller.js";

// route config
const router = Router();

// get all users route
router.route("/all-users").get(verifyJWT, isAdmin("Admin"), getAllUsers);

// register admin route
router
  .route("/register/new-admin")
  .post(verifyJWT, isAdmin("Admin"), registerNewAdmin);

export default router;
