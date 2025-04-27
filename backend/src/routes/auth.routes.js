import { Router } from "express";
import {
  forgotPassword,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  resetPassword,
  updatePassword,
  verifyAccount,
} from "../controllers/auth.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

// route config
const router = Router();

// register user
router.route("/register").post(registerUser);

// verify account route
router.route("/verify-account").post(verifyAccount);

// login user route
router.route("/login").post(loginUser);

// logout user route
router.route("/logout").post(verifyJWT, logoutUser);

// get current logged in user route
router.route("/current-user").get(verifyJWT, getCurrentUser);

// forgot password
router.route("/password/forgot").post(forgotPassword);

// reset password
router.route("/password/reset/:token").patch(resetPassword);

// reset password
router.route("/password/update").patch(verifyJWT, updatePassword);

export default router;
