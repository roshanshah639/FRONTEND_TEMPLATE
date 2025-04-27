import { Router } from "express";
import { isAdmin, verifyJWT } from "../middlewares/auth.middleware.js";
import {
  borrowedBook,
  getBorrowedBooksForAdmin,
  recordBorrowedBook,
  returnBorrowBook,
} from "../controllers/borrow.controller.js";

// route config
const router = Router();

// record borrow book route
router
  .route("/record-borrow-book/:id")
  .post(verifyJWT, isAdmin("Admin"), recordBorrowedBook);

// return borrow book route
router
  .route("/return-borrowed-book/:bookId")
  .put(verifyJWT, isAdmin("Admin"), returnBorrowBook);

// get borrowed books for admin route
router
  .route("/borrowed-books-by-user")
  .get(verifyJWT, isAdmin("Admin"), getBorrowedBooksForAdmin);

// get borrowed boks for user route
router.route("/my-borrowed-books").get(verifyJWT, borrowedBook);

export default router;
