import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  addBook,
  deleteBook,
  getAllBooks,
} from "../controllers/book.controller.js";

// route config
const router = Router();

// add book route
router.route("/admin/add-book").post(verifyJWT, isAdmin("Admin"), addBook);

// get all books route
router.route("/all-books").get(verifyJWT, getAllBooks);

// delete book route
router
  .route("/admin/delete-book/:id")
  .delete(verifyJWT, isAdmin("Admin"), deleteBook);

export default router;
