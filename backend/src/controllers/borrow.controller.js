import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import BorrowModel from "../models/borrow.models.js";
import BookModel from "../models/book.models.js";
import UserModel from "../models/user.models.js";
import { calculateFine } from "../utils/fineCalculator.js";

const recordBorrowedBook = asyncHandler(async (req, res) => {
  // extract id from request params
  const { id } = req.params;

  // get email from request body
  const { email } = req.body;

  // validations - email is required
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // find book by id
  const book = await BookModel.findById(id);

  // if book not found
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  // find user by email
  const user = await UserModel.findOne({ email, accountVerified: true });

  // if user not found
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // check book quantity
  if (book.quantity === 0) {
    throw new ApiError(400, "Book is not available to borrow");
  }

  // check if user has already borrowed this book
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === id && b.returned === false
  );

  // if user has already borrowed this book & not returned
  if (isAlreadyBorrowed) {
    throw new ApiError(
      400,
      "User has already borrowed this book & not returned yet"
    );
  }

  try {
    // update book quantity
    book.quantity -= 1;
    // update book availability
    book.availability = book.quantity > 0;

    // save book
    await book.save();

    // save book to users borrowed books
    user.borrowedBooks.push({
      bookId: book._id,
      bookTitle: book.title,
      borrowDate: new Date(),
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),

      returned: false,
    });

    // save user
    await user.save();

    // create borrow record
    const borrowRecord = await BorrowModel.create({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
      book: book._id,
      dueDate: new Date(new Date().setDate(new Date().getDate() + 7)),
      // borrowDate: new Date(),
      price: book.price,
    });

    // return success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          borrowRecord,
          "Borrowed Book recorded successfully."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to record borrow book. Please try again later."
    );
  }
});

const returnBorrowBook = asyncHandler(async (req, res) => {
  // extract id from request params
  const { bookId } = req.params;

  // get user email from request body
  const { email } = req.body;

  // find book by id
  const book = await BookModel.findById(bookId);

  // if book not found
  if (!book) {
    throw new ApiError(404, "Book not found");
  }

  // find user by email
  const user = await UserModel.findOne({ email, accountVerified: true });

  // if user not found
  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // check if user has already borrowed this book
  const isAlreadyBorrowed = user.borrowedBooks.find(
    (b) => b.bookId.toString() === bookId && b.returned === false
  );

  // if user has not borrowed this book
  if (!isAlreadyBorrowed) {
    throw new ApiError(400, "User has not borrowed this book yet.");
  }

  try {
    // update return status
    isAlreadyBorrowed.returned = true;
    // save user
    await user.save();

    // update book quantity
    book.quantity += 1;
    // update book availability
    book.availability = book.quantity > 0;
    // save book
    await book.save();

    // fid borrow record
    const borrow = await BorrowModel.findOne({
      book: bookId,
      "user.email": email,
      returnDate: null,
    });

    // if borrow record not found
    if (!borrow) {
      throw new ApiError(
        404,
        "User has not borrowed this book yet. No record found."
      );
    }

    // update return date
    borrow.returnDate = new Date();

    // calculate fine
    const fine = calculateFine(borrow.dueDate);
    borrow.fine = fine;

    // save borrow record
    await borrow.save();

    // return success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          borrow,
          fine !== 0
            ? `Book returned successfully. The total charges including fine are: Rs. ${book.price + fine}. The fine is: Rs. ${fine}`
            : `Book Returned Successfully. The total charges are: Rs. ${book.price}`
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Failed to return book. Please try again later."
    );
  }
});

const borrowedBook = asyncHandler(async (req, res) => {
  // get borrowed books
  const { borrowedBooks } = req.user;

  // if no borrowed books
  if (borrowedBooks.length === 0) {
    throw new ApiError(404, "No borrowed books found");
  }

  // return success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, borrowedBooks, "Borrowed Books Fetched Successfully")
    );
});

const getBorrowedBooksForAdmin = asyncHandler(async (req, res) => {
  // get borrowed books
  const borrowedBooks = await BorrowModel.find();

  // return success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, borrowedBooks, "Borrowed Books Fetched Successfully")
    );
});

export {
  borrowedBook,
  recordBorrowedBook,
  getBorrowedBooksForAdmin,
  returnBorrowBook,
};
