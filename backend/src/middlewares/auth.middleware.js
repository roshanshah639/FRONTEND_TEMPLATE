import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import UserModel from "../models/user.models.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, _, next) => {
  // extract token from request cookies or header
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // if token is not present
  if (!token) {
    throw new ApiError(401, "Unauthenticated");
  }

  try {
    // verify/decode the token
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);

    // find user by id
    const user = await UserModel.findById(decodedToken?._id);

    // if user is not found
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }

    // attach user to request object
    req.user = user;

    // call next middleware
    next();
  } catch (error) {
    throw new ApiError(
      500,
      error.message || "Something went wrong while verifying access token."
    );
  }
});

export const isAdmin = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user?.role)) {
      throw new ApiError(
        403,
        `User with this role: ${req.user.role} is not authorized to access this resource`
      );
    } else {
      next();
    }
  };
};
