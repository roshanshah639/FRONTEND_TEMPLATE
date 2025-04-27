import mongoose, { Schema } from "mongoose";

const borrowSchema = new Schema(
  {
    user: {
      id: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: {
        type: String,
        required: [true, "Borrow User Name is required"],
      },
      email: {
        type: String,
        required: [true, "Borrow User Email is required"],
      },
    },
    price: {
      type: Number,
      required: [true, "Borrow Price is required"],
    },
    book: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    borrowDate: {
      type: Date,
      default: Date.now,
    },
    dueDate: {
      type: Date,
      required: true,
    },
    returnDate: {
      type: Date,
      default: null,
    },
    fine: {
      type: Number,
      default: 0,
    },
    notified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, minimize: false }
);

const BorrowModel =
  mongoose.models.Borrow || mongoose.model("Borrow", borrowSchema);

export default BorrowModel;
