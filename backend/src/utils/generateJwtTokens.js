import UserModel from "../models/user.models.js";
import { ApiError } from "./ApiError.js";

const generateAccessAndRefreshToken = async (userId) => {
  try {
    // find user by id
    const user = await UserModel.findById(userId);

    // if user not found
    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // generate access token
    const accessToken = user.generateAccessToken();
    // generate refresh token
    const refreshToken = user.generateRefreshToken();

    // save refresh token to db
    user.refreshToken = refreshToken;

    // save user
    await user.save({ validateBeforeSave: false });

    // return the access & refresh token
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      error.message ||
        "Something went wrong while generating access or refresh token."
    );
  }
};

export { generateAccessAndRefreshToken };
