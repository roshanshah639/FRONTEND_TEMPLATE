import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import UserModel from "../models/user.models.js";
import { sendVerificationEmail } from "../utils/email.js";
import { generateAccessAndRefreshToken } from "../utils/generateJwtTokens.js";
import { cookiesOptions } from "../constants.js";
import { sendResetPasswordEmail } from "../utils/ResetPasswordemail .js";
import bcryptjs from "bcryptjs";

const registerUser = asyncHandler(async (req, res) => {
  // extract details from request/frontend
  const { name, email, password } = req.body;

  // validations - all fields are required
  if ([name, email, password].some((field) => field?.trim() === "")) {
    throw new ApiError(400, "Name, Email & Password - All fields are required");
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  // if user already exists & is verified
  if (user && user.accountVerified) {
    throw new ApiError(
      400,
      "User already exists with this email. Please use another email or login."
    );
  }

  // generate 6 digits unique verification Code
  const verificationCode = String(Date.now()).slice(-6);

  // if user exists but is not verified
  if (user && !user.accountVerified) {
    // update verification code
    user.verificationCode = verificationCode;
    // set new expiry date of 10 minutes for verification code
    user.verificationCodeExpiry = Date.now() + 10 * 60 * 1000;

    // save user
    await user.save();

    // send verification code to user's email
    await sendVerificationEmail(name, email, verificationCode);

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          "User already exists with this email but account is not verified yet. Please check your email for verification code."
        )
      );
  }

  try {
    // create new user
    const newUser = new UserModel({
      name,
      email,
      password,
      verificationCode,
      verificationCodeExpiry: Date.now() + 10 * 60 * 1000,
    });

    // save user to db
    await newUser.save();

    // send verification code to user's email
    await sendVerificationEmail(name, email, verificationCode);

    // find created user, remove password, refresh token
    const createdUser = await UserModel.findById(newUser?._id).select(
      "-password -refreshToken"
    );

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          createdUser,
          "User registered successfully. Please check your email for verification code."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while registering user. Please try again."
    );
  }
});

const verifyAccount = asyncHandler(async (req, res) => {
  // extract verification code from request/frontend
  const { verificationCode } = req.body;

  // validation - all fields are required
  if (!verificationCode) {
    throw new ApiError(400, "Verification Code is required");
  }

  // find user by verification code
  const user = await UserModel.findOne({ verificationCode }).select(
    "-password -refreshToken -verificationCode"
  );

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "Invalid verification code. Please enter correct code or Sign up again to get a new code."
    );
  }

  // if verification code is expired
  if (user.verificationCodeExpiry < Date.now()) {
    throw new ApiError(
      400,
      "Verification code has expired. Please sign up again to get a new code."
    );
  }

  try {
    // update user
    user.accountVerified = true;
    user.verificationCode = "";
    user.verificationCodeExpiry = "";

    // save user
    await user.save({ validateModifiedOnly: true });

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          user,
          "Account verified successfully. Please login."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while verifying account. Please try again"
    );
  }
});

const loginUser = asyncHandler(async (req, res) => {
  // extract email & password from request/frontend
  const { email, password } = req.body;

  // validations - all fields are required
  if (!email || !password) {
    throw new ApiError(400, "Email & Password - All fields are required");
  }

  // find user by email
  const user = await UserModel.findOne({ email });

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "User does not exist with this email. Please enter correct email or Sign up."
    );
  }

  // if user is not verified
  if (!user.accountVerified) {
    throw new ApiError(
      400,
      "Account not verified yet. Please verify your account before login."
    );
  }

  // check if password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  // if password is incorrect
  if (!isPasswordValid) {
    throw new ApiError(400, "Incorrect email or password. Please try again.");
  }

  try {
    // generate access token & refresh token
    const { accessToken, refreshToken } = await generateAccessAndRefreshToken(
      user?._id
    );

    // find the logged in user and remove password, refresh token
    const loggedInUser = await UserModel.findById(user?._id).select(
      "-password -refreshToken"
    );

    // return the success response
    return res
      .status(200)
      .cookie("accessToken", accessToken, cookiesOptions)
      .cookie("refreshToken", refreshToken, cookiesOptions)
      .json(
        new ApiResponse(
          200,
          { user: loggedInUser, accessToken, refreshToken },
          "User logged in successfully."
        )
      );
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while logging in user. Please try again."
    );
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  // find user by id & delete refresh token
  await UserModel.findByIdAndUpdate(
    req.user?._id,
    {
      $unset: {
        refreshToken: 1,
      },
    },
    {
      new: true,
    }
  );

  // return the success response
  return res
    .status(200)
    .clearCookie("accessToken", cookiesOptions)
    .clearCookie("refreshToken", cookiesOptions)
    .json(new ApiResponse(200, {}, "User logged out successfully."));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  // get current logged in user
  const user = await UserModel.findById(req.user?._id).select(
    "-password -refreshToken"
  );

  // if user not found
  if (!user) {
    throw new ApiError(404, "User not found.");
  }

  // return the success response
  return res
    .status(200)
    .json(
      new ApiResponse(200, user, "Current Logged in user fetched successfully.")
    );
});

const forgotPassword = asyncHandler(async (req, res) => {
  // extract email from request/frontend
  const { email } = req.body;

  // validations - all fields are required
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // find user by email
  const user = await UserModel.findOne({ email, accountVerified: true });

  // if user not found
  if (!user) {
    throw new ApiError(
      400,
      "User does not exist with this email. Please enter correct email or Sign up."
    );
  }

  // generate reset password token
  const resetPasswordToken = String(Date.now()).slice(-6);

  // hash reset password token
  const hashedResetPasswordToken = await bcryptjs.hash(resetPasswordToken, 10);

  // update reset password token
  user.resetPasswordToken = hashedResetPasswordToken;
  // user.resetPasswordToken = resetPasswordToken;

  // set new expiry date of 10 minutes for reset password token
  user.resetPasswordTokenExpiry = Date.now() + 10 * 60 * 1000;

  // save user
  await user.save({ validateBeforeSave: false });

  // generate reset password url
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${encodeURIComponent(hashedResetPasswordToken)}`;
  // const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetPasswordToken}`;

  // generate message
  const message = resetPasswordUrl;

  try {
    // send email
    await sendResetPasswordEmail(user.name, user.email, message);

    // return the success response
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          {},
          `Reset Password Link sent to ${user.email}. Please check your email.`
        )
      );
  } catch (error) {
    // delete reset password token
    user.resetPasswordToken = "";
    user.resetPasswordTokenExpiry = "";

    // save user
    await user.save({ validateBeforeSave: false });

    // throw error response
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while sending password reset email. Please try again."
    );
  }
});

const resetPassword = asyncHandler(async (req, res) => {
  // Extract reset password token from params
  const { token } = req.params;

  // Extract new password and confirm password from body
  const { newPassword, confirmPassword } = req.body;

  // Validate required fields
  if (!token || !newPassword || !confirmPassword) {
    throw new ApiError(
      400,
      "Token, new password, and confirm password are required"
    );
  }

  // Validate password match
  if (newPassword !== confirmPassword) {
    throw new ApiError(400, "New password and confirm password do not match");
  }

  try {
    // Find user by hashed reset token and valid expiry
    const user = await UserModel.findOne({
      resetPasswordToken: token,
      resetPasswordTokenExpiry: { $gt: Date.now() },
    });

    if (!user) {
      throw new ApiError(400, "Invalid or expired reset password token");
    }

    // if new password is same as previous password
    if (await user.isPasswordCorrect(newPassword)) {
      throw new ApiError(
        400,
        "New password cannot be same as previous password. Please enter a different password."
      );
    }

    // Update user with new password and clear reset token
    user.password = newPassword;
    user.resetPasswordToken = "";
    user.resetPasswordTokenExpiry = "";

    // Save updated user
    await user.save({ validateBeforeSave: false });

    // Return success response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password reset successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to reset password");
  }
});

const updatePassword = asyncHandler(async (req, res) => {
  // extract old password & new password from request/frontend
  const { currentPassword, newPassword } = req.body;

  // validations - all fields are required
  if (!currentPassword || !newPassword) {
    throw new ApiError(400, "All fields are required");
  }

  // find user by id
  const user = await UserModel.findById(req.user._id);

  // if user not found
  if (!user) {
    throw new ApiError(404, "User not found");
  }

  // check if current password is correct
  const isPasswordCorrect = await user.isPasswordCorrect(currentPassword);

  // if password is not correct
  if (!isPasswordCorrect) {
    throw new ApiError(
      400,
      "Current password is incorrect. Please enter correct password."
    );
  }

  // check if new password is same as previous password
  if (await user.isPasswordCorrect(newPassword)) {
    throw new ApiError(
      400,
      "New password cannot be same as previous password. Please enter a different password."
    );
  }

  try {
    // update password
    user.password = newPassword;

    // save user
    await user.save({ validateBeforeSave: false });

    // return success response
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Password updated successfully"));
  } catch (error) {
    throw new ApiError(500, error.message || "Failed to update password");
  }
});

export {
  registerUser,
  verifyAccount,
  loginUser,
  logoutUser,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  updatePassword,
};
