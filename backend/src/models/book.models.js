import mongoose, { Schema } from "mongoose";

const bookSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Book Title is required"],
      trim: true,
    },
    author: {
      type: String,
      required: [true, "Book Author is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Book Description is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Book Price is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Book Quantity is required"],
    },
    availability: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true, minimize: false }
);

const BookModel = mongoose.models.Book || mongoose.model("Book", bookSchema);

export default BookModel;
