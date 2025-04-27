import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import BookModel from "../models/book.models.js";

const addBook = asyncHandler(async (req, res) => {
  // extract details from request/frontend
  const { title, author, description, price, quantity } = req.body;

  // validations - all fields are required
  if (!title || !author || !description || !price || !quantity) {
    throw new ApiError(
      400,
      "Title, Author, Description, Price, Quantity - All fields are required"
    );
  }

  // find book by title
  const book = await BookModel.findOne({ title });

  // if book already exists
  if (book) {
    throw new ApiError(
      400,
      "Book already exists with this title. Please use another title."
    );
  }

  try {
    // create new book
    const newBook = await BookModel.create({
      title,
      author,
      description,
      price,
      quantity,
    });

    // return the success response
    return res
      .status(201)
      .json(new ApiResponse(201, newBook, "Book added successfully."));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while adding book. Please try again."
    );
  }
});

const getAllBooks = asyncHandler(async (req, res) => {
  // get all books
  const books = await BookModel.find();

  // if no books found
  if (books.length === 0) {
    throw new ApiError(404, "No books found to display.");
  }

  // return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, books, "All Books fetched successfully."));
});

const deleteBook = asyncHandler(async (req, res) => {
  // extract book id from request/frontend
  const { id } = req.params;

  // find book by id
  const book = await BookModel.findById(id);

  // if book not found
  if (!book) {
    throw new ApiError(404, "Book not found to delete.");
  }

  try {
    // delete book
    const deletedBook = await book.deleteOne();

    // return the success response
    return res
      .status(200)
      .json(new ApiResponse(200, deletedBook, "Book deleted successfully."));
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while deleting book. Please try again."
    );
  }
});

export { addBook, getAllBooks, deleteBook };
