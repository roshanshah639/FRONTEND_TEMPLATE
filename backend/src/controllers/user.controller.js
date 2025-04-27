import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import UserModel from "../models/user.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const getAllUsers = asyncHandler(async (req, res) => {
  // get all books
  const users = await UserModel.find({ accountVerified: true });

  // if no books found
  if (users.length === 0) {
    throw new ApiError(404, "No users found to display.");
  }

  // return the success response
  return res
    .status(200)
    .json(new ApiResponse(200, users, "All Users fetched successfully."));
});

const registerNewAdmin = asyncHandler(async (req, res) => {
  // check if files are present in request
  if (!req.files || !req.files.avatar) {
    throw new ApiError(400, "Avatar image is required");
  }

  // Extract details from request/frontend
  const { name, email, password } = req.body;

  // Validate required fields
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name, email, and password are required");
  }

  // Check if user already exists
  const existingUser = await UserModel.findOne({
    email,
    accountVerified: true,
  });

  // throw error if user already exists
  if (existingUser) {
    throw new ApiError(
      400,
      "User already exists with this email. Please use another email or login"
    );
  }

  // Get avatar file
  const avatarFile = req.files.avatar;
  const allowedFormats = ["image/jpeg", "image/png", "image/jpg", "image/webp"];

  // Validate avatar file format
  if (!avatarFile.mimetype || !allowedFormats.includes(avatarFile.mimetype)) {
    if (avatarFile.tempFilePath) {
      try {
        fs.unlinkSync(avatarFile.tempFilePath); // Clean up temp file
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }
    throw new ApiError(
      400,
      "Avatar image must be in JPEG, PNG, JPG, or WebP format"
    );
  }

  try {
    // Upload avatar to Cloudinary
    const avatar = await uploadOnCloudinary(avatarFile.tempFilePath);

    // Check if upload was successful
    if (!avatar || !avatar.public_id || !avatar.secure_url) {
      throw new ApiError(500, "Failed to upload avatar image to Cloudinary");
    }

    // Create new admin
    const newAdmin = await UserModel.create({
      name,
      email,
      password,
      role: "Admin",
      accountVerified: true,
      avatar: {
        public_id: avatar.public_id,
        url: avatar.secure_url,
      },
    });

    // Find created admin, exclude sensitive fields
    const createdAdmin = await UserModel.findById(newAdmin._id).select(
      "-password -refreshToken"
    );

    // Return success response
    return res
      .status(201)
      .json(
        new ApiResponse(201, createdAdmin, "Admin registered successfully")
      );
  } catch (error) {
    // Clean up temp file if it exists
    if (avatarFile?.tempFilePath) {
      try {
        fs.unlinkSync(avatarFile.tempFilePath);
      } catch (cleanupError) {
        console.error("Error cleaning up temp file:", cleanupError);
      }
    }

    // Throw appropriate error
    throw new ApiError(
      error.statusCode || 500,
      error.message || "Failed to register new admin"
    );
  }
});

export { getAllUsers, registerNewAdmin };
