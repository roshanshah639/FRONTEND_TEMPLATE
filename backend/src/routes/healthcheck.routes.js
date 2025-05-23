import { Router } from "express";
import { healthcheck } from "../controllers/healthcheck.controller.js";

// route config
const router = Router();

// health check route
router.route("/").get(healthcheck);

export default router;
